from datetime import datetime, timezone
from app.extensions import db
from app.models.auth.user import User
from app.models.boards.board import Board
from app.models.boards.board_member import BoardMember
from app.models.boards.invitation import BoardInvitation
from app.models.boards.invitation_status import InvitationStatus
from app.models.boards.board_role import Permission
from app.services.boards.board_permission_service import BoardPermissionService
from app.services.realtime_service import RealtimeService
from app.utils.exceptions import NotFoundError, BadRequestError, ForbiddenError
from app.utils.security import hash_token
from app.constants.messages import Messages


class InvitationService:
    @staticmethod
    def get_invitation_by_token(raw_token):
        invitation = BoardInvitation.query.filter_by(
            token_hash=hash_token(raw_token),
        ).first()

        if not invitation:
            raise NotFoundError(Messages.INVITATION_NOT_FOUND)

        if invitation.status != InvitationStatus.PENDING:
            raise BadRequestError(Messages.INVITATION_NOT_PENDING)

        if invitation.expires_at < datetime.now(timezone.utc):
            invitation.status = InvitationStatus.EXPIRED
            db.session.commit()
            raise BadRequestError(Messages.INVITATION_EXPIRED)

        return invitation

    @staticmethod
    def get_board_invitations(board_id):
        return (
            BoardInvitation.query
            .filter_by(board_id=board_id)
            .order_by(BoardInvitation.created_at.desc())
            .all()
        )

    @staticmethod
    def get_my_invitations(user_id):
        user = db.session.get(User, user_id)

        if not user:
            raise NotFoundError(Messages.USER_NOT_FOUND)

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
    def _validate_invitation_for_user(user_id, invitation_id):
        user = db.session.get(User, user_id)

        if not user:
            raise NotFoundError(Messages.USER_NOT_FOUND)

        invitation = db.session.get(BoardInvitation, invitation_id)

        if not invitation:
            raise NotFoundError(Messages.INVITATION_NOT_FOUND)

        if invitation.email.lower() != user.email.lower():
            raise ForbiddenError(Messages.INVITATION_WRONG_ACCOUNT)

        if invitation.status != InvitationStatus.PENDING:
            raise BadRequestError(Messages.INVITATION_NOT_PENDING)

        if invitation.expires_at < datetime.now(timezone.utc):
            invitation.status = InvitationStatus.EXPIRED
            db.session.commit()
            raise BadRequestError(Messages.INVITATION_EXPIRED)

        return user, invitation

    @staticmethod
    def accept_invitation(user_id, raw_token):
        invitation = InvitationService.get_invitation_by_token(raw_token)

        return InvitationService._accept_invitation_instance(
            user_id,
            invitation,
        )

    @staticmethod
    def decline_invitation(user_id, raw_token):
        invitation = InvitationService.get_invitation_by_token(raw_token)

        return InvitationService._decline_invitation_instance(
            user_id,
            invitation,
        )

    @staticmethod
    def accept_invitation_by_id(user_id, invitation_id):
        user, invitation = InvitationService._validate_invitation_for_user(
            user_id,
            invitation_id,
        )

        return InvitationService._accept_invitation_instance(
            user.id,
            invitation,
        )

    @staticmethod
    def decline_invitation_by_id(user_id, invitation_id):
        user, invitation = InvitationService._validate_invitation_for_user(
            user_id,
            invitation_id,
        )

        return InvitationService._decline_invitation_instance(
            user.id,
            invitation,
        )

    @staticmethod
    def _accept_invitation_instance(user_id, invitation):
        user = db.session.get(User, user_id)

        if not user:
            raise NotFoundError(Messages.USER_NOT_FOUND)

        if invitation.email.lower() != user.email.lower():
            raise ForbiddenError(Messages.INVITATION_WRONG_ACCOUNT)

        existing_member = BoardMember.query.filter_by(
            board_id=invitation.board_id,
            user_id=user.id,
        ).first()

        if existing_member:
            invitation.status = InvitationStatus.ACCEPTED
            invitation.responded_at = datetime.now(timezone.utc)
            db.session.commit()

            RealtimeService.emit_board_event(
                invitation.board_id,
                "invitation.accepted",
                {
                    "email": invitation.email,
                    "role": invitation.role.value,
                },
            )

            RealtimeService.emit_user_event(
                user.id,
                "invitation.accepted",
                {
                    "board_id": str(invitation.board_id),
                },
            )

            return existing_member

        member = BoardMember(
            board_id=invitation.board_id,
            user_id=user.id,
            role=invitation.role,
        )

        invitation.status = InvitationStatus.ACCEPTED
        invitation.responded_at = datetime.now(timezone.utc)

        db.session.add(member)
        db.session.commit()

        RealtimeService.emit_board_event(
            invitation.board_id,
            "invitation.accepted",
            {
                "email": invitation.email,
                "role": invitation.role.value,
            },
        )

        RealtimeService.emit_user_event(
            user.id,
            "invitation.accepted",
            {
                "board_id": str(invitation.board_id),
            },
        )

        return member

    @staticmethod
    def _decline_invitation_instance(user_id, invitation):
        user = db.session.get(User, user_id)

        if not user:
            raise NotFoundError(Messages.USER_NOT_FOUND)

        if invitation.email.lower() != user.email.lower():
            raise ForbiddenError(Messages.INVITATION_WRONG_ACCOUNT)

        invitation.status = InvitationStatus.DECLINED
        invitation.responded_at = datetime.now(timezone.utc)

        db.session.commit()

        RealtimeService.emit_board_event(
            invitation.board_id,
            "invitation.declined",
            {
                "email": invitation.email,
            },
        )

        RealtimeService.emit_user_event(
            user.id,
            "invitation.declined",
            {
                "board_id": str(invitation.board_id),
            },
        )

        return invitation

    @staticmethod
    def cancel_invitation_by_id(request_user_id, board_id, invitation_id):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError(Messages.BOARD_NOT_FOUND)

        if not BoardPermissionService.has_permission(
            request_user_id,
            board_id,
            Permission.MANAGE_MEMBERS,
        ):
            raise ForbiddenError("You do not have permission to cancel invitations")

        invitation = db.session.get(BoardInvitation, invitation_id)

        if not invitation or str(invitation.board_id) != str(board_id):
            raise NotFoundError(Messages.INVITATION_NOT_FOUND)

        if invitation.status != InvitationStatus.PENDING:
            raise BadRequestError(Messages.INVITATION_NOT_PENDING)

        invitation.status = InvitationStatus.CANCELLED
        invitation.responded_at = datetime.now(timezone.utc)

        db.session.commit()

        RealtimeService.emit_board_event(
            board_id,
            "invitation.cancelled",
            {
                "email": invitation.email,
            },
        )

        return invitation