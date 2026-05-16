from datetime import datetime, timezone, timedelta
from flask_jwt_extended import create_access_token, create_refresh_token
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db
from app.models.auth.user import User
from app.services.auth.email_service import EmailService
from app.utils.exceptions import UnauthorizedError, ConflictError, BadRequestError
from app.utils.security import generate_secure_token, hash_token
from app.constants.messages import Messages


class AuthService:
    @staticmethod
    def _issue_tokens(user):
        return {
            "access_token": create_access_token(identity=str(user.id)),
            "refresh_token": create_refresh_token(identity=str(user.id)),
        }

    @staticmethod
    def signup(data):
        email = data["email"].lower().strip()

        existing_user = User.query.filter_by(email=email).first()

        if existing_user:
            raise ConflictError(Messages.EMAIL_EXISTS, code="EMAIL_EXISTS")

        raw_token = generate_secure_token()

        user = User(
            name=data["name"].strip(),
            email=email,
            password_hash=generate_password_hash(data["password"]),
            is_email_verified=False,
            email_verification_token_hash=hash_token(raw_token),
            email_verification_expires_at=datetime.now(timezone.utc)
            + timedelta(hours=24),
        )

        try:
            db.session.add(user)
            db.session.flush()

            EmailService.send_email_verification(user, raw_token)

            db.session.commit()

        except IntegrityError:
            db.session.rollback()
            raise ConflictError(Messages.EMAIL_EXISTS, code="EMAIL_EXISTS")

        except Exception:
            db.session.rollback()
            raise BadRequestError(Messages.EMAIL_SEND_FAILED, code="EMAIL_SEND_FAILED")

        return {
            "user": user,
            **AuthService._issue_tokens(user),
        }

    @staticmethod
    def login(data):
        email = data["email"].lower().strip()
        password = data["password"]

        user = User.query.filter_by(email=email).first()

        if not user:
            raise UnauthorizedError(
                Messages.ACCOUNT_NOT_FOUND,
                code="ACCOUNT_NOT_FOUND",
            )

        if not check_password_hash(user.password_hash, password):
            raise UnauthorizedError(
                Messages.INVALID_CREDENTIALS,
                code="INVALID_CREDENTIALS",
            )

        return {
            "user": user,
            **AuthService._issue_tokens(user),
        }

    @staticmethod
    def refresh(user_id):
        user = db.session.get(User, user_id)

        if not user:
            raise UnauthorizedError(Messages.USER_NOT_FOUND, code="USER_NOT_FOUND")

        return {
            "access_token": create_access_token(identity=str(user.id)),
        }

    @staticmethod
    def verify_email(raw_token):
        token_hash = hash_token(raw_token)

        user = User.query.filter_by(
            email_verification_token_hash=token_hash,
        ).first()

        if not user:
            raise BadRequestError(
                Messages.INVALID_VERIFICATION_TOKEN,
                code="INVALID_VERIFICATION_TOKEN",
            )

        if user.is_email_verified:
            return user

        now = datetime.now(timezone.utc)

        if user.email_verification_expires_at < now:
            raise BadRequestError(
                Messages.VERIFICATION_EXPIRED,
                code="VERIFICATION_EXPIRED",
            )

        user.is_email_verified = True

        db.session.commit()

        return user

    @staticmethod
    def resend_verification_email(user_id):
        user = db.session.get(User, user_id)

        if not user:
            raise UnauthorizedError(Messages.USER_NOT_FOUND, code="USER_NOT_FOUND")

        if user.is_email_verified:
            return user

        raw_token = generate_secure_token()

        user.email_verification_token_hash = hash_token(raw_token)
        user.email_verification_expires_at = datetime.now(timezone.utc) + timedelta(
            hours=24
        )

        try:
            EmailService.send_email_verification(user, raw_token)
            db.session.commit()

        except Exception:
            db.session.rollback()
            raise BadRequestError(Messages.EMAIL_SEND_FAILED, code="EMAIL_SEND_FAILED")

        return user