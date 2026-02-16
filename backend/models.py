import uuid
from werkzeug.security import generate_password_hash, check_password_hash
from enum import StrEnum
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError

# Create a local mongodb database server
client = MongoClient("mongodb://localhost:27017")
db = client["wassali_db"]
users_collection = db["users"]
# usernames must be unique to prevent duplicate
users_collection.create_index("username", unique=True)


# define 3 types of users check rayan's wassali.pdf file
class Role(StrEnum):
    ADMIN = "admin"
    CLIENT = "client"
    DELIVERER = "deliverer"


# define 3 types of users check rayan's wassali.pdf file pending / active / suspended
class Status(StrEnum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"


def crypt_password(password: str) -> str:
    return generate_password_hash(password, method="pbkdf2:sha256", salt_length=8)


# create identity class for each user
class Identity:
    def __init__(self, username: str, email: str, password: str) -> None:
        self.username = username
        self.email = email
        self.password = crypt_password(password)
        # create a unique random id using uuid lib from python
        self.id = str(uuid.uuid4())

    # print the identity for debugging
    def __repr__(self) -> str:
        return f"Identity(username={self.username}, email={self.email}, password={self.password} , id : {self.id})"


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

    def register(self) -> None:
        """Saves the user to the database"""
        data: dict = self.to_dict()
        try:
            users_collection.insert_one(data)
            print(f" Success: User {self.identity.username} registered!")
        except DuplicateKeyError:
            print(f" Error: User {self.identity.username} already exists.")
        except Exception:
            print(f" Error: {Exception}")

    def display_db(self):
        """Helper to print all users in the console."""
        all_users = list(users_collection.find())
        for user in all_users:
            print(user)

    @staticmethod
    def get_all_users():
        """Returns a list of all users instead of printing them."""
        users = list(users_collection.find())
        return users

    """Finds a user by name using a static method """

    @staticmethod
    def find_user(username: str) -> str:
        user_data = users_collection.find_one({"username": username})
        if user_data:
            print(f" User {username} found!")
            return user_data
        else:
            return f"User {username} not found."

    """add change password function"""

    @staticmethod
    def change_password(username: str, old_password: str, new_password: str) -> None:
        username_exist = users_collection.find_one({"username": username})
        if username_exist is None:
            print(f" User {username} does not exist.")
            return
        if check_password_hash(username_exist["password"], old_password):
            new_hashed_password = crypt_password(new_password)
            users_collection.update_one(
                {"username": username}, {"$set": {"password": new_hashed_password}}
            )
            print(f" Password for {username} changed successfully.")
            return
        else:
            print("Username or password is incorrect.")
            return

    """"deletes a user only if the password and username are correct"""

    @staticmethod
    def delete(username: str, password: str) -> None:
        user_data = users_collection.find_one({"username": username})
        if user_data is None:
            print(f" User {username} does not exist.")
            return

        is_data_correct: bool = check_password_hash(user_data["password"], password)
        if is_data_correct:
            users_collection.delete_one({"username": username})
            print(f" User {username} deleted successfully.")
            return
        else:
            print("Username or password is incorrect.")
            return


admin_identity: Identity = Identity("admin", "admin@admin.com", "admin")
client_identity: Identity = Identity("client", "client@client.com", "client")
deliverer_identity: Identity = Identity(
    "deliverer", "deliverer@deliverer.com", "deliverer"
)


admin_user: User = User(admin_identity, Status.ACTIVE, Role.ADMIN)
deliverer_user: User = User(deliverer_identity, Status.ACTIVE, Role.DELIVERER)
client_user: User = User(client_identity, Status.ACTIVE, Role.CLIENT)
