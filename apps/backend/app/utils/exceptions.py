class AppError(Exception):
    status_code = 500
    message = "Internal server error"
    code = "INTERNAL_SERVER_ERROR"

    def __init__(self, message=None, status_code=None, errors=None, code=None):
        super().__init__(message or self.message)
        self.message = message or self.message
        self.status_code = status_code or self.status_code
        self.errors = errors
        self.code = code or self.code

    def to_dict(self):
        response = {
            "message": self.message,
            "code": self.code,
        }

        if self.errors is not None:
            response["errors"] = self.errors

        return response


class BadRequestError(AppError):
    status_code = 400
    message = "Bad request"
    code = "BAD_REQUEST"


class UnauthorizedError(AppError):
    status_code = 401
    message = "Unauthorized"
    code = "UNAUTHORIZED"


class ForbiddenError(AppError):
    status_code = 403
    message = "Forbidden"
    code = "FORBIDDEN"


class NotFoundError(AppError):
    status_code = 404
    message = "Resource not found"
    code = "NOT_FOUND"


class ConflictError(AppError):
    status_code = 409
    message = "Resource already exists"
    code = "CONFLICT"