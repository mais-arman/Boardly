from app.extensions import db
from app.models.auth.user import User
from app.models.boards.board import Board
from app.models.boards.board_member import BoardMember
from app.models.boards.invitation import BoardInvitation
from app.models.boards.invitation_status import InvitationStatus
from app.models.boards.board_role import BoardRole
from app.services.auth.email_service import EmailService
from app.services.realtime_service import RealtimeService
from app.utils.exceptions import NotFoundError, ConflictError, BadRequestError
from app.utils.security import generate_secure_token, hash_token
from app.constants.messages import Messages


class MemberService:
    @staticmethod
    def invite_member(request_user_id, board_id, data):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError(Messages.BOARD_NOT_FOUND, code="BOARD_NOT_FOUND")

        email = data["email"].lower().strip()
        role = BoardRole(data["role"])

        user = User.query.filter_by(email=email).first()

        if not user:
            raise BadRequestError(
                Messages.USER_EMAIL_NOT_FOUND,
                code="USER_EMAIL_NOT_FOUND",
            )

        existing_member = BoardMember.query.filter_by(
            board_id=board_id,
            user_id=user.id,
        ).first()

        if existing_member:
            raise ConflictError(
                Messages.USER_ALREADY_MEMBER,
                code="USER_ALREADY_MEMBER",
            )

        existing_pending_invitation = BoardInvitation.query.filter_by(
            board_id=board_id,
            email=email,
            status=InvitationStatus.PENDING,
        ).first()

        if existing_pending_invitation:
            raise ConflictError(
                Messages.PENDING_INVITATION_EXISTS,
                code="PENDING_INVITATION_EXISTS",
            )

        raw_token = generate_secure_token()

        invitation = BoardInvitation(
            board_id=board_id,
            invited_by_id=request_user_id,
            email=email,
            role=role,
            status=InvitationStatus.PENDING,
            token_hash=hash_token(raw_token),
        )

        try:
            db.session.add(invitation)
            db.session.flush()

            EmailService.send_board_invitation(invitation, raw_token)

            db.session.commit()

            RealtimeService.emit_board_event(board_id, "invitation.created")
            RealtimeService.emit_user_event(
                user.id,
                "invitation.received",
                {
                    "board_id": str(board_id),
                    "board_title": board.title,
                    "role": role.value,
                },
            )

            return invitation

        except Exception:
            db.session.rollback()
            raise BadRequestError(
                Messages.EMAIL_SEND_FAILED,
                code="EMAIL_SEND_FAILED",
            )

    @staticmethod
    def get_members(board_id):
        return BoardMember.query.filter_by(board_id=board_id).all()

    @staticmethod
    def update_member_role(board_id, member_id, data):
        member = db.session.get(BoardMember, member_id)

        if not member or str(member.board_id) != str(board_id):
            raise NotFoundError(
                Messages.MEMBER_NOT_FOUND,
                code="MEMBER_NOT_FOUND",
            )

        if member.role == BoardRole.OWNER:
            raise BadRequestError(
                Messages.OWNER_ROLE_CANNOT_BE_CHANGED,
                code="OWNER_ROLE_CANNOT_BE_CHANGED",
            )

        member.role = BoardRole(data["role"])
        db.session.commit()

        RealtimeService.emit_board_event(board_id, "member.role.updated")

        return member

    @staticmethod
    def remove_member(board_id, member_id):
        member = db.session.get(BoardMember, member_id)

        if not member or str(member.board_id) != str(board_id):
            raise NotFoundError(
                Messages.MEMBER_NOT_FOUND,
                code="MEMBER_NOT_FOUND",
            )

        if member.role == BoardRole.OWNER:
            raise BadRequestError(
                Messages.OWNER_CANNOT_BE_REMOVED,
                code="OWNER_CANNOT_BE_REMOVED",
            )

        db.session.delete(member)
        db.session.commit()

        RealtimeService.emit_board_event(board_id, "member.removed")