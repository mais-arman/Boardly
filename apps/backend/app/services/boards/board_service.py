from sqlalchemy.exc import SQLAlchemyError
from app.extensions import db
from app.models.boards.board import Board
from app.models.boards.board_member import BoardMember
from app.models.boards.board_role import BoardRole
from app.models.lists.board_list import BoardList
from app.models.cards.card import Card
from app.services.boards.board_permission_service import BoardPermissionService
from app.services.realtime_service import RealtimeService
from app.utils.exceptions import NotFoundError, BadRequestError


class BoardService:
    @staticmethod
    def _attach_board_metadata(board, user_id):
        board.current_user_role = BoardPermissionService.get_user_role(
            user_id,
            board.id,
        )

        board.members_count = BoardMember.query.filter_by(
            board_id=board.id,
        ).count()

        board.lists_count = BoardList.query.filter_by(
            board_id=board.id,
        ).count()

        board.cards_count = (
            db.session.query(Card)
            .join(BoardList, BoardList.id == Card.list_id)
            .filter(BoardList.board_id == board.id)
            .count()
        )

        return board

    @staticmethod
    def create_board(user_id, data):
        board = Board(
            title=data["title"].strip(),
            description=data.get("description"),
            background_color=data.get("background_color", "#0f4c81"),
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

        return BoardService._attach_board_metadata(board, user_id)

    @staticmethod
    def get_user_boards(user_id):
        boards = (
            Board.query
            .join(BoardMember, BoardMember.board_id == Board.id)
            .filter(BoardMember.user_id == user_id)
            .order_by(Board.created_at.desc())
            .all()
        )

        return [
            BoardService._attach_board_metadata(board, user_id)
            for board in boards
        ]

    @staticmethod
    def get_board(board_id, user_id):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        return BoardService._attach_board_metadata(board, user_id)

    @staticmethod
    def update_board(board_id, data, user_id=None):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if "title" in data:
            board.title = data["title"].strip()

        if "description" in data:
            board.description = data["description"]

        if "background_color" in data:
            board.background_color = data["background_color"]

        db.session.commit()

        RealtimeService.emit_board_event(board.id, "board.updated")

        if user_id:
            return BoardService._attach_board_metadata(board, user_id)

        return board

    @staticmethod
    def delete_board(board_id):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        try:
            db.session.delete(board)
            db.session.commit()

            RealtimeService.emit_board_event(board_id, "board.deleted")

        except SQLAlchemyError as error:
            db.session.rollback()
            raise BadRequestError(f"Failed to delete board: {str(error)}")