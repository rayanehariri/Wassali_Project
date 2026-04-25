from datetime import datetime, timezone

from __init__ import Role, users_collection, deliveries_collection
from models import User
from delivery import Delivery
from flask import Blueprint, request
from auth_utils import require_auth
from api_response import fail, success
from schemas import DeleteUserSchema, RejectDeliverySchema, validate_payload

admin = Blueprint("admin", __name__)


@admin.route("/users", methods=["GET"])
@require_auth(Role.ADMIN.value)
def get_users():
    """Get all users in the system (admin only)."""
    result = User.get_all_users(Role.ADMIN)
    if result["success"]:
        return success("Users loaded", data={"users": result.get("users", [])}, status=200)
    status = 403 if "not authorized" in result.get("message", "").lower() else 400
    return fail(result.get("message", "Failed to load users"), status)


@admin.route("/users/<id>", methods=["GET"])
@require_auth(Role.ADMIN.value)
def get_user_by_id(id: str):
    """Get a specific user by their ID (admin only)."""
    if not id:
        return fail("user ID is required", 400, code="VALIDATION_ERROR")

    result = User.find_user(id)
    if result["success"]:
        return success("User loaded", data={"user": result.get("user")}, status=200)
    status = 404 if "not found" in result.get("message", "").lower() else 400
    return fail(result.get("message", "Failed to load user"), status)


@admin.route("/delete/<username>", methods=["DELETE"])
@require_auth(Role.ADMIN.value)
def delete_user(username: str):
    """Delete a user (admin only)."""
    if not username:
        return fail("username is required", 400, code="VALIDATION_ERROR")

    data, error = validate_payload(DeleteUserSchema(), request.get_json(silent=True))
    if error:
        return error

    role = Role(data["role"])
    if role != Role.ADMIN:
        return fail("Only administrators can delete users", 403, code="FORBIDDEN")

    result = User.delete(username, data["password"], role)
    if result["success"]:
        return success(result.get("message", "User deleted"), status=200)

    msg = result.get("message", "").lower()
    if "not found" in msg or "does not exist" in msg:
        return fail(result["message"], 404)
    if "incorrect" in msg:
        return fail(result["message"], 401, code="AUTH_FAILED")
    if "not authorized" in msg:
        return fail(result["message"], 403, code="FORBIDDEN")
    return fail(result.get("message", "Delete failed"), 400)


@admin.route("/reject/<delivery_id>", methods=["DELETE"])
@require_auth(Role.ADMIN.value)
def reject_delivery(delivery_id: str):
    """Reject a delivery by admin."""
    if not delivery_id:
        return fail("delivery ID is required", 400, code="VALIDATION_ERROR")

    data, error = validate_payload(RejectDeliverySchema(), request.get_json(silent=True))
    if error:
        return error

    admin_data = users_collection.find_one({"_id": data["admin_id"]})
    if not admin_data:
        return fail("admin not found", 404)
    if admin_data.get("role") != "admin":
        return fail("user is not an administrator", 403, code="FORBIDDEN")

    result = Delivery.reject_by_admin(delivery_id, data["admin_id"], data["reason"])
    if result["success"]:
        return success(result.get("message", "Delivery rejected"), status=200)

    msg = result.get("message", "").lower()
    if "not found" in msg:
        return fail(result["message"], 404)
    return fail(result.get("message", "Reject failed"), 400)


@admin.route("/users/stats", methods=["GET"])
@require_auth(Role.ADMIN.value)
def user_stats():
    total = users_collection.count_documents({})
    banned = users_collection.count_documents({"status": "banned"})
    return success(
        "User stats loaded",
        data={
            "totalUsers": {"value": total, "change": "Live", "positive": True, "label": "Total registered accounts"},
            "newUsers": {"value": 0, "change": "Live", "positive": True, "label": "Growth this week"},
            "activeNow": {"value": 0, "change": "Live", "positive": True, "label": "Currently online users"},
            "bannedAccounts": {"value": banned, "change": "Live", "positive": False, "label": "Requires attention"},
        },
        status=200,
    )


@admin.route("/users", methods=["POST"])
@require_auth(Role.ADMIN.value)
def create_user():
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip()
    role = (payload.get("role") or "client").strip().lower()
    status = (payload.get("status") or "active").strip().lower()
    if role not in ["client", "deliverer", "admin"]:
        return fail("invalid role", 400, code="VALIDATION_ERROR")
    if status not in ["active", "inactive", "banned"]:
        return fail("invalid status", 400, code="VALIDATION_ERROR")
    if not name or not email:
        return fail("name and email are required", 400, code="VALIDATION_ERROR")
    if users_collection.find_one({"email": email}):
        return fail("email already exists", 409)
    doc = {
        "_id": payload.get("_id") or payload.get("id") or email,
        "name": name,
        "email": email,
        "role": role,
        "status": status,
        "created_at": datetime.now(timezone.utc),
    }
    users_collection.insert_one(doc)
    return success("User created", data={"user": doc}, status=201)


@admin.route("/users/<user_id>", methods=["PATCH"])
@require_auth(Role.ADMIN.value)
def patch_user(user_id: str):
    payload = request.get_json(silent=True) or {}
    set_doc = {}
    if "status" in payload:
        status = str(payload.get("status") or "").lower()
        if status not in ["active", "inactive", "banned"]:
            return fail("invalid status", 400, code="VALIDATION_ERROR")
        set_doc["status"] = status
    if "role" in payload:
        role = str(payload.get("role") or "").lower()
        if role not in ["client", "deliverer", "admin"]:
            return fail("invalid role", 400, code="VALIDATION_ERROR")
        set_doc["role"] = role
    if not set_doc:
        return fail("nothing to update", 400, code="VALIDATION_ERROR")
    result = users_collection.update_one({"_id": user_id}, {"$set": set_doc})
    if result.matched_count == 0:
        return fail("user not found", 404)
    u = users_collection.find_one({"_id": user_id}, {"password": 0})
    return success("User updated", data={"user": u}, status=200)


@admin.route("/users/<user_id>", methods=["DELETE"])
@require_auth(Role.ADMIN.value)
def delete_user_by_id(user_id: str):
    result = users_collection.delete_one({"_id": user_id})
    if result.deleted_count == 0:
        return fail("user not found", 404)
    return success("User deleted", data={"success": True}, status=200)


def _initials(name: str) -> str:
    parts = [p for p in (name or "").strip().split() if p]
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    if parts:
        return parts[0][:2].upper()
    return "—"


def _delivery_ui_status(raw: str | None) -> str:
    key = (raw or "").lower().strip()
    mapping = {
        "pending": "Pending",
        "accepted": "Assigned",
        "in_transit": "In Transit",
        "delivered": "Delivered",
        "cancelled": "Cancelled",
    }
    return mapping.get(key, (raw or "Pending").replace("_", " ").title())


def _coord_latlng(d: dict, pickup: bool):
    key = "pickup_coords" if pickup else "dropoff_coords"
    c = d.get(key)
    if isinstance(c, (list, tuple)) and len(c) >= 2:
        try:
            return float(c[0]), float(c[1])
        except (TypeError, ValueError):
            pass
    return (36.737, 3.086) if pickup else (36.742, 3.068)


def _serialize_admin_order(d: dict) -> dict:
    oid = str(d.get("_id", ""))
    cid = d.get("client_name") or "Client"
    did = d.get("deliverer_name") or "—"
    plat, plng = _coord_latlng(d, True)
    dlat, dlng = _coord_latlng(d, False)
    rlat, rlng = (plat + dlat) / 2, (plng + dlng) / 2
    return {
        "id": f"#{oid[:10]}",
        "placedAt": str(d.get("created_at") or "")[:19],
        "date": str(d.get("created_at") or "")[:19],
        "estimatedArrival": "—",
        "receiptId": oid[:12].upper(),
        "status": _delivery_ui_status(d.get("status")),
        "amount": f"{float(d.get('price', 0) or 0):.2f} DZD",
        "customer": {"name": cid, "avatar": _initials(cid), "rating": 0},
        "deliverer": {"name": did, "avatar": _initials(did), "rating": 0, "vehicle": "—"},
        "route": {
            "from": d.get("pickup_address") or "—",
            "to": d.get("dropoff_address") or "—",
        },
        "restaurantLocation": {"lat": plat, "lng": plng, "label": "Pickup"},
        "customerLocation": {"lat": dlat, "lng": dlng, "label": "Drop-off"},
        "riderLocation": {"lat": rlat, "lng": rlng},
        "items": [{"qty": 1, "name": d.get("description_of_order") or "Delivery", "price": f"{float(d.get('price', 0) or 0):.2f} DZD"}],
        "timeline": [
            {"label": "Order placed", "time": str(d.get("created_at") or "")[:16], "done": True, "active": False},
            {"label": "In progress", "time": None, "done": False, "active": True},
        ],
        "_mongoId": oid,
    }


@admin.route("/deliveries", methods=["GET"])
@require_auth(Role.ADMIN.value)
def admin_list_deliveries():
    status_filter = (request.args.get("status") or "All").strip()
    search = (request.args.get("search") or "").strip().lower()
    try:
        page = max(1, int(request.args.get("page") or 1))
    except ValueError:
        page = 1
    try:
        limit = min(50, max(1, int(request.args.get("limit") or 10)))
    except ValueError:
        limit = 10

    qfilter: dict = {}
    inv = {
        "Pending": "pending",
        "Assigned": "accepted",
        "In Transit": "in_transit",
        "Delivered": "delivered",
        "Cancelled": "cancelled",
    }
    if status_filter != "All" and status_filter in inv:
        qfilter["status"] = inv[status_filter]

    cursor = deliveries_collection.find(qfilter).sort("created_at", -1)
    rows = list(cursor)
    if search:
        rows = [
            d
            for d in rows
            if search in str(d.get("_id", "")).lower()
            or search in (d.get("client_name") or "").lower()
            or search in (d.get("deliverer_name") or "").lower()
            or search in (d.get("pickup_address") or "").lower()
            or search in (d.get("dropoff_address") or "").lower()
        ]
    total = len(rows)
    total_pages = max(1, (total + limit - 1) // limit)
    slice_rows = rows[(page - 1) * limit : page * limit]
    orders = [_serialize_admin_order(d) for d in slice_rows]
    return success(
        "Deliveries loaded",
        data={"orders": orders, "total": total, "page": page, "totalPages": total_pages},
        status=200,
    )


@admin.route("/deliveries/<delivery_id>", methods=["GET"])
@require_auth(Role.ADMIN.value)
def admin_get_delivery(delivery_id: str):
    d = deliveries_collection.find_one({"_id": delivery_id})
    if not d:
        return fail("Delivery not found", 404)
    return success("Delivery loaded", data={"order": _serialize_admin_order(d)}, status=200)


@admin.route("/deliveries/stats", methods=["GET"])
@require_auth(Role.ADMIN.value)
def admin_delivery_stats():
    all_d = list(deliveries_collection.find({}, {"status": 1}))
    def cnt(s):
        return sum(1 for d in all_d if (d.get("status") or "").lower() == s)

    total = len(all_d)
    pending = cnt("pending")
    transit = cnt("in_transit")
    delivered = cnt("delivered")
    return success(
        "Stats loaded",
        data={
            "totalOrders": {"value": total, "change": "Live", "positive": True, "label": "All deliveries"},
            "pendingPickups": {"value": pending, "change": "Live", "positive": True, "label": "Pending"},
            "inTransit": {"value": transit, "change": "Live", "positive": True, "label": "In transit"},
            "deliveredToday": {"value": delivered, "change": "Live", "positive": True, "label": "Delivered total"},
        },
        status=200,
    )


@admin.route("/finance/recent-transactions", methods=["GET"])
@require_auth(Role.ADMIN.value)
def admin_recent_finance_transactions():
    rows = list(deliveries_collection.find({}).sort("created_at", -1).limit(40))
    out = []
    for d in rows:
        oid = str(d.get("_id", ""))[:8]
        st = (d.get("status") or "").lower()
        tx_status = "success" if st == "delivered" else "pending" if st in ("pending", "accepted", "in_transit") else "refunded" if st == "cancelled" else "pending"
        dn = d.get("deliverer_name") or "Deliverer"
        out.append(
            {
                "id": f"#{oid}",
                "date": str(d.get("created_at") or "")[:16],
                "deliverer": dn,
                "delivererAvatar": _initials(dn),
                "amount": f"{float(d.get('price', 0) or 0):.2f} DZD",
                "status": tx_status,
            }
        )
    return success("Transactions loaded", data={"transactions": out}, status=200)


@admin.route("/finance/deliverer-payouts", methods=["GET"])
@require_auth(Role.ADMIN.value)
def admin_deliverer_payouts():
    deliv_users = list(users_collection.find({"role": "deliverer"}, {"password": 0}))
    earnings: dict[str, float] = {}
    for d in deliveries_collection.find({"status": "delivered"}, {"deliverer_id": 1, "price": 1, "_id": 1, "created_at": 1}):
        did = d.get("deliverer_id")
        if not did:
            continue
        earnings[str(did)] = earnings.get(str(did), 0.0) + float(d.get("price", 0) or 0)

    payouts = []
    for u in deliv_users:
        uid = str(u.get("_id"))
        name = u.get("name") or u.get("username") or "Deliverer"
        total = earnings.get(uid, 0.0)
        hist = []
        for d in deliveries_collection.find({"deliverer_id": uid, "status": "delivered"}).sort("created_at", -1).limit(8):
            hist.append(
                {
                    "id": f"#{str(d.get('_id', ''))[:8]}",
                    "date": str(d.get("created_at") or "")[:10],
                    "commission": f"+{float(d.get('price', 0) or 0):.2f} DZD",
                }
            )
        payouts.append(
            {
                "userId": uid,
                "name": name,
                "avatar": _initials(name),
                "wallet": f"{total:.2f} DZD",
                "walletSort": total,
                "bank": (u.get("bank_name") or "—"),
                "holder": name,
                "iban": (u.get("iban") or "—"),
                "history": hist,
            }
        )
    payouts.sort(key=lambda p: p.get("walletSort", 0), reverse=True)
    for p in payouts:
        p.pop("walletSort", None)
    return success("Payouts loaded", data={"payouts": payouts}, status=200)


@admin.route("/finance/summary", methods=["GET"])
@require_auth(Role.ADMIN.value)
def admin_finance_summary():
    rows = list(deliveries_collection.find({"status": "delivered"}, {"price": 1}))
    total_rev = sum(float(d.get("price", 0) or 0) for d in rows)
    pending_rows = list(deliveries_collection.find({"status": {"$in": ["pending", "accepted", "in_transit"]}}, {"price": 1}))
    pending_amt = sum(float(d.get("price", 0) or 0) for d in pending_rows)
    nd = users_collection.count_documents({"role": "deliverer"})
    return success(
        "Summary loaded",
        data={
            "totalRevenue": f"{total_rev:,.0f} DZD",
            "avgOrder": f"{(total_rev / len(rows)):.2f} DZD" if rows else "0 DZD",
            "pendingPayouts": f"{pending_amt:,.0f} DZD",
            "pendingDeliverers": nd,
            "commissionEarned": f"{total_rev * 0.1:,.0f} DZD",
        },
        status=200,
    )


_UI_TO_DB = {
    "Pending": "pending",
    "Assigned": "accepted",
    "In Transit": "in_transit",
    "Delivered": "delivered",
    "Cancelled": "cancelled",
}


@admin.route("/deliveries/<delivery_id>/status", methods=["PATCH"])
@require_auth(Role.ADMIN.value)
def admin_patch_delivery_status(delivery_id: str):
    payload = request.get_json(silent=True) or {}
    label = (payload.get("status") or "").strip()
    if label not in _UI_TO_DB:
        return fail("invalid status", 400, code="VALIDATION_ERROR")
    res = deliveries_collection.update_one({"_id": delivery_id}, {"$set": {"status": _UI_TO_DB[label]}})
    if res.matched_count == 0:
        return fail("Delivery not found", 404)
    d = deliveries_collection.find_one({"_id": delivery_id})
    return success("Updated", data={"order": _serialize_admin_order(d)}, status=200)


@admin.route("/deliveries/<delivery_id>", methods=["DELETE"])
@require_auth(Role.ADMIN.value)
def admin_delete_delivery(delivery_id: str):
    res = deliveries_collection.delete_one({"_id": delivery_id})
    if res.deleted_count == 0:
        return fail("Delivery not found", 404)
    return success("Deleted", data={"success": True}, status=200)
