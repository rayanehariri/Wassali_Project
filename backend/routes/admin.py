from __init__ import Role
from models import User
from delivery import Delivery
from flask import Blueprint, jsonify , request

admin = Blueprint("admin", __name__)


# create the route for getting all users as a list
@admin.route("/users")
def get_users():
    users_list = User.get_all_users(Role.ADMIN)
    return jsonify(users_list)


# create the route for getting the user by id
@admin.route("/users/<id>")
def user_id(id: str):
    find_user = User.find_user(id)
    if find_user["success"]:
        return jsonify(find_user)
    else:
        return jsonify({"success": False, "message": find_user["message"]})


@admin.route("/delete/<username>" , methods=["DELETE"])
def delete(username : str):
    result = request.get_json()
    if not result:
        return jsonify({"success": False, "message": "Request body is required"}), 400

    password = result.get("password")
    role = result.get("role")
    if not password or not role:
        return jsonify({"success": False, "message": "password and role are required"}), 400

    return jsonify(User.delete(username , password , Role(role)))



@admin.route("/reject/<delivery_id>" , methods=["DELETE"])
def reject(delivery_id : str):
    result = request.get_json()
    if not result:
        return jsonify({"success": False, "message": "Request body is required"}), 400

    admin_id = result.get("admin_id")
    reason = result.get("reason")
    if not admin_id or not reason:
        return jsonify({"success": False, "message": "admin_id and reason are required"}), 400

    return jsonify(Delivery.reject_by_admin(delivery_id ,admin_id , reason))
