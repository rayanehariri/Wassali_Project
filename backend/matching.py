import uuid
from datetime import datetime, timezone

from __init__ import DeliveryStatus, deliveries_collection, delivery_requests, users_collection


def _utc_now():
    return datetime.now(timezone.utc)

def _norm_wilaya(value: str) -> str:
    raw = (value or "").strip().lower()
    if not raw:
        return ""
    # Supports values like "02 - Chlef", "02 – Chlef", "Chlef".
    for sep in (" - ", " – ", "- ", "– "):
        if sep in raw:
            raw = raw.split(sep, 1)[1].strip()
            break
    return raw


def _serialize_request_doc(doc: dict) -> dict:
    """Make Mongo request docs JSON-safe (Flask jsonify chokes on some BSON types)."""
    out = dict(doc)
    out["_id"] = str(out["_id"])
    for key in ("created_at", "updated_at"):
        v = out.get(key)
        if hasattr(v, "isoformat"):
            out[key] = v.isoformat()
    offers_out = []
    for o in out.get("offers") or []:
        oo = dict(o)
        at = oo.get("accepted_at")
        if hasattr(at, "isoformat"):
            oo["accepted_at"] = at.isoformat()
        offers_out.append(oo)
    out["offers"] = offers_out
    return out


class DeliveryRequest:
    """
    A delivery request is created by a client. Deliverers can "accept" (offer),
    then the client selects one deliverer. Once selected, a Delivery record is created.
    """

    @staticmethod
    def create(
        client_id: str,
        pickup: dict,
        dropoff: dict,
        description: str,
        price: float,
        package_meta: dict | None = None,
        pickup_lat: float | None = None,
        pickup_lng: float | None = None,
        dropoff_lat: float | None = None,
        dropoff_lng: float | None = None,
    ) -> dict:
        # A client can only have one active request/delivery at a time.
        existing_request = delivery_requests.find_one(
            {
                "client_id": client_id,
                "status": {"$in": [DeliveryStatus.PENDING.value, DeliveryStatus.AWAITING_CLIENT.value]},
            }
        )
        if existing_request:
            return {
                "success": False,
                "code": "REQUEST_ALREADY_ACTIVE",
                "message": "You already have an active request. Wait until it is completed before creating a new one.",
            }
        existing_delivery = deliveries_collection.find_one(
            {"client_id": client_id, "status": {"$in": [DeliveryStatus.ACCEPTED.value, DeliveryStatus.IN_TRANSIT.value]}}
        )
        if existing_delivery:
            return {
                "success": False,
                "code": "DELIVERY_ALREADY_ACTIVE",
                "message": "You already have an active delivery in progress.",
            }

        request_id = str(uuid.uuid4())
        pickup = dict(pickup or {})
        dropoff = dict(dropoff or {})
        pickup_coords = pickup.get("coords")
        dropoff_coords = dropoff.get("coords")
        if not pickup_coords and pickup_lat is not None and pickup_lng is not None:
            pickup_coords = [pickup_lat, pickup_lng]
        if not dropoff_coords and dropoff_lat is not None and dropoff_lng is not None:
            dropoff_coords = [dropoff_lat, dropoff_lng]
        client_doc = users_collection.find_one({"_id": client_id}, {"username": 1, "name": 1})
        client_name = (client_doc or {}).get("name") or (client_doc or {}).get("username") or "Client"
        doc = {
            "_id": request_id,
            "client_id": client_id,
            "client_name": client_name,
            "pickup": {
                "label": pickup.get("label") or pickup.get("address") or "",
                "address": pickup.get("address") or pickup.get("label") or "",
                "wilaya": pickup.get("wilaya") or "",
                "commune": pickup.get("commune") or "",
                "coords": pickup_coords,
            },
            "dropoff": {
                "label": dropoff.get("label") or dropoff.get("address") or "",
                "address": dropoff.get("address") or dropoff.get("label") or "",
                "wilaya": dropoff.get("wilaya") or "",
                "commune": dropoff.get("commune") or "",
                "coords": dropoff_coords,
            },
            "package": {"label": description},
            "package_meta": package_meta or {},
            "payout": int(price),
            "urgent": False,
            "deliverBy": None,
            "status": DeliveryStatus.PENDING.value,
            "offers": [],  # list[{deliverer_id, accepted_at}]
            "selected_deliverer_id": None,
            "created_at": _utc_now(),
            "updated_at": _utc_now(),
        }
        delivery_requests.insert_one(doc)
        return {"success": True, "requestId": request_id}

    @staticmethod
    def deliverer_has_active_assignment(deliverer_id: str) -> bool:
        """True if this deliverer already has an in-progress assigned delivery (client confirmed)."""
        d = deliveries_collection.find_one(
            {"deliverer_id": deliverer_id, "status": {"$in": [DeliveryStatus.ACCEPTED.value, DeliveryStatus.IN_TRANSIT.value]}}
        )
        return d is not None

    @staticmethod
    def list_incoming_for_deliverer(deliverer_id: str) -> list[dict]:
        """
        Requests this deliverer can still accept: open (pending or awaiting client) and they have
        not placed an offer yet. Empty if they already have an active assigned job.
        """
        if DeliveryRequest.deliverer_has_active_assignment(deliverer_id):
            return []
        open_statuses = [DeliveryStatus.PENDING.value, DeliveryStatus.AWAITING_CLIENT.value]
        deliverer_doc = users_collection.find_one({"_id": deliverer_id}, {"wilaya": 1})
        deliverer_wilaya = _norm_wilaya((deliverer_doc or {}).get("wilaya") or "")
        reqs = list(delivery_requests.find({"status": {"$in": open_statuses}}))
        out: list[dict] = []
        for r in reqs:
            if any(o.get("deliverer_id") == deliverer_id for o in r.get("offers", [])):
                continue
            if deliverer_id in (r.get("rejected_by") or []):
                continue
            req_pickup_wilaya = _norm_wilaya((r.get("pickup") or {}).get("wilaya") or "")
            if deliverer_wilaya and req_pickup_wilaya and req_pickup_wilaya != deliverer_wilaya:
                continue
            if not r.get("client_name") and r.get("client_id"):
                client_doc = users_collection.find_one(
                    {"_id": r.get("client_id")},
                    {"username": 1, "name": 1},
                )
                if client_doc:
                    r["client_name"] = client_doc.get("name") or client_doc.get("username") or "Client"
            out.append(_serialize_request_doc(r))
        return out

    @staticmethod
    def accept(request_id: str, deliverer_id: str) -> dict:
        # Add offer if not already offered.
        now = _utc_now()
        if DeliveryRequest.deliverer_has_active_assignment(deliverer_id):
            return {
                "success": False,
                "message": "You already have an active delivery. Complete it before accepting new requests.",
            }

        req = delivery_requests.find_one({"_id": request_id})
        if not req:
            return {"success": False, "message": "Request not found"}

        if req.get("status") not in [DeliveryStatus.PENDING.value, DeliveryStatus.AWAITING_CLIENT.value]:
            return {"success": False, "message": "Request is not available"}
        if deliverer_id in (req.get("rejected_by") or []):
            return {"success": False, "message": "You already rejected this request"}

        offers = req.get("offers", [])
        if any(o.get("deliverer_id") == deliverer_id for o in offers):
            return {"success": False, "message": "Already accepted"}

        delivery_requests.update_one(
            {"_id": request_id},
            {
                "$push": {"offers": {"deliverer_id": deliverer_id, "accepted_at": now}},
                "$set": {"status": DeliveryStatus.AWAITING_CLIENT.value, "updated_at": now},
            },
        )

        updated = delivery_requests.find_one({"_id": request_id})
        return {
            "success": True,
            "phase": "awaiting_client_selection",
            "request": DeliveryRequest._to_waiting_item(updated, deliverer_id),
        }

    @staticmethod
    def reject(request_id: str, deliverer_id: str) -> dict:
        req = delivery_requests.find_one({"_id": request_id})
        if not req:
            return {"success": False, "message": "Request not found"}
        if req.get("status") not in [DeliveryStatus.PENDING.value, DeliveryStatus.AWAITING_CLIENT.value]:
            return {"success": False, "message": "Request is not available"}
        delivery_requests.update_one(
            {"_id": request_id},
            {"$addToSet": {"rejected_by": deliverer_id}, "$set": {"updated_at": _utc_now()}},
        )
        return {"success": True}

    @staticmethod
    def list_awaiting_client_for_deliverer(deliverer_id: str) -> list[dict]:
        if DeliveryRequest.deliverer_has_active_assignment(deliverer_id):
            return []
        reqs = list(
            delivery_requests.find(
                {
                    "status": DeliveryStatus.AWAITING_CLIENT.value,
                    "offers.deliverer_id": deliverer_id,
                }
            )
        )
        return [DeliveryRequest._to_waiting_item(r, deliverer_id) for r in reqs]

    @staticmethod
    def list_offers_for_client(request_id: str, client_id: str) -> dict:
        req = delivery_requests.find_one({"_id": request_id, "client_id": client_id})
        if not req:
            return {"success": False, "message": "Request not found"}
        if req.get("status") not in [DeliveryStatus.AWAITING_CLIENT.value, DeliveryStatus.PENDING.value]:
            return {"success": False, "message": "Request is not selectable"}
        offers = req.get("offers", [])

        deliverer_ids = [o.get("deliverer_id") for o in offers if o.get("deliverer_id")]
        deliverers = list(users_collection.find({"_id": {"$in": deliverer_ids}}, {"password": 0}))
        deliverer_map = {d.get("_id"): d for d in deliverers}

        enriched = []
        for o in offers:
            did = o.get("deliverer_id")
            d = deliverer_map.get(did) or {}
            enriched.append(
                {
                    "deliverer_id": did,
                    "accepted_at": o.get("accepted_at"),
                    "deliverer": {
                        "_id": d.get("_id"),
                        "name": d.get("name") or d.get("username") or "Deliverer",
                        "email": d.get("email") or "",
                        "username": d.get("username") or "",
                        "avatar": d.get("avatar") or None,
                    },
                }
            )

        return {"success": True, "offers": enriched, "request": req}

    @staticmethod
    def get_active_request_for_client(client_id: str) -> dict | None:
        req = delivery_requests.find_one(
            {
                "client_id": client_id,
                "status": {"$in": [DeliveryStatus.PENDING.value, DeliveryStatus.AWAITING_CLIENT.value]},
            },
            sort=[("updated_at", -1)],
        )
        if not req:
            return None
        return _serialize_request_doc(req)

    @staticmethod
    def select_deliverer(request_id: str, client_id: str, deliverer_id: str) -> dict:
        now = _utc_now()
        req = delivery_requests.find_one({"_id": request_id, "client_id": client_id})
        if not req:
            return {"success": False, "message": "Request not found"}

        if req.get("status") != DeliveryStatus.AWAITING_CLIENT.value:
            return {"success": False, "message": "Request is not awaiting selection"}

        offers = req.get("offers", [])
        if not any(o.get("deliverer_id") == deliverer_id for o in offers):
            if DeliveryRequest.deliverer_has_active_assignment(deliverer_id):
                return {
                    "success": False,
                    "code": "DELIVERER_BUSY",
                    "message": "This courier is no longer available — they are already assigned to another delivery.",
                }
            return {
                "success": False,
                "code": "NOT_IN_OFFERS",
                "message": "This courier is not available for this request anymore.",
            }

        if DeliveryRequest.deliverer_has_active_assignment(deliverer_id):
            return {
                "success": False,
                "code": "DELIVERER_BUSY",
                "message": "This courier just took another job and is no longer available. Please choose another partner.",
            }

        client_doc = users_collection.find_one({"_id": client_id}, {"username": 1, "name": 1})
        deliverer_doc = users_collection.find_one({"_id": deliverer_id}, {"username": 1, "name": 1})
        client_name = (client_doc or {}).get("name") or (client_doc or {}).get("username") or "Client"
        deliverer_name = (deliverer_doc or {}).get("name") or (deliverer_doc or {}).get("username") or "Deliverer"

        # Create a real delivery (assigned).
        delivery_id = str(uuid.uuid4())
        delivery_doc = {
            "_id": delivery_id,
            "client_id": client_id,
            "client_name": client_name,
            "deliverer_id": deliverer_id,
            "deliverer_name": deliverer_name,
            "status": DeliveryStatus.ACCEPTED.value,
            "pickup_address": req.get("pickup", {}).get("label"),
            "pickup_coords": req.get("pickup", {}).get("coords"),
            "dropoff_address": req.get("dropoff", {}).get("label"),
            "dropoff_coords": req.get("dropoff", {}).get("coords"),
            "description_of_order": req.get("package", {}).get("label"),
            "price": float(req.get("payout", 0)),
            "created_at": now,
        }
        deliveries_collection.insert_one(delivery_doc)

        delivery_requests.update_one(
            {"_id": request_id},
            {
                "$set": {
                    "status": DeliveryStatus.ACCEPTED.value,
                    "selected_deliverer_id": deliverer_id,
                    "delivery_id": delivery_id,
                    "updated_at": now,
                }
            },
        )

        DeliveryRequest.withdraw_deliverer_from_other_requests(deliverer_id, request_id)

        return {
            "success": True,
            "phase": "client_confirmed",
            "orderId": delivery_id,
            "pickupAt": delivery_doc.get("pickup_address"),
            "clientName": client_name,
            "delivererName": deliverer_name,
        }

    @staticmethod
    def withdraw_deliverer_from_other_requests(deliverer_id: str, keep_request_id: str) -> None:
        """
        When a client selects this deliverer for one request, remove their offers from every
        other open request so they no longer appear in waiting lists and other clients do not
        keep stale options.
        """
        cursor = delivery_requests.find(
            {
                "_id": {"$ne": keep_request_id},
                "offers.deliverer_id": deliverer_id,
            }
        )
        for req in cursor:
            rid = req["_id"]
            new_offers = [o for o in req.get("offers", []) if o.get("deliverer_id") != deliverer_id]
            new_status = req.get("status")
            if new_status == DeliveryStatus.AWAITING_CLIENT.value and len(new_offers) == 0:
                new_status = DeliveryStatus.PENDING.value
            delivery_requests.update_one(
                {"_id": rid},
                {"$set": {"offers": new_offers, "status": new_status, "updated_at": _utc_now()}},
            )

    @staticmethod
    def get_active_task_for_deliverer(deliverer_id: str) -> dict | None:
        delivery = deliveries_collection.find_one(
            {"deliverer_id": deliverer_id, "status": {"$in": [DeliveryStatus.ACCEPTED.value, DeliveryStatus.IN_TRANSIT.value]}}
        )
        if not delivery:
            return None
        status = delivery.get("status")
        if status == DeliveryStatus.IN_TRANSIT.value:
            status_label = "In Transit"
        elif status == DeliveryStatus.DELIVERED.value:
            status_label = "Delivered"
        else:
            status_label = "Awaiting Pickup"
        price = delivery.get("price")
        try:
            price_num = float(price or 0)
        except (TypeError, ValueError):
            price_num = 0.0
        return {
            "orderId": delivery.get("_id"),
            "status": status,
            "raw_status": status,
            "status_label": status_label,
            "acceptedAgo": "just now",
            "pickupAt": delivery.get("pickup_address"),
            "pickup_address": delivery.get("pickup_address"),
            "dropoff_address": delivery.get("dropoff_address"),
            "pickup_coords": delivery.get("pickup_coords"),
            "dropoff_coords": delivery.get("dropoff_coords"),
            "price": price_num,
            "client_name": delivery.get("client_name"),
            "client_id": delivery.get("client_id"),
        }

    @staticmethod
    def navigation_details(delivery_id: str, deliverer_id: str) -> dict:
        delivery = deliveries_collection.find_one({"_id": delivery_id, "deliverer_id": deliverer_id})
        if not delivery:
            return {"success": False, "message": "Order not found"}
        return {
            "success": True,
            "order": {
                "orderId": delivery.get("_id"),
                "pickup": delivery.get("pickup_address"),
                "pickupCoords": delivery.get("pickup_coords"),
                "dropoff": delivery.get("dropoff_address"),
                "dropoffCoords": delivery.get("dropoff_coords"),
                "description": delivery.get("description_of_order"),
                "price": delivery.get("price"),
                "status": delivery.get("status"),
                "clientName": delivery.get("client_name") or "Client",
                "delivererName": delivery.get("deliverer_name") or "Deliverer",
            },
        }

    @staticmethod
    def _to_waiting_item(req: dict, deliverer_id: str) -> dict:
        accepted_at = None
        for o in req.get("offers", []):
            if o.get("deliverer_id") == deliverer_id:
                accepted_at = o.get("accepted_at")
                break
        client_name = req.get("client_name")
        if not client_name and req.get("client_id"):
            client_doc = users_collection.find_one(
                {"_id": req.get("client_id")},
                {"username": 1, "name": 1},
            )
            client_name = (client_doc or {}).get("name") or (client_doc or {}).get("username")
        return {
            "id": req.get("_id"),
            "customer": {
                "name": client_name or f"Client {req.get('client_id', '')[:6]}",
                "avatar": "CL",
                "type": "person",
            },
            "client_id": req.get("client_id"),
            "client_name": client_name,
            "payout": req.get("payout"),
            "pickup": req.get("pickup"),
            "dropoff": req.get("dropoff"),
            "package": req.get("package"),
            "deliverBy": req.get("deliverBy"),
            "urgent": req.get("urgent"),
            "waitingSince": accepted_at.isoformat() if hasattr(accepted_at, "isoformat") else None,
        }

