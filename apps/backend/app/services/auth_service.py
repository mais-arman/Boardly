from flask_jwt_extended import create_access_token, create_refresh_token
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db
from app.models.user import User
from app.utils.exceptions import BadRequestError, UnauthorizedError, ConflictError


class AuthService:

    @staticmethod
    def signup(data):
        email = data["email"].lower().strip()

        existing_user = User.query.filter_by(email=email).first()

        if existing_user:
            raise ConflictError("Email already exists")

        user = User(
            name=data["name"].strip(),
            email=email,
            password_hash=generate_password_hash(data["password"]),
        )

        try:
            db.session.add(user)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            raise ConflictError("Email already exists")

        return user

    @staticmethod
    def login(data):
        email = data["email"].lower().strip()
        password = data["password"]

        user = User.query.filter_by(email=email).first()

        if not user or not check_password_hash(user.password_hash, password):
            raise UnauthorizedError("Invalid email or password")

        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return {
            "user": user,
            "access_token": access_token,
            "refresh_token": refresh_token,
        }

    @staticmethod
    def refresh(user_id):
        access_token = create_access_token(identity=str(user_id))

        return {
            "access_token": access_token,
        }