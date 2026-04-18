from __init__ import Role, users_collection
from models import User
from delivery import Delivery
from flask import Blueprint, jsonify, request

admin = Blueprint("admin", __name__)


@admin.route("/users", methods=["GET"])
def get_users():
    """Get all users in the system (admin only)."""
    try:
        result = User.get_all_users(Role.ADMIN)
        if result["success"]:
            return jsonify(result), 200
        status = 403 if "not authorized" in result.get("message", "").lower() else 400
        return jsonify(result), status
    except Exception as e:
        return jsonify(
            {"success": False, "message": f"Internal server error: {str(e)}"}
        ), 500


@admin.route("/users/<id>", methods=["GET"])
def get_user_by_id(id: str):
    """Get a specific user by their ID (admin only)."""
    try:
        if not id:
            return jsonify({"success": False, "message": "user ID is required"}), 400

        result = User.find_user(id)
        if result["success"]:
            return jsonify(result), 200
        status = 404 if "not found" in result.get("message", "").lower() else 400
        return jsonify(result), status
    except Exception as e:
        return jsonify(
            {"success": False, "message": f"Internal server error: {str(e)}"}
        ), 500


@admin.route("/delete/<username>", methods=["DELETE"])
def delete_user(username: str):
    """Delete a user (admin only)."""
    try:
        if not username:
            return jsonify({"success": False, "message": "username is required"}), 400

        data = request.get_json()
        if not data:
            return jsonify(
                {"success": False, "message": "Request body is required"}
            ), 400

        password = data.get("password")
        role_str = data.get("role")
        if not password or not role_str:
            return jsonify(
                {"success": False, "message": "password and role are required"}
            ), 400

        try:
            role = Role(role_str)
        except ValueError:
            return jsonify(
                {
                    "success": False,
                    "message": "Invalid role. Must be 'admin', 'client', or 'deliverer'",
                }
            ), 400

        if role != Role.ADMIN:
            return jsonify(
                {"success": False, "message": "Only administrators can delete users"}
            ), 403

        result = User.delete(username, password, role)
        if result["success"]:
            return jsonify(result), 200

        msg = result.get("message", "").lower()
        if "not found" in msg:
            return jsonify(result), 404
        if "incorrect" in msg:
            return jsonify(result), 401
        if "not authorized" in msg:
            return jsonify(result), 403
        return jsonify(result), 400
    except Exception as e:
        return jsonify(
            {"success": False, "message": f"Internal server error: {str(e)}"}
        ), 500


@admin.route("/reject/<delivery_id>", methods=["DELETE"])
def reject_delivery(delivery_id: str):
    """Reject a delivery by admin."""
    try:
        if not delivery_id:
            return jsonify(
                {"success": False, "message": "delivery ID is required"}
            ), 400

        data = request.get_json()
        if not data:
            return jsonify(
                {"success": False, "message": "Request body is required"}
            ), 400

        admin_id = data.get("admin_id")
        reason = data.get("reason")
        if not admin_id or not reason:
            return jsonify(
                {"success": False, "message": "admin_id and reason are required"}
            ), 400

        admin_data = users_collection.find_one({"_id": admin_id})
        if not admin_data:
            return jsonify({"success": False, "message": "admin not found"}), 404
        if admin_data.get("role") != "admin":
            return jsonify(
                {"success": False, "message": "user is not an administrator"}
            ), 403

        result = Delivery.reject_by_admin(delivery_id, admin_id, reason)
        if result["success"]:
            return jsonify(result), 200

        msg = result.get("message", "").lower()
        if "not found" in msg:
            return jsonify(result), 404
        return jsonify(result), 400
    except Exception as e:
        return jsonify(
            {"success": False, "message": f"Internal server error: {str(e)}"}
        ), 500
