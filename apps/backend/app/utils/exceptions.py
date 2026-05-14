class AppError(Exception):
    status_code = 500
    message = "Internal server error"

    def __init__(self, message=None, status_code=None, errors=None):
        super().__init__(message or self.message)
        self.message = message or self.message
        self.status_code = status_code or self.status_code
        self.errors = errors

    def to_dict(self):
        return {
            "message": self.message,
            "errors": self.errors
        }


class BadRequestError(AppError):
    status_code = 400
    message = "Bad request"


class UnauthorizedError(AppError):
    status_code = 401
    message = "Unauthorized"


class ForbiddenError(AppError):
    status_code = 403
    message = "Forbidden"


class NotFoundError(AppError):
    status_code = 404
    message = "Resource not found"


class ConflictError(AppError):
    status_code = 409
    message = "Resource already exists"