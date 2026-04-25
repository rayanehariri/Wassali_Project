import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import current_app, jsonify, request

from __init__ import auth_sessions, users_collection


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _extract_bearer_token() -> str | None:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1].strip()
    return token or None


def _decode_token(token: str) -> dict:
    return jwt.decode(
        token,
        current_app.config["JWT_SECRET_KEY"],
        algorithms=["HS256"],
        options={"require": ["exp", "iat", "jti", "sub", "type"]},
    )


def create_access_token(user: dict) -> str:
    now = _utc_now()
    exp = now + timedelta(minutes=current_app.config["JWT_ACCESS_EXPIRES_MINUTES"])
    payload = {
        "sub": user["_id"],
        "username": user.get("username"),
        "role": user.get("role"),
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")


def create_refresh_token(user: dict) -> str:
    now = _utc_now()
    exp = now + timedelta(days=current_app.config["JWT_REFRESH_EXPIRES_DAYS"])
    jti = str(uuid.uuid4())
    payload = {
        "sub": user["_id"],
        "type": "refresh",
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
        "jti": jti,
    }
    token = jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")
    auth_sessions.insert_one(
        {
            "jti": jti,
            "token_hash": hashlib.sha256(token.encode()).hexdigest(),
            "user_id": user["_id"],
            "revoked": False,
            "created_at": now,
            "expires_at": exp,
        }
    )
    return token


def revoke_refresh_token(token: str) -> None:
    try:
        payload = _decode_token(token)
    except jwt.PyJWTError:
        return
    if payload.get("type") != "refresh":
        return
    auth_sessions.update_one({"jti": payload.get("jti")}, {"$set": {"revoked": True}})


def refresh_access_token(refresh_token: str) -> tuple[bool, dict]:
    try:
        payload = _decode_token(refresh_token)
    except jwt.ExpiredSignatureError:
        return False, {"success": False, "message": "Refresh token expired"}
    except jwt.PyJWTError:
        return False, {"success": False, "message": "Invalid refresh token"}

    if payload.get("type") != "refresh":
        return False, {"success": False, "message": "Invalid refresh token type"}

    session = auth_sessions.find_one({"jti": payload.get("jti")})
    if not session or session.get("revoked"):
        return False, {"success": False, "message": "Refresh token revoked"}

    expected_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    if session.get("token_hash") != expected_hash:
        return False, {"success": False, "message": "Refresh token mismatch"}

    user = users_collection.find_one({"_id": payload["sub"]})
    if not user:
        return False, {"success": False, "message": "User not found"}

    return True, {
        "success": True,
        "access_token": create_access_token(user),
        "token_type": "Bearer",
        "expires_in_seconds": current_app.config["JWT_ACCESS_EXPIRES_MINUTES"] * 60,
    }


def require_auth(required_role: str | None = None):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            token = _extract_bearer_token()
            if not token:
                return jsonify({"success": False, "message": "Missing Bearer token"}), 401

            try:
                payload = _decode_token(token)
            except jwt.ExpiredSignatureError:
                return jsonify({"success": False, "message": "Token expired"}), 401
            except jwt.PyJWTError:
                return jsonify({"success": False, "message": "Invalid token"}), 401

            if payload.get("type") != "access":
                return jsonify({"success": False, "message": "Invalid access token"}), 401

            from bson.objectid import ObjectId
            sub = payload.get("sub")
            try:
                query_id = ObjectId(sub)
            except Exception:
                query_id = sub

            user = users_collection.find_one({"_id": query_id})
            if not user:
                return jsonify({"success": False, "message": "User not found"}), 404

            if required_role and (user.get("role") or "").lower() != (required_role or "").lower():
                return jsonify({"success": False, "message": "Insufficient permissions"}), 403

            request.current_user = user
            return fn(*args, **kwargs)

        return wrapper

    return decorator
