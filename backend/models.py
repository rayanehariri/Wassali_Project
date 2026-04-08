import uuid
import string
from __init__ import users_collection, Role, Status
from pymongo.errors import DuplicateKeyError
from werkzeug.security import check_password_hash, generate_password_hash
from location import get_distance , get_location_info


def crypt_password(password: str) -> str:
    """Hash a password using pbkdf2:sha256 method crypting."""
    return generate_password_hash(password, method="pbkdf2:sha256", salt_length=8)


def has_digit_and_special(password: str) -> bool:
    """Check if password contains at least one digit and one special character."""
    if not isinstance(password, str):
        return False
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in string.punctuation for c in password)
    return has_digit and has_special


def is_strong_password(password: str) -> bool:
    """Validate password strength: minimum 5 chars, with digit and special char."""
    if not isinstance(password, str):
        return False
    return len(password) >= 5 and has_digit_and_special(password)


def unique_email(email: str) -> dict:
    """Check if email is valid and not already registered."""
    if not email or not isinstance(email, str):
        return {"success": False, "message": "email must be a non-empty string"}

    try:
        existing_user = users_collection.find_one({"email": email})
        if existing_user:
            return {"success": False, "message": "email already exists"}
        return {"success": True, "email": email}
    except Exception as e:
        return {"success": False, "message": f"Database error: {str(e)}"}


def verify_users_data(username: str, email: str, password: str) -> None:
    """Validate user registration data."""
    if not username or not isinstance(username, str):
        raise ValueError("Username must be a non-empty string")
    if len(username) < 3:
        raise ValueError(f"Username '{username}' must be at least 3 characters long.")

    if not email or not isinstance(email, str):
        raise ValueError("Email must be a non-empty string")
    if "@" not in email:
        raise ValueError(f"Email '{email}' must contain the @ symbol")
    if not (email.endswith(".com") or email.endswith(".dz")):
        raise ValueError(f"Email '{email}' must end with either '.com' or '.dz'")

    if not password or not isinstance(password, str):
        raise ValueError("Password must be a non-empty string")
    if not is_strong_password(password):
        raise ValueError(
            "Password must be at least 5 characters long and contain "
            "at least one digit and one special character"
        )


class Identity:
    """Represents user identity with validated credentials."""

    def __init__(self, username: str, email: str, password: str) -> None:
        verify_users_data(username, email, password)
        self.username = username
        self.email = email
        self.password = crypt_password(password)
        self.id = str(uuid.uuid4())


class User:
    """User class with CRUD operations for MongoDB."""

    def __init__(self, identity: Identity, status: Status, role: Role) -> None:
        self.identity = identity
        self.role = role
        self.status = status

    def to_dict(self) -> dict:
        """Convert User object to MongoDB document."""
        return {
            "_id": self.identity.id,
            "username": self.identity.username,
            "password": self.identity.password,
            "email": self.identity.email,
            "role": self.role.value,
            "status": self.status.value,
        }

    def register(self) -> dict:
        """Save user to database."""
        data = self.to_dict()
        email_check = unique_email(data["email"])
        if not email_check["success"]:
            return email_check
        try:
            users_collection.insert_one(data)
            return {
                "success": True,
                "message": f"User {self.identity.username} registered",
            }
        except DuplicateKeyError:
            return {
                "success": False,
                "message": f"User {self.identity.username} already exists.",
            }
        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    def login(username: str, password: str) -> dict:
        """Authenticate user with username and password."""
        user = users_collection.find_one({"username": username})
        if not user:
            return {"success": False, "message": f"User {username} does not exist."}
        if user["status"] == Status.SUSPENDED.value:
            return {"success": False, "message": f"User {username} is suspended"}
        if not check_password_hash(user["password"], password):
            return {
                "success": False,
                "message": f"Incorrect password for user {username}",
            }
        return {
            "success": True,
            "_id": str(user["_id"]),
            "role": user["role"],
            "username": user["username"],
            "message": f"User {username} logged in successfully",
        }

    @staticmethod
    def get_all_users(request_role: Role) -> dict:
        """Return list of all users (admin only)."""
        if request_role != Role.ADMIN:
            return {
                "success": False,
                "message": "You are not authorized to view this data.",
            }
        users_list = list(users_collection.find())
        for user in users_list:
            user["_id"] = str(user["_id"])
        return {"success": True, "users": users_list}

    @staticmethod
    def find_user(user_id: str) -> dict:
        """Find a user by ID."""
        user = users_collection.find_one({"_id": user_id})
        if not user:
            return {
                "success": False,
                "message": f"User with id {user_id} does not exist.",
            }
        return {"success": True, "user": user}

    @staticmethod
    def change_username(old_username: str, new_username: str) -> dict:
        """Change user's username."""
        try:
            if len(new_username) < 3:
                return {
                    "success": False,
                    "message": f"Username {new_username} must be at least 3 characters.",
                }

            user = users_collection.find_one({"username": old_username})
            if not user:
                return {
                    "success": False,
                    "message": f"User {old_username} does not exist.",
                }

            users_collection.update_one(
                {"_id": user["_id"]}, {"$set": {"username": new_username}}
            )
            return {
                "success": True,
                "message": f"Username {old_username} changed to {new_username}",
            }
        except DuplicateKeyError as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    def change_password(username: str, old_password: str, new_password: str) -> dict:
        """Change user password after verifying old password."""
        user = users_collection.find_one({"username": username})
        if not user:
            return {"success": False, "message": f"User {username} does not exist."}

        if not is_strong_password(new_password):
            return {"success": False, "message": "New password is not strong enough."}

        if not check_password_hash(user["password"], old_password):
            return {"success": False, "message": "password is incorrect."}

        new_hashed_password = crypt_password(new_password)
        users_collection.update_one(
            {"username": username}, {"$set": {"password": new_hashed_password}}
        )
        return {
            "success": True,
            "message": f"Password for {username} changed successfully.",
        }

    @staticmethod
    def delete(username: str, password: str, role: Role) -> dict:
        """Delete a user (admin only)."""
        if role != Role.ADMIN:
            return {
                "success": False,
                "message": "You are not authorized to delete this user.",
            }

        user_data = users_collection.find_one({"username": username})
        if not user_data:
            return {"success": False, "message": f"User {username} does not exist."}

        if not check_password_hash(user_data["password"], password):
            return {"success": False, "message": "Username or password is incorrect."}

        users_collection.delete_one({"username": username})
        return {"success": True, "message": f"User {username} deleted successfully."}


    @staticmethod
    def update_location(user_id: str, lat: float, lng: float) -> dict:
        """Update a user's current location."""
        user = users_collection.find_one({"_id": user_id})
        if not user:
            return {"success": False, "message": "User not found"}

        loc = get_location_info(lat, lng)
        if loc["country"] == "Unknown":
            return {"success": False, "message": "Coordinates are outside Algeria"}

        users_collection.update_one(
            {"_id": user_id},
            {"$set": {
                "latitude":  lat,
                "longitude": lng,
                "wilaya":    loc["wilaya"],
                "country":   loc["country"],
            }},
        )
        return {"success": True, "message": "Location updated", "location": loc}

    @staticmethod
    def get_user_location(user_id: str) -> dict:
        """Get a user's current location."""
        user = users_collection.find_one({"_id": user_id})
        if not user:
            return {"success": False, "message": "User not found"}
        if "latitude" not in user or "longitude" not in user:
            return {"success": False, "message": "Location not set for this user"}
        return {
            "success": True,
            "location": {
                "latitude":  user["latitude"],
                "longitude": user["longitude"],
                "wilaya":    user.get("wilaya"),
                "country":   user.get("country"),
            },
        }

    @staticmethod
    def distance_between(user1_id: str, user2_id: str) -> dict:
        """Calculate distance in km between two users."""
        u1 = users_collection.find_one({"_id": user1_id})
        u2 = users_collection.find_one({"_id": user2_id})
        if not u1 or not u2:
            return {"success": False, "message": "One or both users not found"}
        if "latitude" not in u1 or "latitude" not in u2:
            return {"success": False, "message": "One or both users have no location set"}
        dist = get_distance(u1["latitude"], u1["longitude"], u2["latitude"], u2["longitude"])
        return {
            "success":     True,
            "distance_km": dist,
            "from":        u1.get("username"),
            "to":          u2.get("username"),
        }
