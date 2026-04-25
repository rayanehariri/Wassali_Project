from __init__ import Status, Role, app, users_collection
from models import User, Identity
from flask import Blueprint, request
from auth_utils import (
    create_access_token,
    create_refresh_token,
    refresh_access_token,
    require_auth,
    revoke_refresh_token,
)
from api_response import fail, success
from schemas import (
    ChangePasswordSchema,
    ChangeUsernameSchema,
    ForgotPasswordSchema,
    LoginSchema,
    RefreshTokenSchema,
    RegisterSchema,
    RegisterStartSchema,
    RegisterVerifySchema,
    RegisterEmailStartSchema,
    ResendPhoneCodeSchema,
    ResetPasswordSchema,
    validate_payload,
)
from signup_and_reset import (
    complete_password_reset,
    request_password_reset,
    resend_phone_code,
    start_email_registration,
    start_phone_registration,
    verify_phone_and_create_user,
)
from mail_utils import is_mail_configured
import os


auth = Blueprint("auth", __name__)


@auth.route("/forgot-password/", methods=["POST"])
def forgot_password():
    data, error = validate_payload(ForgotPasswordSchema(), request.get_json(silent=True))
    if error:
        return error
    result = request_password_reset(data["email"])
    msg = result.get("message", "OK")
    extra = {k: v for k, v in result.items() if k not in ("success", "message")}
    return success(msg, data=extra or None, status=200)


@auth.route("/reset-password/", methods=["POST"])
def reset_password():
    data, error = validate_payload(ResetPasswordSchema(), request.get_json(silent=True))
    if error:
        return error
    result = complete_password_reset(data["token"], data["new_password"])
    if result.get("success"):
        return success(result.get("message", "Password updated"), status=200)
    code = result.get("code")
    if code in ("INVALID_TOKEN", "EXPIRED"):
        return fail(result.get("message", "Invalid"), 400, code=code)
    return fail(result.get("message", "Reset failed"), 400, code=code)


@auth.route("/register/start/", methods=["POST"])
def register_start():
    """Step 1: validate + send 6-digit code (email + logged SMS line in dev)."""
    data, error = validate_payload(RegisterStartSchema(), request.get_json(silent=True))
    if error:
        return error
    result = start_phone_registration(
        data["username"],
        data["email"],
        data["phone"],
        data["password"],
        data.get("role") or "client",
        data.get("wilaya"),
    )
    if result.get("success"):
        payload = {
            "pending_id": result["pending_id"],
            "expires_in_seconds": result.get("expires_in_seconds", 900),
        }
        for k in ("dev_notice", "dev_verification_code"):
            if k in result:
                payload[k] = result[k]
        return success(result.get("message", "Code sent"), data=payload, status=201)
    c = result.get("code")
    if c == "DUPLICATE":
        return fail(result.get("message", "Duplicate"), 409, code=c)
    return fail(result.get("message", "Failed"), 400, code=c or "VALIDATION_ERROR")


@auth.route("/register/email/start/", methods=["POST"])
def register_email_start():
    """Step 1: validate + send 6-digit code to email (no phone required)."""
    data, error = validate_payload(RegisterEmailStartSchema(), request.get_json(silent=True))
    if error:
        return error
    result = start_email_registration(
        data["username"],
        data["email"],
        data["password"],
        data.get("role") or "client",
        data.get("wilaya"),
    )
    if result.get("success"):
        payload = {
            "pending_id": result["pending_id"],
            "expires_in_seconds": result.get("expires_in_seconds", 900),
        }
        for k in ("dev_notice", "dev_verification_code"):
            if k in result:
                payload[k] = result[k]
        return success(result.get("message", "Code sent"), data=payload, status=201)
    c = result.get("code")
    if c == "DUPLICATE":
        return fail(result.get("message", "Duplicate"), 409, code=c)
    return fail(result.get("message", "Failed"), 400, code=c or "VALIDATION_ERROR")


@auth.route("/register/verify/", methods=["POST"])
def register_verify():
    """Step 2: verify SMS/email code and create the user account."""
    data, error = validate_payload(RegisterVerifySchema(), request.get_json(silent=True))
    if error:
        return error
    result = verify_phone_and_create_user(data["pending_id"], data["code"])
    if result.get("success"):
        return success(result.get("message", "Created"), status=201)
    c = result.get("code")
    if c == "BAD_CODE":
        return fail(result.get("message", "Wrong code"), 400, code=c)
    if c in ("EXPIRED", "INVALID_SESSION", "LOCKED"):
        return fail(result.get("message", "Session error"), 400, code=c)
    if c == "DUPLICATE":
        return fail(result.get("message", "Exists"), 409, code=c)
    return fail(result.get("message", "Failed"), 400, code=c)


@auth.route("/register/resend-code/", methods=["POST"])
def register_resend():
    data, error = validate_payload(ResendPhoneCodeSchema(), request.get_json(silent=True))
    if error:
        return error
    result = resend_phone_code(data["pending_id"])
    if result.get("success"):
        payload = {}
        for k in ("dev_notice", "dev_verification_code"):
            if k in result:
                payload[k] = result[k]
        return success(result.get("message", "Sent"), data=payload or None, status=200)
    return fail(result.get("message", "Failed"), 400, code=result.get("code"))


@auth.route("/register/", methods=["POST"])
def register():
    """Register a new user."""
    data, error = validate_payload(RegisterSchema(), request.get_json(silent=True))
    if error:
        return error

    try:
        identity = Identity(data["username"], data["email"], data["password"])
    except ValueError as e:
        return fail(str(e), 400, code="VALIDATION_ERROR")
    except KeyError as e:
        return fail(f"Missing required field: {e}", 400, code="VALIDATION_ERROR")

    try:
        role = Role(data.get("role") or "client")
    except ValueError:
        return fail(
            "Invalid role. Must be 'admin', 'client', or 'deliverer'",
            400,
            code="VALIDATION_ERROR",
        )

    status = Status.PENDING if role == Role.DELIVERER else Status.ACTIVE
    user = User(identity, status, role)
    result = user.register()
    if result["success"]:
        return success(result.get("message", "User registered"), status=201)
    return fail(result.get("message", "Registration failed"), 409)


@auth.route("/login/", methods=["POST"])
def login():
    """Authenticate user with username and password."""
    data, error = validate_payload(LoginSchema(), request.get_json(silent=True))
    if error:
        return error

    result = User.login(data["username"], data["password"])

    if result["success"]:
        user_doc = {
            "_id": result["_id"],
            "username": result["username"],
            "role": result["role"],
        }
        result["access_token"] = create_access_token(user_doc)
        result["refresh_token"] = create_refresh_token(user_doc)
        result["token_type"] = "Bearer"
        result["expires_in_seconds"] = app.config["JWT_ACCESS_EXPIRES_MINUTES"] * 60
        result["status"] = result.get("status", "active")
        result["onboardingDone"] = result.get("onboardingDone", False)

    if result["success"]:
        return success("Login successful", data=result, status=200)
    return fail(result.get("message", "Authentication failed"), 401, code="AUTH_FAILED")


@auth.route("/onboarding/<user_id>/", methods=["POST"])
@require_auth("deliverer")
def complete_onboarding(user_id: str):
    """
    Mark a deliverer's onboarding as complete.
    Sets onboardingDone=True and status='pending' in the database.
    Called by VehicleInfoPage when the deliverer submits their vehicle info + documents.
    """
    if request.current_user.get("_id") != user_id:
        return fail("user_id does not match token user", 403, code="FORBIDDEN")
    result = User.mark_onboarding_done(user_id)
    if result["success"]:
        return success(result.get("message", "Onboarding updated"), status=200)
    return fail(result.get("message", "Failed to update onboarding"), 400)


@auth.route("/status/<user_id>/", methods=["GET"])
@require_auth()
def get_user_status(user_id: str):
    """
    Return the current status of a user.
    Used by UnderReviewPage to poll for admin approval.
    When admin approves a deliverer, their status changes from 'pending' → 'active'.
    The frontend detects this and navigates to /verified.
    """
    if request.current_user.get("_id") != user_id and request.current_user.get("role") != Role.ADMIN.value:
        return fail("Not allowed to access this user status", 403, code="FORBIDDEN")

    result = User.find_user(user_id)
    if not result["success"]:
        return fail(result["message"], 404)

    user = result["user"]
    return success(
        "User status loaded",
        data={
            "status": user.get("status", "pending"),
            "onboardingDone": user.get("onboardingDone", False),
        },
        status=200,
    )


@auth.route("/change/username/<old_username>", methods=["POST"])
@require_auth()
def change_username(old_username: str):
    """Change user's username."""
    data, error = validate_payload(ChangeUsernameSchema(), request.get_json(silent=True))
    if error:
        return error
    if request.current_user.get("username") != old_username and request.current_user.get("role") != Role.ADMIN.value:
        return fail("Not allowed to change this username", 403, code="FORBIDDEN")

    result = User.change_username(old_username, data["new_username"])
    if result.get("success"):
        return success(result.get("message", "Username changed"), status=200)
    return fail(result.get("message", "Username update failed"), 400)


@auth.route("/change/password/<username>", methods=["POST"])
@require_auth()
def change_password(username: str):
    """Change user's password."""
    data, error = validate_payload(ChangePasswordSchema(), request.get_json(silent=True))
    if error:
        return error

    if request.current_user.get("username") != username and request.current_user.get("role") != Role.ADMIN.value:
        return fail("Not allowed to change this password", 403, code="FORBIDDEN")

    result = User.change_password(username, data["old_password"], data["new_password"])
    if result["success"]:
        return success(result.get("message", "Password changed"), status=200)
    return fail(result.get("message", "Password change failed"), 400)


@auth.route("/refresh/", methods=["POST"])
def refresh_token():
    """Issue a new access token from a valid refresh token."""
    data, error = validate_payload(RefreshTokenSchema(), request.get_json(silent=True))
    if error:
        return error

    is_success, response = refresh_access_token(data["refresh_token"])
    if is_success:
        return success("Access token refreshed", data=response, status=200)
    return fail(response.get("message", "Refresh failed"), 401, code="AUTH_FAILED")


@auth.route("/logout/", methods=["POST"])
def logout():
    """Revoke a refresh token to end the session."""
    data, error = validate_payload(RefreshTokenSchema(), request.get_json(silent=True))
    if error:
        return error

    revoke_refresh_token(data["refresh_token"])
    return success("Logged out successfully", status=200)


@auth.route("/peer/<user_id>/", methods=["GET"])
@require_auth()
def get_peer_profile(user_id: str):
    """Public display fields for chat / UI (Mongo user id)."""
    uid = (user_id or "").strip()
    if not uid:
        return fail("user id required", 400, code="VALIDATION_ERROR")
    doc = users_collection.find_one({"_id": uid}, {"password": 0, "email": 0})
    if not doc:
        return fail("User not found", 404, code="NOT_FOUND")
    display = doc.get("name") or doc.get("username") or "User"
    return success(
        "Peer profile loaded",
        data={
            "user": {
                "_id": str(doc["_id"]),
                "username": doc.get("username"),
                "name": display,
                "role": doc.get("role"),
            }
        },
        status=200,
    )


@auth.route("/me/", methods=["GET"])
@require_auth()
def get_me():
    """Return authenticated user profile from access token."""
    user = request.current_user
    return success(
        "Profile loaded",
        data={
            "user": {
                "_id": user.get("_id"),
                "username": user.get("username"),
                "email": user.get("email"),
                "role": user.get("role"),
                "status": user.get("status"),
                "onboardingDone": user.get("onboardingDone", False),
                "phone": user.get("phone", ""),
                "wilaya": user.get("wilaya", ""),
            }
        },
        status=200,
    )


@auth.route("/me/", methods=["PATCH"])
@require_auth()
def update_me():
    """Update authenticated user profile fields from settings pages."""
    payload = request.get_json(silent=True) or {}
    set_doc = {}

    username = payload.get("username")
    email = payload.get("email")
    if isinstance(username, str):
        username = username.strip()
        if len(username) < 3:
            return fail("username must be at least 3 characters", 400, code="VALIDATION_ERROR")
        set_doc["username"] = username
    if isinstance(email, str):
        email = email.strip()
        if "@" not in email:
            return fail("email must be valid", 400, code="VALIDATION_ERROR")
        set_doc["email"] = email
    wilaya = payload.get("wilaya")
    if isinstance(wilaya, str):
        wilaya = wilaya.strip()
        if len(wilaya) < 2:
            return fail("wilaya must be at least 2 characters", 400, code="VALIDATION_ERROR")
        set_doc["wilaya"] = wilaya

    if not set_doc:
        return fail("No updatable fields provided", 400, code="VALIDATION_ERROR")

    # Keep names in sync for UIs that read either field.
    if "username" in set_doc:
        set_doc["name"] = set_doc["username"]

    from __init__ import users_collection
    from pymongo.errors import DuplicateKeyError

    try:
        users_collection.update_one({"_id": request.current_user.get("_id")}, {"$set": set_doc})
    except DuplicateKeyError:
        return fail("Username or email already exists", 409, code="DUPLICATE")

    refreshed = users_collection.find_one({"_id": request.current_user.get("_id")}, {"password": 0})
    if not refreshed:
        return fail("user not found", 404)

    return success(
        "Profile updated",
        data={
            "user": {
                "_id": refreshed.get("_id"),
                "username": refreshed.get("username"),
                "email": refreshed.get("email"),
                "role": refreshed.get("role"),
                "status": refreshed.get("status"),
                "onboardingDone": refreshed.get("onboardingDone", False),
                "phone": refreshed.get("phone", ""),
                "wilaya": refreshed.get("wilaya", ""),
            }
        },
        status=200,
    )


@auth.route("/mail/status", methods=["GET"])
def mail_status():
    """
    Debug helper: verify SMTP env is loaded on the server.
    Does NOT return secrets.
    """
    return success(
        "Mail status loaded",
        data={
            "configured": bool(is_mail_configured()),
            "server": (os.getenv("MAIL_SERVER") or "").strip(),
            "port": int(os.getenv("MAIL_PORT", "587")),
            "use_tls": os.getenv("MAIL_USE_TLS", "true").lower() in ("1", "true", "yes"),
            "username_set": bool((os.getenv("MAIL_USERNAME") or "").strip()),
            "default_sender": (os.getenv("MAIL_DEFAULT_SENDER") or "").strip(),
        },
        status=200,
    )

