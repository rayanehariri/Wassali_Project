from flask import Flask
from enum import StrEnum
from pymongo import MongoClient

# Create a local mongodb database server
wassali_db = MongoClient("mongodb://127.0.0.1:27017")
db = wassali_db["wassali_db"]
users_collection = db["users"]
deliveries_collection = db["deliveries"]


# usernames must be unique to prevent duplicate
users_collection.create_index("username", unique=True)

app = Flask(__name__)


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


# define 3 types for the delivery status
class DeliveryStatus(StrEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    DELIVERED = "delivered"
