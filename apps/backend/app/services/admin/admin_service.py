import logging

from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.auth.user import User
from app.models.auth.user_role import UserRole
from app.models.boards.board import Board
from app.models.boards.board_member import BoardMember
from app.models.boards.invitation import BoardInvitation
from app.models.cards.card import Card
from app.models.cards.comment import Comment
from app.models.cards.card_assignee import card_assignees
from app.models.lists.board_list import BoardList
from app.services.realtime_service import RealtimeService
from app.utils.exceptions import NotFoundError, BadRequestError

logger = logging.getLogger(__name__)


class AdminService:
    @staticmethod
    def _attach_board_counts(board):
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
    def get_users():
        return User.query.order_by(User.created_at.desc()).all()

    @staticmethod
    def update_user_role(request_user_id, target_user_id, data):
        user = db.session.get(User, target_user_id)

        if not user:
            raise NotFoundError("User not found")

        if str(request_user_id) == str(target_user_id):
            raise BadRequestError("You cannot change your own role")

        user.role = UserRole(data["role"])
        db.session.commit()

        return user

    @staticmethod
    def delete_user(request_user_id, target_user_id):
        user = db.session.get(User, target_user_id)

        if not user:
            raise NotFoundError("User not found")

        if str(request_user_id) == str(target_user_id):
            raise BadRequestError("You cannot delete your own account from admin panel")

        try:
            owned_boards = Board.query.filter_by(owner_id=user.id).all()

            for board in owned_boards:
                db.session.delete(board)

            BoardMember.query.filter_by(user_id=user.id).delete(
                synchronize_session=False
            )

            BoardInvitation.query.filter_by(invited_by_id=user.id).delete(
                synchronize_session=False
            )

            Comment.query.filter_by(user_id=user.id).delete(
                synchronize_session=False
            )

            db.session.execute(
                card_assignees.delete().where(
                    card_assignees.c.user_id == user.id
                )
            )

            db.session.delete(user)
            db.session.commit()

        except SQLAlchemyError as error:
            db.session.rollback()
            logger.exception("Failed to delete user from admin panel")
            raise BadRequestError(f"Failed to delete user: {str(error)}")

    @staticmethod
    def get_boards():
        boards = Board.query.order_by(Board.created_at.desc()).all()

        return [
            AdminService._attach_board_counts(board)
            for board in boards
        ]

    @staticmethod
    def delete_board(board_id):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        try:
            db.session.delete(board)
            db.session.commit()

            RealtimeService.emit_board_event(
                board_id,
                "admin.board.deleted",
            )

        except SQLAlchemyError as error:
            db.session.rollback()
            logger.exception("Failed to delete board from admin panel")
            raise BadRequestError(f"Failed to delete board: {str(error)}")