from sqlalchemy.exc import SQLAlchemyError
from app.extensions import db
from app.models.boards.board import Board
from app.models.boards.board_member import BoardMember
from app.models.boards.board_role import BoardRole
from app.models.lists.board_list import BoardList
from app.models.cards.card import Card
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

        return BoardService.get_board_summary(board.id, user_id)

    @staticmethod
    def get_board_summary(board_id, user_id):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        member = BoardMember.query.filter_by(
            board_id=board_id,
            user_id=user_id,
        ).first()

        role = member.role.value if member else None

        members_count = BoardMember.query.filter_by(board_id=board_id).count()
        lists_count = BoardList.query.filter_by(board_id=board_id).count()

        cards_count = (
            db.session.query(Card.id)
            .join(BoardList, Card.list_id == BoardList.id)
            .filter(BoardList.board_id == board_id)
            .count()
        )

        return {
            "id": board.id,
            "title": board.title,
            "description": board.description,
            "owner_id": board.owner_id,
            "role": role,
            "members_count": members_count,
            "lists_count": lists_count,
            "cards_count": cards_count,
            "created_at": board.created_at,
            "updated_at": board.updated_at,
        }

    @staticmethod
    def get_user_boards(user_id):
        boards = (
            Board.query
            .join(BoardMember, BoardMember.board_id == Board.id)
            .filter(BoardMember.user_id == user_id)
            .order_by(Board.updated_at.desc())
            .all()
        )

        return [
            BoardService.get_board_summary(board.id, user_id)
            for board in boards
        ]

    @staticmethod
    def get_board(board_id, user_id=None):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if user_id:
            return BoardService.get_board_summary(board_id, user_id)

        return board

    @staticmethod
    def update_board(board_id, data, user_id=None):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if "title" in data:
            board.title = data["title"].strip()

        if "description" in data:
            board.description = data["description"]

        db.session.commit()

        if user_id:
            return BoardService.get_board_summary(board_id, user_id)

        return board

    @staticmethod
    def delete_board(board_id):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        db.session.delete(board)
        db.session.commit()