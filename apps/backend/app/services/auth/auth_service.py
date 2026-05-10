from uuid import uuid4
from datetime import datetime, timezone, timedelta
from flask_jwt_extended import create_access_token, create_refresh_token
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db
from app.models.auth.user import User
from app.services.auth.email_service import EmailService
from app.utils.exceptions import UnauthorizedError, ConflictError, BadRequestError

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
            is_email_verified=False,
            email_verification_token=uuid4(),
            email_verification_expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
        )

        try:
            db.session.add(user)
            db.session.flush()

            EmailService.send_email_verification(user)

            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            raise ConflictError("Email already exists")
        except Exception:
            db.session.rollback()
            raise BadRequestError("Verification email could not be sent")

        return user

    @staticmethod
    def login(data):
        email = data["email"].lower().strip()
        password = data["password"]

        user = User.query.filter_by(email=email).first()

        if not user or not check_password_hash(user.password_hash, password):
            raise UnauthorizedError("Invalid email or password")

        if not user.is_email_verified:
            raise UnauthorizedError("Please verify your email before logging in")

        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return {
            "user": user,
            "access_token": access_token,
            "refresh_token": refresh_token,
        }

    @staticmethod
    def refresh(user_id):
        user = db.session.get(User, user_id)

        if not user:
            raise UnauthorizedError("User not found")

        access_token = create_access_token(identity=str(user.id))

        return {
            "access_token": access_token,
        }

    @staticmethod
    def verify_email(token):
        user = User.query.filter_by(email_verification_token=token).first()

        if not user:
            raise BadRequestError("Invalid verification token")

        if user.is_email_verified:
            return user

        now = datetime.now(timezone.utc)

        if user.email_verification_expires_at < now:
            raise BadRequestError("Verification link has expired")

        user.is_email_verified = True
        user.email_verification_token = None
        user.email_verification_expires_at = None

        db.session.commit()

        return user