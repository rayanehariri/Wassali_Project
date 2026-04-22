from flask import jsonify


def success(message: str = "OK", data: dict | None = None, status: int = 200, meta: dict | None = None):
    payload = {"success": True, "message": message}
    if data is not None:
        payload.update(data)
    if meta is not None:
        payload["meta"] = meta
    return jsonify(payload), status


def fail(
    message: str = "Request failed",
    status: int = 400,
    errors: dict | list | None = None,
    code: str | None = None,
):
    payload = {"success": False, "message": message}
    if errors is not None:
        payload["errors"] = errors
    if code is not None:
        payload["code"] = code
    return jsonify(payload), status
