from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.exceptions import HTTPException
from app.extensions import db
from app.utils.exceptions import AppError
from app.utils.responses import error_response


def register_error_handlers(app):

    @app.errorhandler(AppError)
    def handle_app_error(error):
        return error_response(
            message=error.message,
            status_code=error.status_code,
            errors=error.errors,
        )

    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        return error_response(
            message="Validation error",
            status_code=400,
            errors=error.messages,
        )

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        db.session.rollback()

        app.logger.exception("Database integrity error")

        return error_response(
            message="Database integrity error",
            status_code=400,
        )

    @app.errorhandler(SQLAlchemyError)
    def handle_database_error(error):
        db.session.rollback()

        app.logger.exception("Database error")

        return error_response(
            message="Database error",
            status_code=500,
        )

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        return error_response(
            message=error.description,
            status_code=error.code,
        )

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        db.session.rollback()

        app.logger.exception("Unexpected error")

        return error_response(
            message="Internal server error",
            status_code=500,
        )