from sqlalchemy.exc import SQLAlchemyError
from app.extensions import db
from app.models.boards.board import Board
from app.models.boards.board_member import BoardMember
from app.models.boards.board_role import BoardRole
from app.utils.exceptions import NotFoundError, BadRequestError


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
        return (
            Board.query
            .join(BoardMember, BoardMember.board_id == Board.id)
            .filter(BoardMember.user_id == user_id)
            .all()
        )

    @staticmethod
    def get_board(board_id):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        return board

    @staticmethod
    def update_board(board_id, data):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if "title" in data:
            board.title = data["title"].strip()

        if "description" in data:
            board.description = data["description"]

        db.session.commit()

        return board

    @staticmethod
    def delete_board(board_id):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        db.session.delete(board)
        db.session.commit()