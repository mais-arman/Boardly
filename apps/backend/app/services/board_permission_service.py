from app.extensions import db
from app.models.user import User
from app.models.user_role import UserRole
from app.models.board import Board
from app.models.board_member import BoardMember
from app.models.board_role import BoardRole, Permission, PERMISSIONS

class BoardPermissionService:

    @staticmethod
    def is_super_admin(user_id):
        user = db.session.get(User, user_id)
        return user is not None and user.role == UserRole.SUPER_ADMIN

    @staticmethod
    def get_user_role(user_id, board_id):
        if BoardPermissionService.is_super_admin(user_id):
            return BoardRole.OWNER

        membership_role = (
            db.session.query(BoardMember.role)
            .filter_by(board_id=board_id, user_id=user_id)
            .scalar()
        )

        if membership_role:
            return membership_role

        board = db.session.get(Board, board_id)

        if board and str(board.owner_id) == str(user_id):
            return BoardRole.OWNER

        return None

    @staticmethod
    def has_permission(user_id, board_id, permission: Permission):
        role = BoardPermissionService.get_user_role(user_id, board_id)

        if not role:
            return False

        allowed_roles = PERMISSIONS.get(permission, set())

        return role in allowed_roles