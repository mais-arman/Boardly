from sqlalchemy.exc import SQLAlchemyError
from app.extensions import db
from app.models.board import Board
from app.models.board_member import BoardMember
from app.models.board_role import BoardRole, Permission
from app.services.board_permission_service import BoardPermissionService
from app.utils.exceptions import ForbiddenError, NotFoundError, BadRequestError


class BoardService:

    @staticmethod
    def create_board(user_id, data):
        board = Board(
            title=data["title"].strip(),
            description=data.get("description"),
            owner_id=user_id,
        )

        owner_membership = BoardMember(
            board=board,
            user_id=user_id,
            role=BoardRole.OWNER,
        )

        try:
            db.session.add(board)
            db.session.add(owner_membership)
            db.session.commit()
        except SQLAlchemyError:
            db.session.rollback()
            raise BadRequestError("Failed to create board")

        return board

    @staticmethod
    def get_user_boards(user_id):
        boards = (
            Board.query
            .join(BoardMember, BoardMember.board_id == Board.id)
            .filter(BoardMember.user_id == user_id)
            .all()
        )

        return boards

    @staticmethod
    def get_board(user_id, board_id):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if not BoardPermissionService.has_permission(
            user_id,
            board_id,
            Permission.VIEW_BOARD,
        ):
            raise ForbiddenError("You do not have permission to view this board")

        return board

    @staticmethod
    def update_board(user_id, board_id, data):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if not BoardPermissionService.has_permission(
            user_id,
            board_id,
            Permission.EDIT_BOARD,
        ):
            raise ForbiddenError("You do not have permission to edit this board")

        if "title" in data:
            board.title = data["title"].strip()

        if "description" in data:
            board.description = data["description"]

        db.session.commit()

        return board

    @staticmethod
    def delete_board(user_id, board_id):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if not BoardPermissionService.has_permission(
            user_id,
            board_id,
            Permission.DELETE_BOARD,
        ):
            raise ForbiddenError("You do not have permission to delete this board")

        db.session.delete(board)
        db.session.commit()