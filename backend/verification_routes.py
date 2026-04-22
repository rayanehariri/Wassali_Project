import mimetypes
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from flask import Blueprint, request, send_file
from werkzeug.utils import secure_filename

from __init__ import Role, Status, users_collection, verifications_collection
from api_response import fail, success
from auth_utils import require_auth
from schemas import SubmitVerificationSchema, validate_payload


verification = Blueprint("verification", __name__)

BACKEND_DIR = Path(__file__).resolve().parent
UPLOAD_ROOT = BACKEND_DIR / "uploads"
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf"}
DOC_KEYS = frozenset({"idCard", "license", "registration"})


def _utc_now():
    return datetime.now(timezone.utc)


def _path_ok_for_deliverer(deliverer_id: str, rel: str | None) -> bool:
    if not rel or not isinstance(rel, str):
        return False
    if ".." in rel or rel.startswith(("/", "\\")):
        return False
    rel = rel.replace("\\", "/").strip("/")
    prefix = f"verifications/{deliverer_id}/"
    return rel.startswith(prefix)


def _resolve_upload_path(rel: str) -> Path | None:
    if not rel or ".." in rel:
        return None
    rel = rel.replace("\\", "/").strip("/")
    abs_path = (UPLOAD_ROOT / rel).resolve()
    try:
        abs_path.relative_to(UPLOAD_ROOT.resolve())
    except ValueError:
        return None
    return abs_path if abs_path.is_file() else None


@verification.route("/upload", methods=["POST"])
@require_auth(Role.DELIVERER.value)
def upload_verification_files():
    """Multipart: fields idCard, license, registration (each optional; at least one required)."""
    deliverer_id = request.current_user.get("_id")
    saved: list[Path] = []
    out: dict[str, dict[str, str]] = {}

    try:
        for field in DOC_KEYS:
            if field not in request.files:
                continue
            f = request.files[field]
            if not f or not f.filename:
                continue
            orig = f.filename
            safe = secure_filename(orig) or f"{field}.bin"
            ext = Path(safe).suffix.lower()
            if ext not in ALLOWED_EXTENSIONS:
                return fail(f"Unsupported file type for {field}", 400, code="VALIDATION_ERROR")
            sub = UPLOAD_ROOT / "verifications" / str(deliverer_id)
            sub.mkdir(parents=True, exist_ok=True)
            stored_name = f"{uuid.uuid4().hex}_{safe}"
            dest = sub / stored_name
            f.save(str(dest))
            saved.append(dest)
            rel_path = f"verifications/{deliverer_id}/{stored_name}".replace("\\", "/")
            out[field] = {"name": orig, "path": rel_path}

        if not out:
            return fail("No files provided", 400, code="VALIDATION_ERROR")

        return success("Uploaded", data=out, status=200)
    except Exception:
        for p in saved:
            try:
                p.unlink(missing_ok=True)
            except OSError:
                pass
        raise


@verification.route("/submit", methods=["POST"])
@require_auth(Role.DELIVERER.value)
def submit_verification():
    """Deliverer submits vehicle + document metadata; optional paths from POST /verification/upload."""
    data, error = validate_payload(SubmitVerificationSchema(), request.get_json(silent=True))
    if error:
        return error

    deliverer_id = request.current_user.get("_id")
    path_fields = [
        ("idCard", "idCardPath"),
        ("license", "licensePath"),
        ("registration", "registrationPath"),
    ]
    for doc_key, path_key in path_fields:
        p = data.get(path_key)
        if p and not _path_ok_for_deliverer(deliverer_id, p):
            return fail(f"Invalid path for {doc_key}", 400, code="VALIDATION_ERROR")

    ver_id = str(uuid.uuid4())
    doc = {
        "_id": ver_id,
        "deliverer_id": deliverer_id,
        "vehicle": {
            "type": data["vehicleType"],
            "makeModel": data["makeModel"],
            "licensePlate": data["licensePlate"],
        },
        "documents": {
            "idCard": {"name": data["idCardName"], **({"path": data["idCardPath"]} if data.get("idCardPath") else {})},
            "license": {"name": data["licenseName"], **({"path": data["licensePath"]} if data.get("licensePath") else {})},
            "registration": {
                "name": data["registrationName"],
                **({"path": data["registrationPath"]} if data.get("registrationPath") else {}),
            },
        },
        "status": "Pending",
        "created_at": _utc_now(),
        "updated_at": _utc_now(),
    }
    verifications_collection.insert_one(doc)

    users_collection.update_one(
        {"_id": deliverer_id},
        {"$set": {"status": Status.PENDING.value, "onboardingDone": True}},
    )

    return success("Verification submitted", data={"verificationId": ver_id}, status=201)


@verification.route("/admin/list", methods=["GET"])
@require_auth(Role.ADMIN.value)
def admin_list_verifications():
    deliverers = list(users_collection.find({"role": Role.DELIVERER.value, "onboardingDone": True}))
    for d in deliverers:
        did = d.get("_id")
        if not did:
            continue
        exists = verifications_collection.find_one({"deliverer_id": did})
        if exists:
            continue
        verifications_collection.insert_one(
            {
                "_id": str(uuid.uuid4()),
                "deliverer_id": did,
                "vehicle": {
                    "type": "car",
                    "makeModel": "Not provided",
                    "licensePlate": "Not provided",
                },
                "documents": {
                    "idCard": {"name": "missing"},
                    "license": {"name": "missing"},
                    "registration": {"name": "missing"},
                },
                "status": "Pending",
                "created_at": _utc_now(),
                "updated_at": _utc_now(),
            }
        )

    status = request.args.get("status")
    query = {}
    if status:
        query["status"] = status
    items = list(verifications_collection.find(query).sort("created_at", -1))
    deliverer_ids = [i.get("deliverer_id") for i in items if i.get("deliverer_id")]
    deliverers = list(users_collection.find({"_id": {"$in": deliverer_ids}}, {"password": 0}))
    deliverer_map = {d.get("_id"): d for d in deliverers}
    for item in items:
        item["_id"] = str(item["_id"])
        d = deliverer_map.get(item.get("deliverer_id")) or {}
        display_name = d.get("name") or d.get("username") or "Deliverer"
        item["deliverer"] = {
            "_id": d.get("_id"),
            "name": display_name,
            "email": d.get("email") or "",
            "avatar": "".join([p[:1] for p in display_name.split()[:2]]).upper() or "D",
        }
        item["id_type"] = "Driver's License"
        item["id_number"] = (item.get("vehicle") or {}).get("licensePlate") or "N/A"
    return success("Verifications loaded", data={"verifications": items}, status=200)


@verification.route("/admin/<verification_id>", methods=["GET"])
@require_auth(Role.ADMIN.value)
def admin_get_verification(verification_id: str):
    item = verifications_collection.find_one({"_id": verification_id})
    if not item:
        return fail("Verification not found", 404)
    item["_id"] = str(item["_id"])
    d = users_collection.find_one({"_id": item.get("deliverer_id")}, {"password": 0}) or {}
    display_name = d.get("name") or d.get("username") or "Deliverer"
    item["deliverer"] = {
        "_id": d.get("_id"),
        "name": display_name,
        "email": d.get("email") or "",
        "avatar": "".join([p[:1] for p in display_name.split()[:2]]).upper() or "D",
    }
    item["id_type"] = "Driver's License"
    item["id_number"] = (item.get("vehicle") or {}).get("licensePlate") or "N/A"
    return success("Verification loaded", data={"verification": item}, status=200)


@verification.route("/admin/<verification_id>/document/<doc_key>", methods=["GET"])
@require_auth(Role.ADMIN.value)
def admin_get_verification_document(verification_id: str, doc_key: str):
    if doc_key not in DOC_KEYS:
        return fail("Invalid document key", 400)

    item = verifications_collection.find_one({"_id": verification_id})
    if not item:
        return fail("Verification not found", 404)

    node = (item.get("documents") or {}).get(doc_key) or {}
    rel = node.get("path")
    if not rel:
        return fail("No file on record for this document", 404)

    abs_path = _resolve_upload_path(rel)
    if not abs_path:
        return fail("File not found", 404)

    mime, _ = mimetypes.guess_type(abs_path.name)
    download_name = node.get("name") or abs_path.name
    return send_file(
        abs_path,
        mimetype=mime or "application/octet-stream",
        as_attachment=False,
        download_name=os.path.basename(download_name) or abs_path.name,
    )


@verification.route("/admin/<verification_id>/approve", methods=["POST"])
@require_auth(Role.ADMIN.value)
def admin_approve_verification(verification_id: str):
    item = verifications_collection.find_one({"_id": verification_id})
    if not item:
        return fail("Verification not found", 404)

    deliverer_id = item["deliverer_id"]
    now = _utc_now()
    verifications_collection.update_one(
        {"_id": verification_id},
        {"$set": {"status": "Verified", "updated_at": now}},
    )
    users_collection.update_one(
        {"_id": deliverer_id},
        {"$set": {"status": Status.ACTIVE.value}},
    )
    return success("Deliverer approved", status=200)


@verification.route("/admin/<verification_id>/reject", methods=["POST"])
@require_auth(Role.ADMIN.value)
def admin_reject_verification(verification_id: str):
    data = request.get_json(silent=True) or {}
    reason = data.get("reason") or "Rejected by admin"
    item = verifications_collection.find_one({"_id": verification_id})
    if not item:
        return fail("Verification not found", 404)

    now = _utc_now()
    verifications_collection.update_one(
        {"_id": verification_id},
        {"$set": {"status": "Rejected", "rejection_reason": reason, "updated_at": now}},
    )
    return success("Verification rejected", status=200)
