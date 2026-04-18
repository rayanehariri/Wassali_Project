from flask import Flask
from enum import StrEnum
from pymongo import MongoClient
from flask_cors import CORS

# MongoDB Configuration
MONGODB_URI = "mongodb://127.0.0.1:27017"
DATABASE_NAME = "wassali_db"

# Database and Collections
client = MongoClient(MONGODB_URI)
db = client[DATABASE_NAME]
users_collection = db["users"]
deliveries_collection = db["deliveries"]
verification_codes = db["verification_codes"]

# Database Indexes for performance and uniqueness constraints
users_collection.create_index("username", unique=True)
users_collection.create_index("email", unique=True)
deliveries_collection.create_index("client_id")
deliveries_collection.create_index("deliverer_id")
deliveries_collection.create_index("status")
verification_codes.create_index("expires_at" , expireAfterSeconds=0)



# Flask Application
app = Flask(__name__)
CORS(app)


class Role(StrEnum):
    ADMIN = "admin"
    CLIENT = "client"
    DELIVERER = "deliverer"


class Status(StrEnum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"


class DeliveryStatus(StrEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
