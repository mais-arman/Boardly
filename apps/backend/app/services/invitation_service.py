from datetime import datetime, timezone
from app.extensions import db
from app.models.user import User
from app.models.board_member import BoardMember
from app.models.invitation import BoardInvitation
from app.models.invitation_status import InvitationStatus
from app.utils.exceptions import ForbiddenError, NotFoundError, ConflictError, BadRequestError


class InvitationService:

    @staticmethod
    def get_my_invitations(user_id):
        user = db.session.get(User, user_id)

        if not user:
            raise NotFoundError("User not found")

        return (
            BoardInvitation.query
            .filter_by(
                email=user.email,
                status=InvitationStatus.PENDING,
            )
            .order_by(BoardInvitation.created_at.desc())
            .all()
        )

    @staticmethod
    def accept_invitation(user_id, invitation_id):
        user = db.session.get(User, user_id)

        if not user:
            raise NotFoundError("User not found")

        invitation = db.session.get(BoardInvitation, invitation_id)

        if not invitation:
            raise NotFoundError("Invitation not found")

        if invitation.status != InvitationStatus.PENDING:
            raise BadRequestError("Invitation is no longer pending")

        if invitation.email.lower() != user.email.lower():
            raise ForbiddenError("This invitation does not belong to you")

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
        invitation.responded_at = datetime.now(timezone.utc)

        db.session.add(member)
        db.session.commit()

        return member

    @staticmethod
    def decline_invitation(user_id, invitation_id):
        user = db.session.get(User, user_id)

        if not user:
            raise NotFoundError("User not found")

        invitation = db.session.get(BoardInvitation, invitation_id)

        if not invitation:
            raise NotFoundError("Invitation not found")

        if invitation.status != InvitationStatus.PENDING:
            raise BadRequestError("Invitation is no longer pending")

        if invitation.email.lower() != user.email.lower():
            raise ForbiddenError("This invitation does not belong to you")

        invitation.status = InvitationStatus.DECLINED
        invitation.responded_at = datetime.now(timezone.utc)

        db.session.commit()

        return invitation