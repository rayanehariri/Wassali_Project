from flask import Flask
from werkzeug.exceptions import HTTPException

from api_response import fail


def register_error_handlers(app: Flask):
    @app.errorhandler(HTTPException)
    def handle_http_exception(error: HTTPException):
        return fail(
            message=error.description or "HTTP error",
            status=error.code or 500,
            code=error.name.replace(" ", "_").upper(),
        )

    @app.errorhandler(Exception)
    def handle_unexpected_error(error: Exception):
        app.logger.exception("Unhandled server error: %s", error)
        return fail(
            message="Internal server error",
            status=500,
            code="INTERNAL_SERVER_ERROR",
        )
