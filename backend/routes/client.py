from delivery import Delivery
from __init__ import deliveries_collection, users_collection
from flask import Blueprint, request
from auth_utils import require_auth
from api_response import fail, success
from schemas import (
    CancelDeliverySchema,
    CreateDeliverySchema,
    CreateRequestSchema,
    SelectDelivererSchema,
    validate_payload,
)
from matching import DeliveryRequest

client = Blueprint("client", __name__)


def _validate_client(client_id: str):
    client_data = users_collection.find_one({"_id": client_id})
    if not client_data:
        return fail("client not found", 404)
    if client_data.get("role") != "client":
        return fail("user is not a client", 403)
    return None


@client.route("/deliveries", methods=["POST"])
@require_auth("client")
def create_delivery_for_client():
    """Create a new delivery for a client."""
    data, error = validate_payload(CreateDeliverySchema(), request.get_json(silent=True))
    if error:
        return error

    if data["price"] <= 0:
        return fail("price must be positive", 400, code="VALIDATION_ERROR")

    role_error = _validate_client(data["client_id"])
    if role_error:
        return role_error
    if request.current_user.get("_id") != data["client_id"]:
        return fail("client_id does not match token user", 403, code="FORBIDDEN")

    delivery = Delivery(
        data["client_id"],
        data["pickup_address"],
        data["dropoff_address"],
        data["description_of_order"],
        float(data["price"]),
    )
    result = delivery.create()
    if result["success"]:
        return success(result.get("message", "Delivery created"), status=201)
    return fail(result.get("message", "Failed to create delivery"), 409)


@client.route("/deliveries/<client_id>", methods=["GET"])
@require_auth("client")
def get_client_deliveries(client_id: str):
    """Get all deliveries for a specific client."""
    role_error = _validate_client(client_id)
    if role_error:
        return role_error
    if request.current_user.get("_id") != client_id:
        return fail("client_id does not match token user", 403, code="FORBIDDEN")

    deliveries = list(deliveries_collection.find({"client_id": client_id}).sort("created_at", -1))
    for delivery in deliveries:
        delivery["_id"] = str(delivery["_id"])

    return success("Client deliveries loaded", data={"deliveries": deliveries}, status=200)


@client.route("/deliverers/history", methods=["GET"])
@require_auth("client")
def client_deliverer_history():
    """
    Return the real deliverers this client has worked with (based on deliveries collection).
    Used by DelivererHistory page (no more fake data).
    """
    client_id = request.current_user.get("_id")
    deliveries = list(
        deliveries_collection.find(
            {"client_id": client_id, "deliverer_id": {"$ne": None}},
            {"deliverer_id": 1, "deliverer_name": 1, "price": 1, "created_at": 1, "status": 1},
        ).sort("created_at", -1)
    )

    # Keep one entry per deliverer, using the most recent delivery as "last order".
    by_deliverer: dict[str, dict] = {}
    for d in deliveries:
        did = d.get("deliverer_id")
        if not did or did in by_deliverer:
            continue
        created = d.get("created_at")
        by_deliverer[did] = {
            "deliverer_id": did,
            "name": d.get("deliverer_name") or "Deliverer",
            "lastOrderAmount": float(d.get("price", 0) or 0),
            "lastOrderDate": created.isoformat() if hasattr(created, "isoformat") else str(created or ""),
            "lastStatus": d.get("status") or "",
        }

    return success("Deliverer history loaded", data={"deliverers": list(by_deliverer.values())}, status=200)


@client.route("/deliveries/track/<delivery_id>", methods=["GET"])
@require_auth("client")
def track_delivery(delivery_id: str):
    """Track the status of a specific delivery."""
    result = Delivery.track(delivery_id)
    if result["success"]:
        return success("Delivery tracked", data={"delivery": result["delivery"]}, status=200)
    status = 404 if "not found" in result.get("message", "").lower() else 400
    return fail(result.get("message", "Tracking failed"), status)


@client.route("/deliveries/active", methods=["GET"])
@require_auth("client")
def get_active_delivery():
    """Return the client's currently active (accepted) delivery, if any."""
    client_id = request.current_user.get("_id")
    delivery = deliveries_collection.find_one(
        {"client_id": client_id, "status": {"$in": ["accepted", "in_transit"]}},
        sort=[("created_at", -1)],
    )
    if not delivery:
        return success("No active delivery", data={"delivery": None}, status=200)
    if not delivery.get("deliverer_name"):
        deliverer = users_collection.find_one({"_id": delivery.get("deliverer_id")}, {"username": 1, "name": 1})
        delivery["deliverer_name"] = (deliverer or {}).get("name") or (deliverer or {}).get("username") or "Deliverer"
    if not delivery.get("client_name"):
        client = users_collection.find_one({"_id": delivery.get("client_id")}, {"username": 1, "name": 1})
        delivery["client_name"] = (client or {}).get("name") or (client or {}).get("username") or "Client"
    delivery["_id"] = str(delivery["_id"])
    return success("Active delivery loaded", data={"delivery": delivery}, status=200)


@client.route("/client/cancel", methods=["DELETE"])
@require_auth("client")
def cancel_delivery():
    """Cancel a delivery by client."""
    data, error = validate_payload(CancelDeliverySchema(), request.get_json(silent=True))
    if error:
        return error

    role_error = _validate_client(data["client_id"])
    if role_error:
        return role_error
    if request.current_user.get("_id") != data["client_id"]:
        return fail("client_id does not match token user", 403, code="FORBIDDEN")

    result = Delivery.cancel_by_client(data["delivery_id"], data["client_id"])
    if result["success"]:
        return success(result.get("message", "Delivery cancelled"), status=200)
    return fail(result.get("message", "Cancel failed"), 400)


@client.route("/deliveries/cancel/<delivery_id>", methods=["POST"])
@require_auth("client")
def cancel_active_delivery(delivery_id: str):
    result = Delivery.cancel_by_client(delivery_id, request.current_user.get("_id"))
    if result["success"]:
        return success(result.get("message", "Delivery cancelled"), status=200)
    msg = (result.get("message") or "").lower()
    if "not found" in msg:
        return fail(result.get("message", "Delivery not found"), 404)
    if "own" in msg:
        return fail(result.get("message", "Forbidden"), 403, code="FORBIDDEN")
    return fail(result.get("message", "Cancel failed"), 400)


@client.route("/requests", methods=["POST"])
@require_auth("client")
def create_request():
    """Create a delivery request that deliverers can accept, then client selects deliverer."""
    data, error = validate_payload(CreateRequestSchema(), request.get_json(silent=True))
    if error:
        return error

    if request.current_user.get("_id") != data["client_id"]:
        return fail("client_id does not match token user", 403, code="FORBIDDEN")

    if data["price"] <= 0:
        return fail("price must be positive", 400, code="VALIDATION_ERROR")

    result = DeliveryRequest.create(
        client_id=data["client_id"],
        pickup=data["pickup"],
        dropoff=data["dropoff"],
        description=data["description"],
        price=float(data["price"]),
        package_meta={
            "size": data.get("size") or "",
            "weight": data.get("weight") or "",
            "fragile": bool(data.get("fragile", False)),
            "photo_name": data.get("photo_name") or "",
            "photo_size": int(data.get("photo_size") or 0),
        },
        pickup_lat=data.get("pickup_lat"),
        pickup_lng=data.get("pickup_lng"),
        dropoff_lat=data.get("dropoff_lat"),
        dropoff_lng=data.get("dropoff_lng"),
    )
    if not result.get("success"):
        code = result.get("code")
        if code in ("REQUEST_ALREADY_ACTIVE", "DELIVERY_ALREADY_ACTIVE"):
            return fail(result.get("message", "Active request exists"), 409, code=code)
        return fail(result.get("message", "Request creation failed"), 400, code=code)
    return success("Request created", data=result, status=201)


@client.route("/requests/<request_id>/offers", methods=["GET"])
@require_auth("client")
def get_request_offers(request_id: str):
    """List deliverers who accepted (offered) this request."""
    client_id = request.current_user.get("_id")
    result = DeliveryRequest.list_offers_for_client(request_id, client_id)
    if not result["success"]:
        return fail(result["message"], 404)
    return success("Offers loaded", data={"offers": result["offers"], "request": result["request"]}, status=200)


@client.route("/requests/active", methods=["GET"])
@require_auth("client")
def get_active_request():
    client_id = request.current_user.get("_id")
    req = DeliveryRequest.get_active_request_for_client(client_id)
    return success("Active request loaded", data={"request": req}, status=200)


@client.route("/requests/<request_id>/select", methods=["POST"])
@require_auth("client")
def select_deliverer(request_id: str):
    """Client selects a deliverer from accepted offers, creating the real delivery/order."""
    data, error = validate_payload(SelectDelivererSchema(), request.get_json(silent=True))
    if error:
        return error

    client_id = request.current_user.get("_id")
    result = DeliveryRequest.select_deliverer(request_id, client_id, data["deliverer_id"])
    if result["success"]:
        return success("Deliverer selected", data=result, status=200)
    msg = result.get("message", "Selection failed")
    code = result.get("code")
    if code == "DELIVERER_BUSY":
        return fail(msg, 409, code=code)
    if code == "NOT_IN_OFFERS":
        return fail(msg, 409, code=code)
    return fail(msg, 400, code=code)
