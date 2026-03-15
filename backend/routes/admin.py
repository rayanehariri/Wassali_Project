from __init__ import Role
from models import User
from flask import Blueprint, jsonify

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
