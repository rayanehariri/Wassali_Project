from datetime import datetime, timezone

from __init__ import Role, users_collection
from models import User
from delivery import Delivery
from flask import Blueprint, request
from auth_utils import require_auth
from api_response import fail, success
from schemas import DeleteUserSchema, RejectDeliverySchema, validate_payload

admin = Blueprint("admin", __name__)


@admin.route("/users", methods=["GET"])
@require_auth(Role.ADMIN.value)
def get_users():
    """Get all users in the system (admin only)."""
    result = User.get_all_users(Role.ADMIN)
    if result["success"]:
        return success("Users loaded", data={"users": result.get("users", [])}, status=200)
    status = 403 if "not authorized" in result.get("message", "").lower() else 400
    return fail(result.get("message", "Failed to load users"), status)


@admin.route("/users/<id>", methods=["GET"])
@require_auth(Role.ADMIN.value)
def get_user_by_id(id: str):
    """Get a specific user by their ID (admin only)."""
    if not id:
        return fail("user ID is required", 400, code="VALIDATION_ERROR")

    result = User.find_user(id)
    if result["success"]:
        return success("User loaded", data={"user": result.get("user")}, status=200)
    status = 404 if "not found" in result.get("message", "").lower() else 400
    return fail(result.get("message", "Failed to load user"), status)


@admin.route("/delete/<username>", methods=["DELETE"])
@require_auth(Role.ADMIN.value)
def delete_user(username: str):
    """Delete a user (admin only)."""
    if not username:
        return fail("username is required", 400, code="VALIDATION_ERROR")

    data, error = validate_payload(DeleteUserSchema(), request.get_json(silent=True))
    if error:
        return error

    role = Role(data["role"])
    if role != Role.ADMIN:
        return fail("Only administrators can delete users", 403, code="FORBIDDEN")

    result = User.delete(username, data["password"], role)
    if result["success"]:
        return success(result.get("message", "User deleted"), status=200)

    msg = result.get("message", "").lower()
    if "not found" in msg or "does not exist" in msg:
        return fail(result["message"], 404)
    if "incorrect" in msg:
        return fail(result["message"], 401, code="AUTH_FAILED")
    if "not authorized" in msg:
        return fail(result["message"], 403, code="FORBIDDEN")
    return fail(result.get("message", "Delete failed"), 400)


@admin.route("/reject/<delivery_id>", methods=["DELETE"])
@require_auth(Role.ADMIN.value)
def reject_delivery(delivery_id: str):
    """Reject a delivery by admin."""
    if not delivery_id:
        return fail("delivery ID is required", 400, code="VALIDATION_ERROR")

    data, error = validate_payload(RejectDeliverySchema(), request.get_json(silent=True))
    if error:
        return error

    admin_data = users_collection.find_one({"_id": data["admin_id"]})
    if not admin_data:
        return fail("admin not found", 404)
    if admin_data.get("role") != "admin":
        return fail("user is not an administrator", 403, code="FORBIDDEN")

    result = Delivery.reject_by_admin(delivery_id, data["admin_id"], data["reason"])
    if result["success"]:
        return success(result.get("message", "Delivery rejected"), status=200)

    msg = result.get("message", "").lower()
    if "not found" in msg:
        return fail(result["message"], 404)
    return fail(result.get("message", "Reject failed"), 400)


@admin.route("/users/stats", methods=["GET"])
@require_auth(Role.ADMIN.value)
def user_stats():
    total = users_collection.count_documents({})
    banned = users_collection.count_documents({"status": "banned"})
    return success(
        "User stats loaded",
        data={
            "totalUsers": {"value": total, "change": "Live", "positive": True, "label": "Total registered accounts"},
            "newUsers": {"value": 0, "change": "Live", "positive": True, "label": "Growth this week"},
            "activeNow": {"value": 0, "change": "Live", "positive": True, "label": "Currently online users"},
            "bannedAccounts": {"value": banned, "change": "Live", "positive": False, "label": "Requires attention"},
        },
        status=200,
    )


@admin.route("/users", methods=["POST"])
@require_auth(Role.ADMIN.value)
def create_user():
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip()
    role = (payload.get("role") or "client").strip().lower()
    status = (payload.get("status") or "active").strip().lower()
    if role not in ["client", "deliverer", "admin"]:
        return fail("invalid role", 400, code="VALIDATION_ERROR")
    if status not in ["active", "inactive", "banned"]:
        return fail("invalid status", 400, code="VALIDATION_ERROR")
    if not name or not email:
        return fail("name and email are required", 400, code="VALIDATION_ERROR")
    if users_collection.find_one({"email": email}):
        return fail("email already exists", 409)
    doc = {
        "_id": payload.get("_id") or payload.get("id") or email,
        "name": name,
        "email": email,
        "role": role,
        "status": status,
        "created_at": datetime.now(timezone.utc),
    }
    users_collection.insert_one(doc)
    return success("User created", data={"user": doc}, status=201)


@admin.route("/users/<user_id>", methods=["PATCH"])
@require_auth(Role.ADMIN.value)
def patch_user(user_id: str):
    payload = request.get_json(silent=True) or {}
    set_doc = {}
    if "status" in payload:
        status = str(payload.get("status") or "").lower()
        if status not in ["active", "inactive", "banned"]:
            return fail("invalid status", 400, code="VALIDATION_ERROR")
        set_doc["status"] = status
    if "role" in payload:
        role = str(payload.get("role") or "").lower()
        if role not in ["client", "deliverer", "admin"]:
            return fail("invalid role", 400, code="VALIDATION_ERROR")
        set_doc["role"] = role
    if not set_doc:
        return fail("nothing to update", 400, code="VALIDATION_ERROR")
    result = users_collection.update_one({"_id": user_id}, {"$set": set_doc})
    if result.matched_count == 0:
        return fail("user not found", 404)
    u = users_collection.find_one({"_id": user_id}, {"password": 0})
    return success("User updated", data={"user": u}, status=200)


@admin.route("/users/<user_id>", methods=["DELETE"])
@require_auth(Role.ADMIN.value)
def delete_user_by_id(user_id: str):
    result = users_collection.delete_one({"_id": user_id})
    if result.deleted_count == 0:
        return fail("user not found", 404)
    return success("User deleted", data={"success": True}, status=200)
