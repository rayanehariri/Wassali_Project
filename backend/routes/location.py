from models import User
from location import get_location_info
from __init__ import users_collection
from flask import Blueprint, jsonify, request

location = Blueprint("location", __name__)


def _validate_user(user_id: str):
    """Check that the user exists."""
    if not users_collection.find_one({"_id": user_id}):
        return jsonify({"success": False, "message": "User not found"}), 404
    return None


@location.route("/update", methods=["POST"])
def update_location():
    """Update any user's location."""
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Request body required"}), 400

    user_id = data.get("user_id")
    lat     = data.get("lat")
    lng     = data.get("lng")

    if not user_id or lat is None or lng is None:
        return jsonify({"success": False, "message": "user_id, lat, and lng required"}), 400

    try:
        lat, lng = float(lat), float(lng)
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "lat and lng must be numbers"}), 400

    error = _validate_user(user_id)
    if error:
        return error

    return jsonify(User.update_location(user_id, lat, lng))


@location.route("/<user_id>", methods=["GET"])
def get_location(user_id: str):
    """Get any user's current location."""
    error = _validate_user(user_id)
    if error:
        return error
    return jsonify(User.get_user_location(user_id))


@location.route("/distance", methods=["GET"])
def get_distance_between():
    """Get distance in km between two users."""
    user1_id = request.args.get("user1_id")
    user2_id = request.args.get("user2_id")

    if not user1_id or not user2_id:
        return jsonify({
            "success": False,
            "message": "user1_id and user2_id are required as query parameters",
        }), 400

    return jsonify(User.distance_between(user1_id, user2_id))


@location.route("/wilaya", methods=["GET"])
def get_wilaya():
    """Resolve coordinates to wilaya and country."""
    try:
        lat = float(request.args.get("lat"))
        lng = float(request.args.get("lng"))
    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "lat and lng must be valid numbers provided as query parameters",
        }), 400

    return jsonify(get_location_info(lat, lng))
