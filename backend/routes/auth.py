from __init__ import Status, Role
from models import User, Identity
from flask import Blueprint, jsonify, request

auth = Blueprint("auth", __name__)


@auth.route("/register/", methods=["POST"])
def register():
    """Register a new user."""
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Request body is required"}), 400

    try:
        identity = Identity(data["username"], data["email"], data["password"])
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400
    except KeyError as e:
        return jsonify(
            {"success": False, "message": f"Missing required field: {e}"}
        ), 400

    try:
        role = Role(data.get("role") or "client")
    except ValueError:
        return jsonify(
            {
                "success": False,
                "message": "Invalid role. Must be 'admin', 'client', or 'deliverer'",
            }
        ), 400

    status = Status.PENDING if role == Role.DELIVERER else Status.ACTIVE
    user = User(identity, status, role)
    result = user.register()
    return jsonify(result), 201 if result["success"] else 409


@auth.route("/login/", methods=["POST"])
def login():
    """Authenticate user with username and password."""
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Request body is required"}), 400

    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify(
            {"success": False, "message": "username and password are required"}
        ), 400

    result = User.login(username, password)
    return jsonify(result), 200 if result["success"] else 401


@auth.route("/change/username/<old_username>", methods=["POST"])
def change_username(old_username: str):
    """Change user's username."""
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Request body is required"}), 400

    new_username = data.get("new_username")
    if not new_username:
        return jsonify({"success": False, "message": "new_username is required"}), 400

    return jsonify(User.change_username(old_username, new_username))


@auth.route("/change/password/<username>", methods=["POST"])
def change_password(username: str):
    """Change user's password."""
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Request body is required"}), 400

    old_password = data.get("old_password")
    new_password = data.get("new_password")
    if not old_password or not new_password:
        return jsonify(
            {"success": False, "message": "old_password and new_password are required"}
        ), 400

    result = User.change_password(username, old_password, new_password)
    return jsonify(result), 200 if result["success"] else 400
