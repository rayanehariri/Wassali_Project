from delivery import DeliveryManager
from __init__ import deliveries_collection, users_collection
from flask import Blueprint, jsonify, request

client = Blueprint("client", __name__)


def _validate_client(client_id: str):
    client_data = users_collection.find_one({"_id": client_id})
    if not client_data:
        return jsonify({"success": False, "message": "client not found"}), 404
    if client_data.get("role") != "client":
        return jsonify({"success": False, "message": "user is not a client"}), 403
    return None


@client.route("/deliveries", methods=["POST"])
def create_delivery_for_client():
    """Create a new delivery for a client."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400

        required_fields = [
            "client_id",
            "pickup_address",
            "dropoff_address",
            "description_of_order",
        ]
        for field in required_fields:
            if not data.get(field):
                return jsonify(
                    {"success": False, "message": f"{field} is required"}
                ), 400

        price_raw = data.get("price")
        if price_raw is None:
            return jsonify({"success": False, "message": "price is required"}), 400

        try:
            price = float(price_raw)
            if price <= 0:
                return jsonify(
                    {"success": False, "message": "price must be positive"}
                ), 400
        except (TypeError, ValueError):
            return jsonify(
                {"success": False, "message": "price must be a valid number"}
            ), 400

        error = _validate_client(data["client_id"])
        if error:
            return error

        delivery = DeliveryManager(
            data["client_id"],
            data["pickup_address"],
            data["dropoff_address"],
            data["description_of_order"],
            price,
        )
        result = delivery.create()
        return jsonify(result), 201 if result["success"] else 409
    except Exception as e:
        return jsonify(
            {"success": False, "message": f"Internal server error: {str(e)}"}
        ), 500


@client.route("/deliveries/<client_id>", methods=["GET"])
def get_client_deliveries(client_id: str):
    """Get all deliveries for a specific client."""
    try:
        error = _validate_client(client_id)
        if error:
            return error

        deliveries = list(deliveries_collection.find({"client_id": client_id}))
        for delivery in deliveries:
            delivery["_id"] = str(delivery["_id"])

        return jsonify({"success": True, "deliveries": deliveries}), 200
    except Exception as e:
        return jsonify(
            {"success": False, "message": f"Internal server error: {str(e)}"}
        ), 500


@client.route("/deliveries/track/<delivery_id>", methods=["GET"])
def track_delivery(delivery_id: str):
    """Track the status of a specific delivery."""
    try:
        result = DeliveryManager.track(delivery_id)
        if result["success"]:
            return jsonify(result), 200
        status = 404 if "not found" in result.get("message", "").lower() else 400
        return jsonify(result), status
    except Exception as e:
        return jsonify(
            {"success": False, "message": f"Internal server error: {str(e)}"}
        ), 500


@client.route("/cancel", methods=["DELETE"])
def cancel_delivery():
    """Cancel a delivery by client."""
    try:
        data = request.get_json()
        if not data:
            return jsonify(
                {"success": False, "message": "Request body is required"}
            ), 400

        delivery_id = data.get("delivery_id")
        client_id = data.get("client_id")
        if not delivery_id or not client_id:
            return jsonify(
                {"success": False, "message": "delivery_id and client_id are required"}
            ), 400

        error = _validate_client(client_id)
        if error:
            return error

        result = DeliveryManager.cancel_by_client(delivery_id, client_id)
        return jsonify(result), 200 if result["success"] else 400
    except Exception as e:
        return jsonify(
            {"success": False, "message": f"Internal server error: {str(e)}"}
        ), 500
