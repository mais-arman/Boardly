from datetime import datetime, timezone
from app.extensions import db
from app.models.auth.user import User
from app.models.boards.board import Board
from app.models.boards.board_member import BoardMember
from app.models.boards.invitation import BoardInvitation
from app.models.boards.invitation_status import InvitationStatus
from app.models.boards.board_role import Permission
from app.services.boards.board_permission_service import BoardPermissionService
from app.utils.exceptions import (
    ForbiddenError,
    NotFoundError,
    ConflictError,
    BadRequestError,
)


class InvitationService:

    @staticmethod
    def _mark_expired_if_needed(invitation):
        now = datetime.now(timezone.utc)

        if invitation.status == InvitationStatus.PENDING and invitation.expires_at < now:
            invitation.status = InvitationStatus.EXPIRED
            invitation.responded_at = now
            db.session.commit()
            return True

        return False

    @staticmethod
    def get_my_invitations(user_id):
        user = db.session.get(User, user_id)

        if not user:
            raise NotFoundError("User not found")

        invitations = (
            BoardInvitation.query
            .filter_by(
                email=user.email.lower(),
                status=InvitationStatus.PENDING,
            )
            .order_by(BoardInvitation.created_at.desc())
            .all()
        )

        for invitation in invitations:
            InvitationService._mark_expired_if_needed(invitation)

        return [
            invitation
            for invitation in invitations
            if invitation.status == InvitationStatus.PENDING
        ]

    @staticmethod
    def get_board_invitations(request_user_id, board_id):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if not BoardPermissionService.has_permission(
            request_user_id,
            board_id,
            Permission.MANAGE_MEMBERS,
        ):
            raise ForbiddenError("You do not have permission to view invitations")

        return (
            BoardInvitation.query
            .filter_by(board_id=board_id)
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

        if InvitationService._mark_expired_if_needed(invitation):
            raise BadRequestError("Invitation has expired")

        if invitation.status != InvitationStatus.PENDING:
            raise BadRequestError("Invitation is no longer pending")

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
        invitation.responded_at = datetime.now(timezone.utc)

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

        if InvitationService._mark_expired_if_needed(invitation):
            raise BadRequestError("Invitation has expired")

        if invitation.status != InvitationStatus.PENDING:
            raise BadRequestError("Invitation is no longer pending")

        if invitation.email.lower() != user.email.lower():
            raise ForbiddenError("This invitation does not belong to this account")

        invitation.status = InvitationStatus.DECLINED
        invitation.responded_at = datetime.now(timezone.utc)

        db.session.commit()

        return invitation

    @staticmethod
    def cancel_invitation(request_user_id, board_id, token):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if not BoardPermissionService.has_permission(
            request_user_id,
            board_id,
            Permission.MANAGE_MEMBERS,
        ):
            raise ForbiddenError("You do not have permission to cancel invitations")

        invitation = BoardInvitation.query.filter_by(
            board_id=board_id,
            token=token,
        ).first()

        if not invitation:
            raise NotFoundError("Invitation not found")

        if invitation.status != InvitationStatus.PENDING:
            raise BadRequestError("Only pending invitations can be cancelled")

        invitation.status = InvitationStatus.CANCELLED
        invitation.responded_at = datetime.now(timezone.utc)

        db.session.commit()

        return invitation