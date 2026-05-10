from datetime import datetime, timezone
from app.extensions import db
from app.models.user import User
from app.models.board_member import BoardMember
from app.models.invitation import BoardInvitation
from app.models.invitation_status import InvitationStatus
from app.utils.exceptions import (
    ForbiddenError,
    NotFoundError,
    ConflictError,
    BadRequestError,
)


class InvitationService:

    @staticmethod
    def get_my_invitations(user_id):
        user = db.session.get(User, user_id)

        if not user:
            raise NotFoundError("User not found")

        return (
            BoardInvitation.query
            .filter_by(
                email=user.email.lower(),
                status=InvitationStatus.PENDING,
            )
            .order_by(BoardInvitation.created_at.desc())
            .all()
        )

    @staticmethod
    def accept_invitation(user_id, token):
        user = db.session.get(User, user_id)

        if not user:
            raise NotFoundError("User not found")

        invitation = BoardInvitation.query.filter_by(token=token).first()

        if not invitation:
            raise NotFoundError("Invitation not found")

        if invitation.status != InvitationStatus.PENDING:
            raise BadRequestError("Invitation is no longer pending")

        now = datetime.now(timezone.utc)

        if invitation.expires_at < now:
            invitation.status = InvitationStatus.EXPIRED
            invitation.responded_at = now
            db.session.commit()
            raise BadRequestError("Invitation has expired")

        if invitation.email.lower() != user.email.lower():
            raise ForbiddenError("This invitation does not belong to this account")

        existing_member = BoardMember.query.filter_by(
            board_id=invitation.board_id,
            user_id=user.id,
        ).first()

        if existing_member:
            raise ConflictError("User is already a board member")

        member = BoardMember(
            board_id=invitation.board_id,
            user_id=user.id,
            role=invitation.role,
        )

        invitation.status = InvitationStatus.ACCEPTED
        invitation.responded_at = now

        db.session.add(member)
        db.session.commit()

        return member

    @staticmethod
    def decline_invitation(user_id, token):
        user = db.session.get(User, user_id)

        if not user:
            raise NotFoundError("User not found")

        invitation = BoardInvitation.query.filter_by(token=token).first()

        if not invitation:
            raise NotFoundError("Invitation not found")

        if invitation.status != InvitationStatus.PENDING:
            raise BadRequestError("Invitation is no longer pending")

        now = datetime.now(timezone.utc)

        if invitation.expires_at < now:
            invitation.status = InvitationStatus.EXPIRED
            invitation.responded_at = now
            db.session.commit()
            raise BadRequestError("Invitation has expired")

        if invitation.email.lower() != user.email.lower():
            raise ForbiddenError("This invitation does not belong to this account")

        invitation.status = InvitationStatus.DECLINED
        invitation.responded_at = now

        db.session.commit()

        return invitation