from delivery import DeliveryManager
from __init__ import users_collection
from flask import Blueprint, jsonify, request

deliverer = Blueprint("deliverer", __name__)


def _validate_deliverer(deliverer_id: str):
    deliverer_data = users_collection.find_one({"_id": deliverer_id})
    if not deliverer_data:
        return jsonify({"success": False, "message": "deliverer not found"}), 404
    if deliverer_data.get("role") != "deliverer":
        return jsonify({"success": False, "message": "user is not a deliverer"}), 403
    if deliverer_data.get("status") != "active":
         return jsonify({"success": False,"message": "Account not yet approved"}), 403
    return None


@deliverer.route("/deliveries/available", methods=["GET"])
def get_available_deliveries():
    """Get all pending deliveries available for acceptance."""
    try:
        result = DeliveryManager.find_available()
        if result["success"]:
            for delivery in result.get("deliveries", []):
                if "_id" in delivery:
                    delivery["_id"] = str(delivery["_id"])
            return jsonify(result), 200
        return jsonify(result), 500
    except Exception as e:
        return jsonify(
            {"success": False, "message": f"Internal server error: {str(e)}"}
        ), 500


@deliverer.route("/deliveries/accept/<delivery_id>", methods=["POST"])
def accept_delivery(delivery_id: str):
    """Accept a delivery by a deliverer."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400

        deliverer_id = data.get("deliverer_id")
        if not deliverer_id:
            return jsonify(
                {"success": False, "message": "deliverer_id is required"}
            ), 400

        error = _validate_deliverer(deliverer_id)
        if error:
            return error

        result = DeliveryManager.accept(delivery_id, deliverer_id)
        if result["success"]:
            return jsonify(result), 200

        msg = result.get("message", "").lower()
        if "not found" in msg:
            return jsonify(result), 404
        if "already" in msg:
            return jsonify(result), 409
        return jsonify(result), 400
    except Exception as e:
        return jsonify(
            {"success": False, "message": f"Internal server error: {str(e)}"}
        ), 500


@deliverer.route("/deliveries/mark_delivered/<delivery_id>", methods=["POST"])
def mark_delivery_as_delivered(delivery_id: str):
    """Mark a delivery as delivered."""
    try:
        result = DeliveryManager.mark_as_delivered(delivery_id)
        if result["success"]:
            return jsonify(result), 200

        msg = result.get("message", "").lower()
        if "not found" in msg:
            return jsonify(result), 404
        if "not accepted" in msg:
            return jsonify(result), 400
        if "already delivered" in msg:
            return jsonify(result), 409
        return jsonify(result), 400
    except Exception as e:
        return jsonify(
            {"success": False, "message": f"Internal server error: {str(e)}"}
        ), 500


@deliverer.route("/drop", methods=["DELETE"])
def drop_delivery():
    """Drop a delivery by the deliverer."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400

        delivery_id = data.get("delivery_id")
        deliverer_id = data.get("deliverer_id")
        if not delivery_id or not deliverer_id:
            return jsonify(
                {
                    "success": False,
                    "message": "delivery_id and deliverer_id are required",
                }
            ), 400

        error = _validate_deliverer(deliverer_id)
        if error:
            return error

        result = DeliveryManager.drop_by_deliverer(delivery_id, deliverer_id)
        return jsonify(result), 200 if result["success"] else 400
    except Exception as e:
        return jsonify(
            {"success": False, "message": f"Internal server error: {str(e)}"}
        ), 500
