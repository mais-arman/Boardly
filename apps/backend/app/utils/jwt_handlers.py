from flask import jsonify
from app.extensions import jwt, get_redis

JWT_BLOCKLIST_PREFIX = "jwt_blocklist:"


def jwt_error_response(error_name, message, status_code=401, code=None):
    response = {
        "success": False,
        "error": error_name,
        "message": message,
        "code": code or error_name,
    }

    return jsonify(response), status_code


@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return bool(get_redis().exists(f"{JWT_BLOCKLIST_PREFIX}{jti}"))


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jwt_error_response(
        error_name="TokenExpired",
        message="Token has expired",
        status_code=401,
        code="TOKEN_EXPIRED",
    )


@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jwt_error_response(
        error_name="InvalidToken",
        message="Invalid token",
        status_code=401,
        code="INVALID_TOKEN",
    )


@jwt.unauthorized_loader
def missing_token_callback(error):
    return jwt_error_response(
        error_name="AuthorizationRequired",
        message="Authorization token is required",
        status_code=401,
        code="AUTHORIZATION_REQUIRED",
    )


@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    return jwt_error_response(
        error_name="TokenRevoked",
        message="Token has been revoked",
        status_code=401,
        code="TOKEN_REVOKED",
    )