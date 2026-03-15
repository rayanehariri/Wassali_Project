from __init__ import Status, Role
from models import User, Identity
from flask import Blueprint, jsonify, request


auth = Blueprint("auth", __name__)


# create the route for registering a user
@auth.route("/register/", methods=["POST"])
def register() -> dict:
    data = request.get_json()
    try:
        identity = Identity(data["username"], data["email"], data["password"])
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400

    role = Role(data.get("role", "client"))
    status = Status.PENDING if role == Role.DELIVERER else Status.ACTIVE
    user = User(identity, status, role)
    result = user.register()
    return jsonify(result), 201 if result["success"] else 409


@auth.route("/login/", methods=["POST"])
def login() -> dict:
    data = request.get_json()
    if data is None:
        return {"success": False, "message": f"data: {data} is not found"}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"success": False, "message": "need password and username"}), 400

    result = User.login(username, password)
    return jsonify(result), 200 if result["success"] else 401
