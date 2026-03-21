from delivery import Delivery
from flask import Blueprint, jsonify, request

deliverer = Blueprint("deliverer", __name__)


@deliverer.route("deliveries/available")
def get_available_deliveries():
    result = Delivery.find_available()
    return jsonify(result)


@deliverer.route("deliveries/accept/<delivery_id>", methods=["POST"])
def deliveries_accept(delivery_id: str):
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400

    deliverer_id = data.get("deliverer_id")
    if not deliverer_id:
        return jsonify({"success": False, "message": "deliverer_id is required"}), 400

    result = Delivery.accept(delivery_id, deliverer_id)
    return jsonify(result), 200 if result["success"] else 400


@deliverer.route("deliveries/mark_delivered/<delivery_id>", methods=["POST"])
def mark_as_delivered(delivery_id: str):
    result = Delivery.mark_as_delivered(delivery_id)
    return jsonify(result), 200 if result["success"] else 400


@deliverer.route("/deliverer/drop" , methods=["DELETE"])
def drop():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400

    delivery_id  = data.get("delivery_id")
    deliverer_id = data.get("deliverer_id")
    if not delivery_id or not deliverer_id:
        return jsonify({"success": False, "message": "delivery_id and deliverer_id are required"}), 400
    result = Delivery.drop_by_deliverer(delivery_id, deliverer_id)
    return jsonify(result), 200 if result["success"] else 400
