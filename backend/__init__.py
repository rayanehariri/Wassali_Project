import os
from pathlib import Path
from enum import StrEnum

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient

# Always load backend/.env regardless of current working directory.
_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_env_path, override=True)

# MongoDB Configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "wassali_db")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-in-production")
JWT_ACCESS_EXPIRES_MINUTES = int(os.getenv("JWT_ACCESS_EXPIRES_MINUTES", "30"))
JWT_REFRESH_EXPIRES_DAYS = int(os.getenv("JWT_REFRESH_EXPIRES_DAYS", "7"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

# Database and Collections
client = MongoClient(MONGODB_URI)
db = client[DATABASE_NAME]
users_collection = db["users"]
deliveries_collection = db["deliveries"]
verification_codes = db["verification_codes"]
auth_sessions = db["auth_sessions"]
delivery_requests = db["delivery_requests"]
verifications_collection = db["verifications"]
password_resets_collection = db["password_resets"]
pending_phone_registrations = db["pending_phone_registrations"]

# Database Indexes for performance and uniqueness constraints
users_collection.create_index("username", unique=True)
users_collection.create_index("email", unique=True)
deliveries_collection.create_index("client_id")
deliveries_collection.create_index("deliverer_id")
deliveries_collection.create_index("status")
verification_codes.create_index("expires_at" , expireAfterSeconds=0)
auth_sessions.create_index("jti", unique=True)
auth_sessions.create_index("user_id")
auth_sessions.create_index("expires_at", expireAfterSeconds=0)
delivery_requests.create_index("status")
delivery_requests.create_index("client_id")
delivery_requests.create_index("created_at")
delivery_requests.create_index("offers.deliverer_id")
verifications_collection.create_index("status")
verifications_collection.create_index("deliverer_id")
verifications_collection.create_index("created_at")
password_resets_collection.create_index("expires_at", expireAfterSeconds=86400)
pending_phone_registrations.create_index("expires_at", expireAfterSeconds=86400)
pending_phone_registrations.create_index("email")

# Flask Application
app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
app.config["JWT_ACCESS_EXPIRES_MINUTES"] = JWT_ACCESS_EXPIRES_MINUTES
app.config["JWT_REFRESH_EXPIRES_DAYS"] = JWT_REFRESH_EXPIRES_DAYS

if CORS_ORIGINS == "*":
    CORS(app)
else:
    CORS(app, origins=[origin.strip() for origin in CORS_ORIGINS.split(",") if origin.strip()])


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
    IN_TRANSIT = "in_transit"
    AWAITING_CLIENT = "awaiting_client"
    REJECTED = "rejected"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
