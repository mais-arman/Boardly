from app.extensions import db
from app.models.auth.user import User
from app.models.boards.board import Board
from app.models.boards.board_member import BoardMember
from app.models.boards.invitation import BoardInvitation
from app.models.boards.invitation_status import InvitationStatus
from app.models.boards.board_role import BoardRole
from app.services.email_service import EmailService
from app.utils.exceptions import NotFoundError, ConflictError, BadRequestError


class MemberService:

    @staticmethod
    def invite_member(request_user_id, board_id, data):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        email = data["email"].lower().strip()
        role = BoardRole(data["role"])

        user = User.query.filter_by(email=email).first()

        if user:
            existing_member = BoardMember.query.filter_by(
                board_id=board_id,
                user_id=user.id,
            ).first()

            if existing_member:
                raise ConflictError("User is already a board member")

        existing_pending_invitation = BoardInvitation.query.filter_by(
            board_id=board_id,
            email=email,
            status=InvitationStatus.PENDING,
        ).first()

        if existing_pending_invitation:
            raise ConflictError("Pending invitation already exists for this email")

        invitation = BoardInvitation(
            board_id=board_id,
            invited_by_id=request_user_id,
            email=email,
            role=role,
            status=InvitationStatus.PENDING,
        )

        try:
            db.session.add(invitation)
            db.session.flush()  

            EmailService.send_board_invitation(invitation)

            db.session.commit()
            return invitation

        except Exception:
            db.session.rollback()
            raise BadRequestError("Invitation email could not be sent")

    @staticmethod
    def get_members(board_id):
        return BoardMember.query.filter_by(board_id=board_id).all()

    @staticmethod
    def update_member_role(board_id, member_id, data):
        member = db.session.get(BoardMember, member_id)

        if not member or str(member.board_id) != str(board_id):
            raise NotFoundError("Member not found")

        if member.role == BoardRole.OWNER:
            raise BadRequestError("Owner role cannot be changed")

        member.role = BoardRole(data["role"])
        db.session.commit()

        return member

    @staticmethod
    def remove_member(board_id, member_id):
        member = db.session.get(BoardMember, member_id)

        if not member or str(member.board_id) != str(board_id):
            raise NotFoundError("Member not found")

        if member.role == BoardRole.OWNER:
            raise BadRequestError("Owner cannot be removed")

        db.session.delete(member)
        db.session.commit()