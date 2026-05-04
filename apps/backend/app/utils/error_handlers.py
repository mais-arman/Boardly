from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.extensions import db
from app.utils.exceptions import AppError
from app.utils.responses import error_response


def register_error_handlers(app):

    @app.errorhandler(AppError)
    def handle_app_error(error):
        response, status = error_response(
            message=error.message,
            status_code=error.status_code,
            errors=error.errors
        )
        return response, status


    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        response, status = error_response(
            message="Validation error",
            status_code=400,
            errors=error.messages
        )
        return response, status


    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        db.session.rollback()

        app.logger.exception("Database integrity error")

        response, status = error_response(
            message="Database integrity error",
            status_code=400
        )
        return response, status


    @app.errorhandler(SQLAlchemyError)
    def handle_db_error(error):
        db.session.rollback()

        app.logger.exception("Database error")

        response, status = error_response(
            message="Database error",
            status_code=500
        )
        return response, status


    @app.errorhandler(404)
    def handle_not_found(error):
        response, status = error_response(
            message="Endpoint not found",
            status_code=404
        )
        return response, status


    @app.errorhandler(500)
    def handle_server_error(error):
        app.logger.exception("Internal server error")

        response, status = error_response(
            message="Internal server error",
            status_code=500
        )
        return response, status