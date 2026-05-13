from functools import wraps
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.auth.user import User
from app.models.auth.user_role import UserRole
from app.utils.exceptions import ForbiddenError, UnauthorizedError


def super_admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id)

        if not user:
            raise UnauthorizedError("User not found")

        if user.role != UserRole.SUPER_ADMIN:
            raise ForbiddenError("Super admin access required")

        return fn(*args, **kwargs)

    return wrapper