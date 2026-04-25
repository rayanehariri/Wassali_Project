"""
chat.py — Socket.IO chat server (single file)
Replaces Firebase Firestore for all real-time chat:
  • admin ↔ deliverer
  • client ↔ deliverer  (track page)
  • client ↔ support    (LiveChat)
  • deliverer ↔ support  (SupportChatWidget)

Collections used:
  • chat_conversations  – one doc per conversation
  • chat_messages       – one doc per message
"""

from datetime import datetime, timezone
from bson import ObjectId
from flask_socketio import SocketIO, emit, join_room, leave_room

import jwt as pyjwt
from __init__ import (
    app,
    db,
    users_collection,
    JWT_SECRET_KEY,
    CORS_ORIGINS,
)

# ── MongoDB collections ────────────────────────────────────────────────────────
chat_conversations = db["chat_conversations"]
chat_messages = db["chat_messages"]

# Indexes (idempotent — safe to call on every startup)
chat_conversations.create_index("participants")
chat_conversations.create_index("last_message_at")
chat_messages.create_index("conversation_id")
chat_messages.create_index("timestamp")

# ── SocketIO instance ──────────────────────────────────────────────────────────
_origins = "*" if CORS_ORIGINS == "*" else [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]

socketio = SocketIO(
    app,
    cors_allowed_origins=_origins,
    async_mode="threading",
    logger=False,
    engineio_logger=False,
)

# ── In-memory map: socket sid → user_id ────────────────────────────────────────
_sid_to_uid = {}
_uid_to_sids = {}  # one user may have multiple tabs


# ── Helpers ────────────────────────────────────────────────────────────────────

def _utcnow():
    return datetime.now(timezone.utc)


def _str(oid):
    """Convert ObjectId to string, pass-through strings."""
    return str(oid) if isinstance(oid, ObjectId) else oid


def _is_admin(uid):
    """Check if a user has the admin role."""
    if not uid:
        return False
    try:
        query_id = ObjectId(uid)
    except Exception:
        query_id = uid
    user = users_collection.find_one({"_id": query_id})
    return user and user.get("role") == "admin"


def _serialize_conv(doc, current_uid=None):
    """Serialize a conversation document for the frontend."""
    participants = doc.get("participants", [])

    # Determine the "other" user from the current user's perspective.
    # For admins viewing support chats they're not part of, pick
    # the non-admin participant (the client/deliverer who needs help).
    if current_uid and current_uid in participants:
        other_uid = next((p for p in participants if p != current_uid), None)
    elif _is_admin(current_uid):
        # Admin is viewing a support chat they're not a participant of.
        # Show the non-admin participant as "otherUser" (the person seeking help).
        other_uid = None
        for p in participants:
            if not _is_admin(p):
                other_uid = p
                break
        if other_uid is None and participants:
            other_uid = participants[0]
    else:
        other_uid = next((p for p in participants if p != current_uid), None)

    other_profile = _get_user_profile(other_uid) if other_uid else {}

    return {
        "id": _str(doc["_id"]),
        "participants": participants,
        "type": doc.get("type", "customer"),
        "status": doc.get("status", "active"),
        "lastMessage": doc.get("last_message", ""),
        "lastMessageAt": doc.get("last_message_at", "").isoformat() if isinstance(doc.get("last_message_at"), datetime) else doc.get("last_message_at", ""),
        "unreadCount": doc.get("unread_count", {}),
        "typing": doc.get("typing", {}),
        "otherUser": other_profile,
        "participantData": [_get_user_profile(p) for p in participants],
        "isTyping": doc.get("typing", {}).get(other_uid, False) if other_uid else False,
    }


def _serialize_msg(doc):
    """Serialize a message document for the frontend."""
    ts = doc.get("timestamp")
    return {
        "id": _str(doc["_id"]),
        "senderId": doc.get("sender_id", ""),
        "text": doc.get("text", ""),
        "timestamp": ts.isoformat() if isinstance(ts, datetime) else (ts or ""),
        "read": doc.get("read", False),
        # optional extras
        **({  "fileUrl": doc["file_url"]} if doc.get("file_url") else {}),
        **({"fileName": doc["file_name"]} if doc.get("file_name") else {}),
        **({"fileSize": doc["file_size"]} if doc.get("file_size") else {}),
        **({"locationType": doc["location_type"]} if doc.get("location_type") else {}),
        **({"locationLabel": doc["location_label"]} if doc.get("location_label") else {}),
    }


def _get_user_profile(uid):
    """Fetch minimal user profile from MongoDB users collection."""
    if not uid:
        return {"uid": uid, "name": "Unknown", "avatar": "??"}
    try:
        query_id = ObjectId(uid)
    except Exception:
        query_id = uid

    user = users_collection.find_one({"_id": query_id})
    if not user:
        return {
            "uid": uid,
            "name": f"User {str(uid)[:6]}",
            "avatar": "??",
        }
    name = user.get("username") or user.get("name") or f"User {str(uid)[:6]}"
    words = name.strip().split()
    if len(words) >= 2:
        avatar = (words[0][0] + words[1][0]).upper()
    elif len(words) == 1:
        avatar = words[0][:2].upper()
    else:
        avatar = "??"
    return {
        "uid": uid,
        "name": name,
        "avatar": avatar,
        "role": user.get("role", ""),
        "status": "online" if uid in _uid_to_sids else "offline",
    }


def _decode_jwt(token):
    """Decode a JWT access token and return the user_id (sub) or None."""
    try:
        payload = pyjwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=["HS256"],
            options={"require": ["exp", "sub", "type"]},
        )
        if payload.get("type") != "access":
            return None
        return payload.get("sub")
    except pyjwt.PyJWTError:
        return None


def _get_all_admin_uids():
    """Return a set of user_id strings for all online admins."""
    admin_uids = set()
    for uid in _uid_to_sids:
        if _is_admin(uid):
            admin_uids.add(uid)
    return admin_uids


def _send_conversations_to(user_id, sid=None):
    """Fetch all conversations for a user and emit to their sockets."""
    try:
        from bson.objectid import ObjectId
        query_id = ObjectId(user_id)
    except Exception:
        query_id = user_id

    user = users_collection.find_one({"_id": query_id})
    is_admin = user and user.get("role") == "admin"

    if is_admin:
        # Admins see their direct chats AND all support chats
        query = {
            "$or": [
                {"participants": user_id},
                {"type": "support"}
            ]
        }
    else:
        query = {"participants": user_id}

    docs = list(
        chat_conversations.find(query).sort("last_message_at", -1)
    )
    convs = [_serialize_conv(d, user_id) for d in docs]
    target = sid or _uid_to_sids.get(user_id, set())
    if isinstance(target, set):
        for s in target:
            emit("conversations_list", convs, to=s)
    else:
        emit("conversations_list", convs, to=target)


def _notify_admins_of_support_update():
    """Refresh conversation lists for all online admins (for support chat updates)."""
    for admin_uid in _get_all_admin_uids():
        for s in _uid_to_sids.get(admin_uid, set()):
            _send_conversations_to(admin_uid, s)


# ── Socket.IO Events ──────────────────────────────────────────────────────────

@socketio.on("connect")
def handle_connect():
    pass  # auth happens via "authenticate" event


@socketio.on("authenticate")
def handle_authenticate(data):
    """
    Client sends { token: "Bearer <jwt>" } after connecting.
    We validate and store the mapping.
    """
    from flask import request as flask_request
    sid = flask_request.sid

    token = (data or {}).get("token", "")
    if token.startswith("Bearer "):
        token = token[7:]

    user_id = _decode_jwt(token)
    if not user_id:
        emit("auth_error", {"message": "Invalid or expired token"})
        return

    _sid_to_uid[sid] = user_id
    if user_id not in _uid_to_sids:
        _uid_to_sids[user_id] = set()
    _uid_to_sids[user_id].add(sid)

    # Auto-join all conversation rooms this user is part of
    convs = chat_conversations.find({"participants": user_id})
    for c in convs:
        join_room(str(c["_id"]))

    # Admins also join all support chat rooms
    if _is_admin(user_id):
        support_convs = chat_conversations.find({"type": "support"})
        for c in support_convs:
            join_room(str(c["_id"]))

    emit("authenticated", {"user_id": user_id})
    _send_conversations_to(user_id, sid)


@socketio.on("disconnect")
def handle_disconnect():
    from flask import request as flask_request
    sid = flask_request.sid
    user_id = _sid_to_uid.pop(sid, None)
    if user_id and user_id in _uid_to_sids:
        _uid_to_sids[user_id].discard(sid)
        if not _uid_to_sids[user_id]:
            del _uid_to_sids[user_id]
            # Clear any typing flags for this user
            chat_conversations.update_many(
                {f"typing.{user_id}": True},
                {"$set": {f"typing.{user_id}": False}},
            )


@socketio.on("get_conversations")
def handle_get_conversations():
    from flask import request as flask_request
    sid = flask_request.sid
    user_id = _sid_to_uid.get(sid)
    if not user_id:
        return
    _send_conversations_to(user_id, sid)


@socketio.on("create_conversation")
def handle_create_conversation(data):
    """
    { otherUid: "<user_id>", type: "customer" | "support" }
    Returns the conversation id (creates if not exists).
    """
    from flask import request as flask_request
    sid = flask_request.sid
    user_id = _sid_to_uid.get(sid)
    if not user_id:
        return

    other_uid = (data or {}).get("otherUid")
    conv_type = (data or {}).get("type", "customer")
    if not other_uid:
        emit("error", {"message": "Missing otherUid"})
        return

    # Find existing conversation between these two users with matching type
    existing = chat_conversations.find_one({
        "participants": {"$all": [user_id, other_uid]},
        "type": conv_type,
    })

    if existing:
        conv_id = str(existing["_id"])
        join_room(conv_id)
        # Also join the other user if they're online
        for s in _uid_to_sids.get(other_uid, set()):
            join_room(conv_id, sid=s)
        # Join all online admins for support chats
        if conv_type == "support":
            for admin_uid in _get_all_admin_uids():
                for s in _uid_to_sids.get(admin_uid, set()):
                    join_room(conv_id, sid=s)
        emit("conversation_created", {"conversationId": conv_id, "otherUid": other_uid, "type": conv_type})
        _send_conversations_to(user_id, sid)
        return

    # Create new conversation
    now = _utcnow()
    doc = {
        "participants": [user_id, other_uid],
        "type": conv_type,
        "status": "active",
        "last_message": "",
        "last_message_at": now,
        "typing": {},
        "unread_count": {user_id: 0, other_uid: 0},
        "created_at": now,
    }
    result = chat_conversations.insert_one(doc)
    conv_id = str(result.inserted_id)

    join_room(conv_id)
    for s in _uid_to_sids.get(other_uid, set()):
        join_room(conv_id, sid=s)

    # Join all online admins for support chats
    if conv_type == "support":
        for admin_uid in _get_all_admin_uids():
            for s in _uid_to_sids.get(admin_uid, set()):
                join_room(conv_id, sid=s)

    # If support type, send welcome message
    if conv_type == "support":
        welcome = {
            "conversation_id": conv_id,
            "sender_id": other_uid,
            "text": "Hello! I'm from the Wassali support team. How can I assist you today? 👋",
            "timestamp": now,
            "read": False,
        }
        msg_result = chat_messages.insert_one(welcome)
        chat_conversations.update_one(
            {"_id": result.inserted_id},
            {"$set": {
                "last_message": welcome["text"],
                "last_message_at": now,
            }},
        )
        # Broadcast the welcome message to the room
        serialized = _serialize_msg({**welcome, "_id": msg_result.inserted_id})
        emit("new_message", {"conversationId": conv_id, "message": serialized}, to=conv_id)

    emit("conversation_created", {"conversationId": conv_id, "otherUid": other_uid, "type": conv_type})
    _send_conversations_to(user_id, sid)
    # Refresh other user's conversation list too
    for s in _uid_to_sids.get(other_uid, set()):
        _send_conversations_to(other_uid, s)
    # Notify admins about new support conversations
    if conv_type == "support":
        _notify_admins_of_support_update()


@socketio.on("join_conversation")
def handle_join_conversation(data):
    """
    { conversationId: "<id>" }
    Joins the room, sends message history, marks messages as read.
    """
    from flask import request as flask_request
    sid = flask_request.sid
    user_id = _sid_to_uid.get(sid)
    if not user_id:
        return

    conv_id = (data or {}).get("conversationId")
    if not conv_id:
        return

    try:
        conv = chat_conversations.find_one({"_id": ObjectId(conv_id)})
    except Exception:
        conv = chat_conversations.find_one({"_id": conv_id})

    if not conv:
        emit("error", {"message": "Conversation not found"})
        return
        
    is_participant = user_id in conv.get("participants", [])
    if not is_participant:
        # Allow admins to join any support chat
        if not _is_admin(user_id) or conv.get("type") != "support":
            emit("error", {"message": "Conversation not found"})
            return

    join_room(conv_id)

    # Send message history
    msgs = list(
        chat_messages.find({"conversation_id": conv_id}).sort("timestamp", 1)
    )
    serialized = [_serialize_msg(m) for m in msgs]
    emit("messages_history", {"conversationId": conv_id, "messages": serialized})

    # Mark unread messages as read
    chat_messages.update_many(
        {"conversation_id": conv_id, "sender_id": {"$ne": user_id}, "read": False},
        {"$set": {"read": True}},
    )
    # Reset unread count
    chat_conversations.update_one(
        {"_id": conv.get("_id")},
        {"$set": {f"unread_count.{user_id}": 0}},
    )

    # Notify the other participants about read receipts
    emit("messages_read", {"conversationId": conv_id, "readBy": user_id}, to=conv_id)
    # Update conversation lists for other participants
    for p in conv["participants"]:
        if p != user_id:
            for s in _uid_to_sids.get(p, set()):
                _send_conversations_to(p, s)


@socketio.on("send_message")
def handle_send_message(data):
    """
    { conversationId: "<id>", text: "<msg>", extra: {} }
    """
    from flask import request as flask_request
    sid = flask_request.sid
    user_id = _sid_to_uid.get(sid)
    if not user_id:
        return

    conv_id = (data or {}).get("conversationId")
    text = (data or {}).get("text", "").strip()
    extra = (data or {}).get("extra", {})
    if not conv_id or not text:
        return

    try:
        conv = chat_conversations.find_one({"_id": ObjectId(conv_id)})
    except Exception:
        conv = chat_conversations.find_one({"_id": conv_id})

    if not conv:
        return
    
    is_participant = user_id in conv.get("participants", [])
    is_admin_user = _is_admin(user_id)
    
    if not is_participant:
        # Allow admins to reply to any support chat
        if not is_admin_user or conv.get("type") != "support":
            return

    now = _utcnow()
    msg_doc = {
        "conversation_id": conv_id,
        "sender_id": user_id,
        "text": text,
        "timestamp": now,
        "read": False,
    }
    # Copy optional extras (file attachments, location, etc.)
    if extra.get("fileUrl"):
        msg_doc["file_url"] = extra["fileUrl"]
    if extra.get("fileName"):
        msg_doc["file_name"] = extra["fileName"]
    if extra.get("fileSize"):
        msg_doc["file_size"] = extra["fileSize"]
    if extra.get("locationType"):
        msg_doc["location_type"] = extra["locationType"]
    if extra.get("locationLabel"):
        msg_doc["location_label"] = extra["locationLabel"]

    result = chat_messages.insert_one(msg_doc)
    msg_doc["_id"] = result.inserted_id

    # Update conversation metadata — increment unread for ALL other participants
    participants = conv["participants"]
    update = {
        "last_message": text,
        "last_message_at": now,
        f"typing.{user_id}": False,
    }
    inc = {}
    for p in participants:
        if p != user_id:
            inc[f"unread_count.{p}"] = 1

    update_op = {"$set": update}
    if inc:
        update_op["$inc"] = inc

    chat_conversations.update_one({"_id": conv["_id"]}, update_op)

    # Broadcast to room
    serialized = _serialize_msg(msg_doc)
    emit("new_message", {"conversationId": conv_id, "message": serialized}, to=conv_id)

    # Refresh conversation lists for all participants
    for p in participants:
        for s in _uid_to_sids.get(p, set()):
            _send_conversations_to(p, s)

    # For support chats, also notify all online admins
    if conv.get("type") == "support":
        _notify_admins_of_support_update()


@socketio.on("typing")
def handle_typing(data):
    """
    { conversationId: "<id>", isTyping: true/false }
    """
    from flask import request as flask_request
    sid = flask_request.sid
    user_id = _sid_to_uid.get(sid)
    if not user_id:
        return

    conv_id = (data or {}).get("conversationId")
    is_typing = bool((data or {}).get("isTyping", False))
    if not conv_id:
        return

    try:
        chat_conversations.update_one(
            {"_id": ObjectId(conv_id)},
            {"$set": {f"typing.{user_id}": is_typing}},
        )
    except Exception:
        chat_conversations.update_one(
            {"_id": conv_id},
            {"$set": {f"typing.{user_id}": is_typing}},
        )

    emit("typing", {
        "conversationId": conv_id,
        "userId": user_id,
        "isTyping": is_typing,
    }, to=conv_id, include_self=False)


@socketio.on("mark_read")
def handle_mark_read(data):
    """
    { conversationId: "<id>" }
    """
    from flask import request as flask_request
    sid = flask_request.sid
    user_id = _sid_to_uid.get(sid)
    if not user_id:
        return

    conv_id = (data or {}).get("conversationId")
    if not conv_id:
        return

    chat_messages.update_many(
        {"conversation_id": conv_id, "sender_id": {"$ne": user_id}, "read": False},
        {"$set": {"read": True}},
    )

    try:
        chat_conversations.update_one(
            {"_id": ObjectId(conv_id)},
            {"$set": {f"unread_count.{user_id}": 0}},
        )
    except Exception:
        chat_conversations.update_one(
            {"_id": conv_id},
            {"$set": {f"unread_count.{user_id}": 0}},
        )

    emit("messages_read", {"conversationId": conv_id, "readBy": user_id}, to=conv_id)

    # Refresh conversation list for the other participants
    try:
        conv = chat_conversations.find_one({"_id": ObjectId(conv_id)})
    except Exception:
        conv = chat_conversations.find_one({"_id": conv_id})
    if conv:
        for p in conv["participants"]:
            if p != user_id:
                for s in _uid_to_sids.get(p, set()):
                    _send_conversations_to(p, s)
