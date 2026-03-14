import uuid
from __init__ import users_collection, Role, Status
from pymongo.errors import DuplicateKeyError
from werkzeug.security import check_password_hash, generate_password_hash


# create crypted password function
def crypt_password(password: str) -> str:
    return generate_password_hash(password, method="pbkdf2:sha256", salt_length=8)


# create verify password function
def verify_password(password: str, hashed_password: str) -> bool:
    return check_password_hash(hashed_password, password)


def has_digit_and_special(password: str) -> bool:
    special_char = "[@_!#$%^&*()<>?\\/|}{~:]"
    digits_char = "0123456789"
    has_special = False
    has_digit = False
    if any(char in password for char in special_char):
        has_special = True
    if any(char in password for char in digits_char):
        has_digit = True
    return has_special and has_digit


def is_strong_password(password: str) -> bool:
    if len(password) < 5:
        return False
    elif not has_digit_and_special(password):
        return False
    return True


def verify_users_data(username: str, email: str, password: str) -> None:
    if len(username) < 3:
        raise ValueError(f"Username {username} must be at least 3 characters long.")
    if "@" not in email:
        raise ValueError(f"Useremail : {email} must have the @ Symbol")
    elif not email.endswith(".com") and not email.endswith(".dz"):
        raise ValueError(
            f"Useremail : {email} must have the .dz or .com Symbol at the end"
        )
    if not is_strong_password(password):
        raise ValueError(f"password :{password} is not strong enough")


# create identity class for each user
class Identity:
    def __init__(self, username: str, email: str, password: str) -> None:

        verify_users_data(username, email, password)

        self.username = username
        self.email = email
        self.password = crypt_password(password)
        # create a unique random id using uuid lib from python
        self.id = str(uuid.uuid4())

    # print the identity for debugging
    def __repr__(self) -> str:
        return (
            f"Identity(username={self.username} , email={self.email} , id : {self.id})"
        )


# create user class for each user and set the basic user operations register , delete , find and display the database
class User:
    def __init__(self, identity: Identity, status: Status, role: Role) -> None:
        self.identity = identity
        self.role = role
        self.status = status

    def __repr__(self) -> str:
        return f"User(identity={self.identity}, role={self.role}, status={self.status})"

    def to_dict(self) -> dict:
        """Converts the User object into a Dictionary for MongoDB."""
        return {
            "_id": self.identity.id,
            "username": self.identity.username,
            "password": self.identity.password,
            "email": self.identity.email,
            "role": self.role.value,
            "status": self.status.value,
        }

    def register(self) -> dict:
        """Saves the user to the database"""
        data: dict = self.to_dict()
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
        user = users_collection.find_one({"username": username})
        if not user:
            return {"success": False, "message": f"User {username} does not exist."}
        if user["status"] == Status.SUSPENDED.value:
            return {"success": False, "message": f"User {username} is suspended"}
        elif user["status"] == Status.PENDING.value:
            return {"success": False, "message": f"User {username} is pending"}

        if not verify_password(password, user["password"]):
            return {
                "success": False,
                "message": f"Incorrect password for user {username}",
            }

        return {
            "success": True,
            "role": user["role"],
            "username": user["username"],
            "_id": str(user["_id"]),
            "message": f"User {username} logged in successfully",
        }

    @staticmethod
    def get_all_users(role: Role) -> dict:
        """Returns a list of all users instead of printing them."""
        if role == Role.ADMIN:
            users_list = list(users_collection.find())
            return {"success": True, "users": users_list}
        else:
            return {
                "success": False,
                "message": "You are not authorized to view this data.",
            }

    @staticmethod
    def find_user(id: str) -> dict:
        """Finds a user by name using a UUID"""
        user = users_collection.find_one({"_id": id})
        if not user:
            return {"success": False, "message": f"User with id {id} does not exist."}
        else:
            return {"success": True, "user": user}

    @staticmethod
    def change_username(old_username: str, new_username: str) -> dict:
        try:
            if len(new_username) < 3:
                raise ValueError(
                    f"Username : {new_username} must be at least 3 characters long."
                )

            find_username = users_collection.find_one({"username": old_username})
            if find_username is None:
                return {
                    "success": False,
                    "message": f"User {old_username} does not exist.",
                }
            else:
                users_collection.update_one(
                    {"_id": find_username["_id"]}, {"$set": {"username": new_username}}
                )
                return {
                    "success": True,
                    "message": f"Username {old_username} changed to {new_username}",
                }
        except DuplicateKeyError as e:
            return {"success": False, "message": str(e)}

    """add change password function"""

    @staticmethod
    def change_password(username: str, old_password: str, new_password: str) -> dict:
        username_exist = users_collection.find_one({"username": username})
        if username_exist is None:
            return {"success": False, "message": f"User {username} does not exist."}
        elif not is_strong_password(new_password):
            raise ValueError(f"Password {new_password} is not strong enough.")

        if check_password_hash(username_exist["password"], old_password):
            new_hashed_password = crypt_password(new_password)
            users_collection.update_one(
                {"username": username}, {"$set": {"password": new_hashed_password}}
            )
            return {
                "success": True,
                "message": f"Password for {username} changed successfully.",
            }
        else:
            return {"success": False, "message": "password is incorrect."}

    """"deletes a user only if the password and username are correct"""

    @staticmethod
    def delete(username: str, password: str, role: Role) -> dict:
        if role == Role.ADMIN:
            user_data = users_collection.find_one({"username": username})
            if user_data is None:
                return {"success": False, "message": f"User {username} does not exist."}

            is_data_correct: bool = check_password_hash(user_data["password"], password)
            if is_data_correct:
                users_collection.delete_one({"username": username})
                return {
                    "success": True,
                    "message": f"User {username} deleted successfully.",
                }
            else:
                return {
                    "success": False,
                    "message": "Username or password is incorrect.",
                }

        else:
            return {
                "success": False,
                "message": "You are not authorized to delete this user.",
            }


def main() -> None:
    admin_identity: Identity = Identity("admin", "admin@admin.dz", "admin123!")
    client_identity: Identity = Identity("client", "client@client.com", "client123!")
    deliverer_identity: Identity = Identity(
        "deliverer", "deliverer@deliverer.com", "deliverer123!"
    )
    admin_user: User = User(admin_identity, Status.ACTIVE, Role.ADMIN)
    deliverer_user: User = User(deliverer_identity, Status.PENDING, Role.DELIVERER)
    client_user: User = User(client_identity, Status.ACTIVE, Role.CLIENT)

    print(client_user.register())
    print(deliverer_user.register())
    print(admin_user.register())
    print(User.delete("admin", "admin123!", Role.ADMIN))


if __name__ == "__main__":
    main()
