from app.extensions import db
from app.models.user import User
from app.models.board import Board
from app.models.board_member import BoardMember
from app.models.invitation import BoardInvitation
from app.models.invitation_status import InvitationStatus
from app.models.board_role import BoardRole, Permission
from app.services.board_permission_service import BoardPermissionService
from app.utils.exceptions import ForbiddenError, NotFoundError, ConflictError, BadRequestError

class MemberService:

    @staticmethod
    def invite_member(request_user_id, board_id, data):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if not BoardPermissionService.has_permission(
            request_user_id,
            board_id,
            Permission.MANAGE_MEMBERS,
        ):
            raise ForbiddenError("You do not have permission to invite members")

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

        db.session.add(invitation)
        db.session.commit()

        return invitation

    @staticmethod
    def get_members(request_user_id, board_id):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if not BoardPermissionService.has_permission(
            request_user_id,
            board_id,
            Permission.VIEW_BOARD,
        ):
            raise ForbiddenError("You do not have permission to view members")

        return BoardMember.query.filter_by(board_id=board_id).all()

    @staticmethod
    def update_member_role(request_user_id, board_id, member_id, data):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if not BoardPermissionService.has_permission(
            request_user_id,
            board_id,
            Permission.MANAGE_MEMBERS,
        ):
            raise ForbiddenError("You do not have permission to update members")

        member = db.session.get(BoardMember, member_id)

        if not member or str(member.board_id) != str(board_id):
            raise NotFoundError("Member not found")

        if member.role == BoardRole.OWNER:
            raise BadRequestError("Owner role cannot be changed")

        member.role = BoardRole(data["role"])
        db.session.commit()

        return member

    @staticmethod
    def remove_member(request_user_id, board_id, member_id):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if not BoardPermissionService.has_permission(
            request_user_id,
            board_id,
            Permission.MANAGE_MEMBERS,
        ):
            raise ForbiddenError("You do not have permission to remove members")

        member = db.session.get(BoardMember, member_id)

        if not member or str(member.board_id) != str(board_id):
            raise NotFoundError("Member not found")

        if member.role == BoardRole.OWNER:
            raise BadRequestError("Owner cannot be removed")

        db.session.delete(member)
        db.session.commit()