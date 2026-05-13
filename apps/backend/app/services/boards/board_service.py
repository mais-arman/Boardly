import logging
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import selectinload

from app.extensions import db
from app.models.boards.board import Board
from app.models.boards.board_member import BoardMember
from app.models.boards.board_role import BoardRole
from app.models.boards.invitation import BoardInvitation
from app.models.lists.board_list import BoardList
from app.models.cards.card import Card
from app.services.boards.board_permission_service import BoardPermissionService
from app.services.realtime_service import RealtimeService
from app.utils.exceptions import NotFoundError, BadRequestError

logger = logging.getLogger(__name__)


class BoardService:
    @staticmethod
    def _attach_board_metadata(board, user_id):
        board.current_user_role = BoardPermissionService.get_user_role(user_id, board.id)
        board.members_count = BoardMember.query.filter_by(board_id=board.id).count()
        board.lists_count = BoardList.query.filter_by(board_id=board.id).count()

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
            logger.exception("Failed to create board")
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

        return [BoardService._attach_board_metadata(board, user_id) for board in boards]

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
        board = (
            Board.query
            .options(
                selectinload(Board.lists).selectinload(BoardList.cards).selectinload(Card.comments),
                selectinload(Board.labels),
                selectinload(Board.invitations),
                selectinload(Board.members),
            )
            .filter(Board.id == board_id)
            .first()
        )

        if not board:
            raise NotFoundError("Board not found")

        try:
            for board_list in list(board.lists):
                for card in list(board_list.cards):
                    card.assignees.clear()
                    card.labels.clear()
                    db.session.delete(card)

                db.session.delete(board_list)

            for label in list(board.labels):
                db.session.delete(label)

            for invitation in list(board.invitations):
                db.session.delete(invitation)

            for member in list(board.members):
                db.session.delete(member)

            db.session.delete(board)
            db.session.commit()

            RealtimeService.emit_board_event(board_id, "board.deleted")

        except Exception as error:
            db.session.rollback()
            logger.exception("Failed to delete board: %s", board_id)
            raise BadRequestError(f"Failed to delete board: {str(error)}")