"""Password reset tokens + phone-verification signup (pending registration)."""
import hashlib
import os
import re
import secrets
from datetime import datetime, timedelta, timezone

from pymongo.errors import DuplicateKeyError

from __init__ import Role, Status, pending_phone_registrations, password_resets_collection, users_collection
from mail_utils import is_mail_configured, send_mail
from models import Identity, unique_email


def _utc_now():
    return datetime.now(timezone.utc)


def _mongo_as_utc_aware(dt):
    """PyMongo returns BSON datetimes as naive UTC. Avoid TypeError vs timezone-aware _utc_now()."""
    if dt is None:
        return None
    if getattr(dt, "tzinfo", None) is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _frontend_base() -> str:
    return (os.getenv("FRONTEND_BASE_URL") or "http://localhost:5173").rstrip("/")


def request_password_reset(email: str) -> dict:
    """Always returns generic success to avoid email enumeration."""
    raw = (email or "").strip().lower()
    if not raw or "@" not in raw:
        return {"success": True, "message": "If an account exists, a reset link was sent.", "user_found": False}

    user = users_collection.find_one({"email": {"$regex": f"^{re.escape(raw)}$", "$options": "i"}})
    if not user:
        user = users_collection.find_one({"email": raw})
    if not user:
        return {"success": True, "message": "If an account exists, a reset link was sent.", "user_found": False}

    token = secrets.token_urlsafe(32)
    now = _utc_now()
    password_resets_collection.insert_one(
        {
            "_id": token,
            "user_id": user["_id"],
            "expires_at": now + timedelta(hours=1),
            "used": False,
            "created_at": now,
        }
    )
    link = f"{_frontend_base()}/reset-password?token={token}"
    subject = "Reset your Wassali password"
    text = (
        f"Hi {user.get('username', 'there')},\n\n"
        f"Use this link to choose a new password (valid 1 hour):\n{link}\n\n"
        "If you did not request this, ignore this email.\n"
    )
    html = f'<p>Hi {user.get("username", "there")},</p><p><a href="{link}">Reset your password</a> (valid 1 hour).</p>'
    sent = False
    try:
        sent = bool(send_mail(user.get("email") or raw, subject, text, html))
    except Exception as e:
        print(f"[password reset mail error] {e}")

    out: dict = {"success": True, "message": "If an account exists, a reset link was sent.", "user_found": True}
    if not sent or not is_mail_configured():
        out["dev_notice"] = (
            "Email server is not configured (set MAIL_SERVER, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, "
            "MAIL_DEFAULT_SENDER in your environment). Use the link below on this machine only."
        )
        out["dev_reset_link"] = link
    return out


def complete_password_reset(token: str, new_password: str) -> dict:
    if not token or not new_password:
        return {"success": False, "message": "Invalid request", "code": "VALIDATION_ERROR"}
    doc = password_resets_collection.find_one({"_id": token.strip()})
    if not doc or doc.get("used"):
        return {"success": False, "message": "Invalid or expired reset link.", "code": "INVALID_TOKEN"}
    if _utc_now() > _mongo_as_utc_aware(doc["expires_at"]):
        return {"success": False, "message": "This reset link has expired.", "code": "EXPIRED"}
    from models import is_strong_password, crypt_password

    if not is_strong_password(new_password):
        return {"success": False, "message": "New password is not strong enough.", "code": "WEAK_PASSWORD"}

    uid = doc["user_id"]
    users_collection.update_one({"_id": uid}, {"$set": {"password": crypt_password(new_password)}})
    password_resets_collection.update_one({"_id": token}, {"$set": {"used": True}})
    return {"success": True, "message": "Password updated. You can sign in now."}


def _gen_six_digit() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def start_phone_registration(username: str, email: str, phone: str, password: str, role: str) -> dict:
    try:
        identity = Identity(username.strip(), email.strip(), password)
    except ValueError as e:
        return {"success": False, "message": str(e), "code": "VALIDATION_ERROR"}
    except KeyError as e:
        return {"success": False, "message": f"Missing field: {e}", "code": "VALIDATION_ERROR"}

    try:
        r = Role(role or "client")
    except ValueError:
        return {"success": False, "message": "Invalid role", "code": "VALIDATION_ERROR"}

    if r == Role.ADMIN:
        return {"success": False, "message": "Invalid role", "code": "VALIDATION_ERROR"}

    em = unique_email(identity.email)
    if not em["success"]:
        return {"success": False, "message": em["message"], "code": "DUPLICATE"}

    if users_collection.find_one({"username": identity.username}):
        return {"success": False, "message": "Username already taken.", "code": "DUPLICATE"}

    phone_clean = (phone or "").strip()
    if len(phone_clean) < 8:
        return {"success": False, "message": "Enter a valid phone number.", "code": "VALIDATION_ERROR"}

    now = _utc_now()
    pending_phone_registrations.delete_many({"email": identity.email})

    code = _gen_six_digit()
    code_hash = hashlib.sha256(code.encode()).hexdigest()
    pid = str(secrets.token_hex(16))
    pending_phone_registrations.insert_one(
        {
            "_id": pid,
            "user_uuid": identity.id,
            "username": identity.username,
            "email": identity.email,
            "phone": phone_clean,
            "password": identity.password,
            "role": r.value,
            "code_hash": code_hash,
            "expires_at": now + timedelta(minutes=15),
            "created_at": now,
            "attempts": 0,
        }
    )

    subject = "Your Wassali verification code"
    text = (
        f"Your verification code is: {code}\n\n"
        "Enter it on the phone verification screen to finish signing up.\n"
        "This code expires in 15 minutes.\n"
    )
    sms_line = f"[SMS → {phone_clean}] Wassali code: {code} (configure SMS provider in production)"
    print(sms_line)
    sent = False
    try:
        sent = bool(send_mail(identity.email, subject, text, f"<p>Your code is <b>{code}</b> (15 min).</p>"))
    except Exception as e:
        print(f"[signup code email error] {e}")

    out: dict = {
        "success": True,
        "message": "Verification code sent.",
        "pending_id": pid,
        "expires_in_seconds": 900,
    }
    if not sent or not is_mail_configured():
        out["dev_notice"] = (
            "No real email was sent. Configure MAIL_SERVER (SMTP) to deliver mail. "
            "For local testing, use the code below on the next screen."
        )
        out["dev_verification_code"] = code
    return out


def start_email_registration(username: str, email: str, password: str, role: str) -> dict:
    """
    Start registration using email verification only (no phone required).
    Sends a 6-digit code to the user's email (real SMTP if configured).
    """
    try:
        identity = Identity(username.strip(), email.strip(), password)
    except ValueError as e:
        return {"success": False, "message": str(e), "code": "VALIDATION_ERROR"}
    except KeyError as e:
        return {"success": False, "message": f"Missing field: {e}", "code": "VALIDATION_ERROR"}

    try:
        r = Role(role or "client")
    except ValueError:
        return {"success": False, "message": "Invalid role", "code": "VALIDATION_ERROR"}

    if r == Role.ADMIN:
        return {"success": False, "message": "Invalid role", "code": "VALIDATION_ERROR"}

    em = unique_email(identity.email)
    if not em["success"]:
        return {"success": False, "message": em["message"], "code": "DUPLICATE"}

    if users_collection.find_one({"username": identity.username}):
        return {"success": False, "message": "Username already taken.", "code": "DUPLICATE"}

    now = _utc_now()
    pending_phone_registrations.delete_many({"email": identity.email})

    code = _gen_six_digit()
    code_hash = hashlib.sha256(code.encode()).hexdigest()
    pid = str(secrets.token_hex(16))
    pending_phone_registrations.insert_one(
        {
            "_id": pid,
            "user_uuid": identity.id,
            "username": identity.username,
            "email": identity.email,
            "phone": "",
            "password": identity.password,
            "role": r.value,
            "code_hash": code_hash,
            "expires_at": now + timedelta(minutes=15),
            "created_at": now,
            "attempts": 0,
        }
    )

    subject = "Your Wassali verification code"
    text = (
        f"Your verification code is: {code}\n\n"
        "Enter it on the verification screen to finish signing up.\n"
        "This code expires in 15 minutes.\n"
    )
    sent = False
    try:
        sent = bool(send_mail(identity.email, subject, text, f"<p>Your code is <b>{code}</b> (15 min).</p>"))
    except Exception as e:
        print(f"[signup code email error] {e}")

    out: dict = {
        "success": True,
        "message": "Verification code sent.",
        "pending_id": pid,
        "expires_in_seconds": 900,
    }
    if not sent or not is_mail_configured():
        out["dev_notice"] = (
            "No real email was sent. Configure MAIL_SERVER (SMTP) to deliver mail. "
            "For local testing, use the code below on the next screen."
        )
        out["dev_verification_code"] = code
    return out


def verify_phone_and_create_user(pending_id: str, code: str) -> dict:
    if not pending_id or not code:
        return {"success": False, "message": "Missing fields.", "code": "VALIDATION_ERROR"}

    doc = pending_phone_registrations.find_one({"_id": pending_id.strip()})
    if not doc:
        return {"success": False, "message": "Invalid or expired session. Start again.", "code": "INVALID_SESSION"}

    now = _utc_now()
    if now > _mongo_as_utc_aware(doc["expires_at"]):
        pending_phone_registrations.delete_one({"_id": pending_id})
        return {"success": False, "message": "Code expired. Please sign up again.", "code": "EXPIRED"}

    attempts = int(doc.get("attempts") or 0)
    if attempts >= 8:
        return {"success": False, "message": "Too many attempts. Start again.", "code": "LOCKED"}

    pending_phone_registrations.update_one({"_id": pending_id}, {"$inc": {"attempts": 1}})

    if hashlib.sha256(code.strip().encode()).hexdigest() != doc.get("code_hash"):
        return {"success": False, "message": "Incorrect code.", "code": "BAD_CODE"}

    status = Status.PENDING if doc["role"] == Role.DELIVERER.value else Status.ACTIVE
    user_doc = {
        "_id": doc["user_uuid"],
        "username": doc["username"],
        "email": doc["email"],
        "phone": doc.get("phone") or "",
        "password": doc["password"],
        "role": doc["role"],
        "status": status.value,
        "onboardingDone": False,
        "phone_verified": bool((doc.get("phone") or "").strip()),
        "email_verified": True,
    }
    try:
        users_collection.insert_one(user_doc)
    except DuplicateKeyError:
        pending_phone_registrations.delete_one({"_id": pending_id})
        return {"success": False, "message": "Account already exists. Log in instead.", "code": "DUPLICATE"}

    pending_phone_registrations.delete_one({"_id": pending_id})
    return {"success": True, "message": "Account created. You can log in now."}


def resend_phone_code(pending_id: str) -> dict:
    doc = pending_phone_registrations.find_one({"_id": (pending_id or "").strip()})
    if not doc or _utc_now() > _mongo_as_utc_aware(doc["expires_at"]):
        return {"success": False, "message": "Session expired. Start registration again.", "code": "EXPIRED"}

    code = _gen_six_digit()
    code_hash = hashlib.sha256(code.encode()).hexdigest()
    now = _utc_now()
    pending_phone_registrations.update_one(
        {"_id": doc["_id"]},
        {"$set": {"code_hash": code_hash, "expires_at": now + timedelta(minutes=15), "attempts": 0}},
    )
    subject = "Your Wassali verification code"
    text = f"Your new verification code is: {code}\n(15 minutes)\n"
    print(f"[SMS → {doc.get('phone')}] Wassali code: {code}")
    sent = False
    try:
        sent = bool(send_mail(doc["email"], subject, text, f"<p>Your new code is <b>{code}</b>.</p>"))
    except Exception as e:
        print(f"[resend mail error] {e}")
    out: dict = {"success": True, "message": "New code sent."}
    if not sent or not is_mail_configured():
        out["dev_notice"] = "No real email sent (configure SMTP). Use this new code:"
        out["dev_verification_code"] = code
    return out
