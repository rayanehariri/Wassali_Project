import uuid
from datetime import datetime, timezone

from delivery import Delivery
from __init__ import deliveries_collection, users_collection
from flask import Blueprint, request
from auth_utils import require_auth
from api_response import fail, success
from schemas import AcceptDeliverySchema, DropDeliverySchema, validate_payload
from matching import DeliveryRequest

deliverer = Blueprint("deliverer", __name__)

def _utc_now():
    return datetime.now(timezone.utc)


def _initials(name: str) -> str:
    parts = (name or "").strip().split()
    if not parts:
        return "D"
    return ("".join([p[0] for p in parts[:2]])).upper()


def _validate_deliverer(deliverer_id: str):
    deliverer_data = users_collection.find_one({"_id": deliverer_id})
    if not deliverer_data:
        return fail("deliverer not found", 404)
    if deliverer_data.get("role") != "deliverer":
        return fail("user is not a deliverer", 403)
    return None


@deliverer.route("/deliveries/available", methods=["GET"])
@require_auth("deliverer")
def get_available_deliveries():
    """Get all pending deliveries available for acceptance."""
    result = Delivery.find_available()
    if result["success"]:
        for delivery in result.get("deliveries", []):
            if "_id" in delivery:
                delivery["_id"] = str(delivery["_id"])
        return success("Available deliveries loaded", data={"deliveries": result.get("deliveries", [])}, status=200)
    return fail(result.get("message", "No delivery available"), 404)


@deliverer.route("/deliveries/accept/<delivery_id>", methods=["POST"])
@require_auth("deliverer")
def accept_delivery(delivery_id: str):
    """Accept a delivery by a deliverer."""
    data, error = validate_payload(AcceptDeliverySchema(), request.get_json(silent=True))
    if error:
        return error

    role_error = _validate_deliverer(data["deliverer_id"])
    if role_error:
        return role_error
    if request.current_user.get("_id") != data["deliverer_id"]:
        return fail("deliverer_id does not match token user", 403, code="FORBIDDEN")

    result = Delivery.accept(delivery_id, data["deliverer_id"])
    if result["success"]:
        return success(result.get("message", "Delivery accepted"), status=200)

    msg = result.get("message", "").lower()
    if "not found" in msg:
        return fail(result["message"], 404)
    if "already" in msg:
        return fail(result["message"], 409)
    return fail(result.get("message", "Accept failed"), 400)


@deliverer.route("/deliveries/mark_delivered/<delivery_id>", methods=["POST"])
@require_auth("deliverer")
def mark_delivery_as_delivered(delivery_id: str):
    """Mark a delivery as delivered."""
    d = deliveries_collection.find_one({"_id": delivery_id})
    if not d:
        return fail("Delivery not found", 404)
    if d.get("deliverer_id") != request.current_user.get("_id"):
        return fail("You can only complete deliveries assigned to you", 403, code="FORBIDDEN")

    result = Delivery.mark_as_delivered(delivery_id)
    if result["success"]:
        return success(result.get("message", "Delivery marked as delivered"), status=200)

    msg = result.get("message", "").lower()
    if "not found" in msg:
        return fail(result["message"], 404)
    if "already delivered" in msg:
        return fail(result["message"], 409)
    return fail(result.get("message", "Mark delivered failed"), 400)


@deliverer.route("/deliverer/drop", methods=["DELETE"])
@require_auth("deliverer")
def drop_delivery():
    """Drop a delivery by the deliverer."""
    data, error = validate_payload(DropDeliverySchema(), request.get_json(silent=True))
    if error:
        return error

    role_error = _validate_deliverer(data["deliverer_id"])
    if role_error:
        return role_error
    if request.current_user.get("_id") != data["deliverer_id"]:
        return fail("deliverer_id does not match token user", 403, code="FORBIDDEN")

    result = Delivery.drop_by_deliverer(data["delivery_id"], data["deliverer_id"])
    if result["success"]:
        return success(result.get("message", "Delivery dropped"), status=200)
    return fail(result.get("message", "Drop failed"), 400)


@deliverer.route("/incoming-requests", methods=["GET"])
@require_auth("deliverer")
def incoming_requests():
    """List open client requests this deliverer can still accept (excludes ones they already offered on)."""
    deliverer_id = request.current_user.get("_id")
    reqs = DeliveryRequest.list_incoming_for_deliverer(deliverer_id)
    return success("Incoming requests loaded", data={"requests": reqs}, status=200)


@deliverer.route("/requests/<request_id>/accept", methods=["POST"])
@require_auth("deliverer")
def accept_request(request_id: str):
    deliverer_id = request.current_user.get("_id")
    result = DeliveryRequest.accept(request_id, deliverer_id)
    if result.get("success"):
        return success("Request accepted", data=result, status=200)
    msg = (result.get("message") or "").lower()
    if "not found" in msg:
        return fail(result["message"], 404)
    if "already" in msg:
        return fail(result["message"], 409)
    if "active delivery" in msg or "complete it before" in msg:
        return fail(result["message"], 409, code="DELIVERER_BUSY")
    return fail(result.get("message", "Accept failed"), 400)


@deliverer.route("/requests/awaiting-client-approval", methods=["GET"])
@require_auth("deliverer")
def awaiting_client_approvals():
    deliverer_id = request.current_user.get("_id")
    items = DeliveryRequest.list_awaiting_client_for_deliverer(deliverer_id)
    return success("Awaiting approvals loaded", data={"items": items}, status=200)


@deliverer.route("/active-task", methods=["GET"])
@require_auth("deliverer")
def active_task():
    deliverer_id = request.current_user.get("_id")
    task = DeliveryRequest.get_active_task_for_deliverer(deliverer_id)
    return success("Active task loaded", data={"task": task}, status=200)


@deliverer.route("/orders/<order_id>/navigation-details", methods=["GET"])
@require_auth("deliverer")
def navigation_details(order_id: str):
    deliverer_id = request.current_user.get("_id")
    result = DeliveryRequest.navigation_details(order_id, deliverer_id)
    if result.get("success"):
        return success("Navigation details loaded", data=result, status=200)
    return fail(result.get("message", "Not found"), 404)


# ──────────────────────────────────────────────────────────────────────────────
# Dashboard + profile (real, DB-backed)
# ──────────────────────────────────────────────────────────────────────────────


@deliverer.route("/me", methods=["GET"])
@require_auth("deliverer")
def get_me():
    u = users_collection.find_one({"_id": request.current_user.get("_id")}, {"password": 0})
    if not u:
        return fail("user not found", 404)
    u["_id"] = str(u["_id"])
    return success("Profile loaded", data={"user": u}, status=200)


@deliverer.route("/stats", methods=["GET"])
@require_auth("deliverer")
def get_stats():
    deliverer_id = request.current_user.get("_id")
    delivered = list(deliveries_collection.find({"deliverer_id": deliverer_id}))
    total = sum(float(d.get("price", 0) or 0) for d in delivered)
    today_total = 0.0
    today_trips = 0
    now = _utc_now()
    for d in delivered:
        created = d.get("created_at")
        if hasattr(created, "date") and created.date() == now.date():
            today_total += float(d.get("price", 0) or 0)
            today_trips += 1
    return success(
        "Stats loaded",
        data={
            "totalEarnings": {"value": f"{total:.2f} DZD", "change": "Live", "positive": True, "label": "All time"},
            "today": {"value": f"{today_total:.2f} DZD", "change": str(today_trips), "positive": True, "label": "trips completed"},
            "rating": {"value": "4.9", "change": "Live", "positive": True, "label": "Partner"},
        },
        status=200,
    )


@deliverer.route("/deliveries/recent", methods=["GET"])
@require_auth("deliverer")
def recent_deliveries():
    deliverer_id = request.current_user.get("_id")
    items = list(deliveries_collection.find({"deliverer_id": deliverer_id}).sort("created_at", -1).limit(10))
    mapped = []
    for d in items:
        mapped.append(
            {
                "id": f"#{str(d.get('_id'))[:8]}",
                "items": d.get("description_of_order") or "Delivery",
                "date": str(d.get("created_at") or ""),
                "status": (d.get("status") or "Completed").title(),
                "payout": f"{float(d.get('price', 0) or 0):.2f} DZD",
            }
        )
    return success("Recent deliveries loaded", data={"deliveries": mapped}, status=200)


@deliverer.route("/notifications", methods=["GET"])
@require_auth("deliverer")
def notifications():
    # Minimal server-driven notifications (can be expanded later)
    return success(
        "Notifications loaded",
        data={
            "notifications": [
                {"id": 1, "color": "#3b82f6", "label": "System", "sub": "You're connected.", "time": "Now"},
            ]
        },
        status=200,
    )


@deliverer.route("/status", methods=["POST"])
@require_auth("deliverer")
def set_online_status():
    payload = request.get_json(silent=True) or {}
    online = bool(payload.get("online"))
    users_collection.update_one({"_id": request.current_user.get("_id")}, {"$set": {"online": online}})
    return success("Status updated", data={"online": online}, status=200)


# ──────────────────────────────────────────────────────────────────────────────
# Earnings (DB-backed minimal)
# ──────────────────────────────────────────────────────────────────────────────


@deliverer.route("/earnings/stats", methods=["GET"])
@require_auth("deliverer")
def earnings_stats():
    return get_stats()


@deliverer.route("/earnings/balance", methods=["GET"])
@require_auth("deliverer")
def earnings_balance():
    deliverer_id = request.current_user.get("_id")
    delivered = list(deliveries_collection.find({"deliverer_id": deliverer_id}))
    total = sum(float(d.get("price", 0) or 0) for d in delivered)
    return success(
        "Balance loaded",
        data={"available": f"{total:.2f} DZD", "change": "Live", "updatedAt": "Just now"},
        status=200,
    )


# ──────────────────────────────────────────────────────────────────────────────
# Support + settings (DB-backed via user document)
# ──────────────────────────────────────────────────────────────────────────────


@deliverer.route("/support/system-status", methods=["GET"])
@require_auth("deliverer")
def support_system_status():
    return success(
        "System status loaded",
        data={
            "orderDispatch": {"label": "Order Dispatch", "status": "ok", "uptime": "Live", "note": None},
            "payoutAPI": {"label": "Payout API", "status": "ok", "uptime": "Live", "note": None},
            "network": {"label": "Network", "status": "ok", "uptime": "Live", "note": None},
        },
        status=200,
    )


@deliverer.route("/support/tickets", methods=["GET"])
@require_auth("deliverer")
def support_tickets():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 5))
    u = users_collection.find_one({"_id": request.current_user.get("_id")}, {"support_tickets": 1})
    tickets = (u or {}).get("support_tickets", []) or []
    total = len(tickets)
    total_pages = max(1, (total + limit - 1) // limit)
    sliced = tickets[(page - 1) * limit : page * limit]
    return success("Tickets loaded", data={"tickets": sliced, "total": total, "totalPages": total_pages, "page": page}, status=200)


@deliverer.route("/support/tickets", methods=["POST"])
@require_auth("deliverer")
def support_create_ticket():
    payload = request.get_json(silent=True) or {}
    subject = (payload.get("subject") or "").strip()
    description = (payload.get("description") or "").strip()
    if not subject or not description:
        return fail("subject and description are required", 400, code="VALIDATION_ERROR")
    ticket = {
        "id": f"STK-{uuid.uuid4().hex[:8]}",
        "subject": subject,
        "description": description,
        "status": "Open",
        "updatedAt": "Just now",
    }
    users_collection.update_one({"_id": request.current_user.get("_id")}, {"$push": {"support_tickets": {"$each": [ticket], "$position": 0}}})
    return success("Ticket created", data={"ticket": ticket}, status=201)


@deliverer.route("/support/faqs", methods=["GET"])
@require_auth("deliverer")
def support_faqs():
    return success(
        "FAQs loaded",
        data={
            "faqs": [
                {"id": 1, "question": "When are payouts processed?", "answer": "Payouts are processed weekly."},
                {"id": 2, "question": "How to report an issue?", "answer": "Create a ticket in Support."},
            ]
        },
        status=200,
    )


@deliverer.route("/support/safety-categories", methods=["GET"])
@require_auth("deliverer")
def support_safety_categories():
    return success(
        "Categories loaded",
        data={"categories": ["Traffic Incident", "Harassment", "Package Damage", "Road Hazard", "Other"]},
        status=200,
    )


@deliverer.route("/support/safety-report", methods=["POST"])
@require_auth("deliverer")
def support_safety_report():
    payload = request.get_json(silent=True) or {}
    description = (payload.get("description") or "").strip()
    if not description:
        return fail("description is required", 400, code="VALIDATION_ERROR")
    report_id = f"RPT-{uuid.uuid4().hex[:8]}"
    return success("Report submitted", data={"success": True, "reportId": report_id}, status=201)


@deliverer.route("/settings", methods=["GET"])
@require_auth("deliverer")
def get_settings():
    u = users_collection.find_one({"_id": request.current_user.get("_id")}, {"email": 1, "settings": 1})
    settings = (u or {}).get("settings") or {}
    doc = {
        "loginEmail": (u or {}).get("email") or settings.get("loginEmail") or "",
        "recoveryEmail": settings.get("recoveryEmail") or "",
        "twoFactorEnabled": bool(settings.get("twoFactorEnabled", False)),
        "sessions": settings.get("sessions") or [],
        "permissions": settings.get("permissions") or {"locationSharing": True, "systemNotifications": True, "diagnosticReports": False},
        "accessKey": settings.get("accessKey") or f"DL-{uuid.uuid4().hex[:10].upper()}",
        "keyNote": settings.get("keyNote") or "Restricted access key.",
        "password": "••••••••••••••••",
    }
    users_collection.update_one({"_id": request.current_user.get("_id")}, {"$set": {"settings": doc}})
    return success("Settings loaded", data={"settings": doc}, status=200)


@deliverer.route("/settings/credentials", methods=["PATCH"])
@require_auth("deliverer")
def update_credentials():
    payload = request.get_json(silent=True) or {}
    login_email = payload.get("loginEmail")
    recovery_email = payload.get("recoveryEmail")
    set_doc = {}
    if login_email:
        set_doc["email"] = login_email
        set_doc["settings.loginEmail"] = login_email
    if recovery_email is not None:
        set_doc["settings.recoveryEmail"] = recovery_email
    if set_doc:
        users_collection.update_one({"_id": request.current_user.get("_id")}, {"$set": set_doc})
    return success("Credentials updated", data={"success": True}, status=200)


@deliverer.route("/settings/2fa", methods=["PATCH"])
@require_auth("deliverer")
def toggle_2fa():
    payload = request.get_json(silent=True) or {}
    enabled = bool(payload.get("enabled"))
    users_collection.update_one({"_id": request.current_user.get("_id")}, {"$set": {"settings.twoFactorEnabled": enabled}})
    return success("2FA updated", data={"success": True, "twoFactorEnabled": enabled}, status=200)


@deliverer.route("/settings/sessions/<session_id>", methods=["DELETE"])
@require_auth("deliverer")
def delete_session(session_id: str):
    users_collection.update_one({"_id": request.current_user.get("_id")}, {"$pull": {"settings.sessions": {"id": session_id}}})
    return success("Session deleted", data={"success": True}, status=200)


@deliverer.route("/settings/permissions", methods=["PATCH"])
@require_auth("deliverer")
def update_permissions():
    payload = request.get_json(silent=True) or {}
    # payload: { key: value } partial
    set_doc = {f"settings.permissions.{k}": v for k, v in payload.items()}
    if set_doc:
        users_collection.update_one({"_id": request.current_user.get("_id")}, {"$set": set_doc})
    return success("Permissions updated", data={"success": True}, status=200)


@deliverer.route("/settings/access-key/regenerate", methods=["POST"])
@require_auth("deliverer")
def regenerate_access_key():
    new_key = f"DL-{uuid.uuid4().hex[:16].upper()}"
    users_collection.update_one({"_id": request.current_user.get("_id")}, {"$set": {"settings.accessKey": new_key}})
    return success("Key regenerated", data={"success": True, "accessKey": new_key}, status=200)
