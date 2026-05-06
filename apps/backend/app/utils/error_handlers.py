import logging
from flask import jsonify
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException
from flask_limiter.errors import RateLimitExceeded
from app.extensions import db
from app.utils.exceptions import AppError

logger = logging.getLogger(__name__)


def register_error_handlers(app):

    @app.errorhandler(RateLimitExceeded)
    def handle_rate_limit(error):
        response = {
            "error": "RateLimitExceeded",
            "message": "Too many requests. Please try again later.",
        }

        logger.warning({
            "error": "RateLimitExceeded",
            "message": str(error.description),
            "status_code": 429,
        })

        return jsonify(response), 429

    @app.errorhandler(Exception)
    def handle_exceptions(error):
        errors = None

        if isinstance(error, AppError):
            status_code = error.status_code
            message = error.message
            error_name = error.__class__.__name__
            errors = error.errors

        elif isinstance(error, ValidationError):
            status_code = 400
            message = "Validation error"
            error_name = "ValidationError"
            errors = error.messages

        elif isinstance(error, HTTPException):
            status_code = error.code
            message = getattr(error, "description", "HTTP error")
            error_name = getattr(error, "name", error.__class__.__name__)

        else:
            status_code = getattr(error, "code", 500)
            error_name = error.__class__.__name__
            message = "Internal server error" if status_code >= 500 else str(error)

        try:
            db.session.rollback()
        except Exception:
            pass

        log_data = {
            "error": error_name,
            "message": str(error),
            "status_code": status_code,
        }

        if status_code >= 500:
            logger.error(log_data, exc_info=error)
        else:
            logger.warning(log_data)

        response = {
            "error": error_name,
            "message": message,
        }

        if errors is not None:
            response["errors"] = errors

        return jsonify(response), status_code