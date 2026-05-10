from datetime import datetime, timezone
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.constants.routes import (
    AUTH_SIGNUP,
    AUTH_LOGIN,
    AUTH_REFRESH,
    AUTH_LOGOUT,
    AUTH_ME,
    AUTH_VERIFY_EMAIL,
)
from app.extensions import db, get_redis
from app.models.auth.user import User
from app.schemas.auth.auth_schema import SignupSchema, LoginSchema, UserResponseSchema
from app.services.auth.auth_service import AuthService
from app.utils.jwt_handlers import JWT_BLOCKLIST_PREFIX
from app.utils.responses import success_response
from app.utils.exceptions import UnauthorizedError


auth_bp = Blueprint("auth", __name__)

signup_schema = SignupSchema()
login_schema = LoginSchema()
user_response_schema = UserResponseSchema()


@auth_bp.post(AUTH_SIGNUP)
def signup():
    data = signup_schema.load(request.get_json(silent=True) or {})
    user = AuthService.signup(data)

    return success_response(
        data=user_response_schema.dump(user),
        message="User registered successfully",
        status_code=201,
    )


@auth_bp.post(AUTH_LOGIN)
def login():
    data = login_schema.load(request.get_json(silent=True) or {})
    result = AuthService.login(data)

    return success_response(
        data={
            "user": user_response_schema.dump(result["user"]),
            "access_token": result["access_token"],
            "refresh_token": result["refresh_token"],
        },
        message="Login successful",
    )


@auth_bp.post(AUTH_REFRESH)
@jwt_required(refresh=True)
def refresh():
    result = AuthService.refresh(get_jwt_identity())

    return success_response(
        data=result,
        message="Token refreshed successfully",
    )


@auth_bp.post(AUTH_LOGOUT)
@jwt_required()
def logout():
    jwt_data = get_jwt()

    jti = jwt_data["jti"]
    expires_at = jwt_data["exp"]

    now = datetime.now(timezone.utc).timestamp()
    ttl = int(expires_at - now)

    if ttl > 0:
        get_redis().setex(
            f"{JWT_BLOCKLIST_PREFIX}{jti}",
            ttl,
            "1",
        )

    return success_response(message="Logout successful")


@auth_bp.get(AUTH_ME)
@jwt_required()
def me():
    user = db.session.get(User, get_jwt_identity())

    if not user:
        raise UnauthorizedError("User not found")

    return success_response(
        data=user_response_schema.dump(user),
        message="Current user fetched successfully",
    )

@auth_bp.post(AUTH_VERIFY_EMAIL)
def verify_email(token):
    user = AuthService.verify_email(token)

    return success_response(
        data=user_response_schema.dump(user),
        message="Email verified successfully",
    )    