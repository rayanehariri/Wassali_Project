from delivery import Delivery
from __init__ import deliveries_collection, users_collection
from flask import Blueprint, jsonify, request

client = Blueprint("client", __name__)


@client.route("deliveries", methods=["POST"])
def create_delivery_for_client():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400

    client_id = data.get("client_id")
    if not client_id:
        return jsonify({"success": False, "message": "client_id is required"}), 400

    pickup_address = data.get("pickup_address")
    if not pickup_address:
        return jsonify({"success": False, "message": "pickup_address is required"}), 400

    dropoff_address = data.get("dropoff_address")
    if not dropoff_address:
        return jsonify(
            {"success": False, "message": "dropoff_address is required"}
        ), 400

    description_of_order = data.get("description_of_order")
    if not description_of_order:
        return jsonify(
            {"success": False, "message": "description_of_order is required"}
        ), 400

    try:
        price = float(data.get("price"))
        if price <= 0:
            return jsonify({"success": False, "message": "price must be positive"}), 400
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "price must be a number"}), 400

    delivery = Delivery(
        client_id, pickup_address, dropoff_address, description_of_order, price
    )
    result = delivery.create()
    return jsonify(result), 201 if result["success"] else 409


@client.route("deliveries/<client_id>")
def get_client_deliveries(client_id: str):
    client_data = users_collection.find_one({"_id": client_id})
    if not client_data:
        return jsonify({"success": False, "message": "client not found"}), 404

    deliveries = list(deliveries_collection.find({"client_id": client_id}))
    return jsonify({"success": True, "deliveries": deliveries})


@client.route("deliveries/track/<delivery_id>")
def track_delivery(delivery_id: str):
    result = Delivery.track(delivery_id)
    return jsonify(result), 200 if result["success"] else 404


@client.route("/client/cancel", methods=["DELETE"])
def cancel():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Request body is required"}), 400
    delivery_id = data.get("delivery_id")
    client_id = data.get("client_id")
    if not delivery_id or not client_id:
        return jsonify(
            {"success": False, "message": "delivery_id and client_id are required"}
        ), 400
    result = Delivery.cancel_by_client(delivery_id, client_id)
    return jsonify(result), 200 if result["success"] else 400
