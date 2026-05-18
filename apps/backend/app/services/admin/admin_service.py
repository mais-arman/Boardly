import logging
import math
from sqlalchemy import or_
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
    USER_SORT_COLUMNS = {
        "name": User.name,
        "email": User.email,
        "role": User.role,
        "is_email_verified": User.is_email_verified,
        "created_at": User.created_at,
        "updated_at": User.updated_at,
    }

    BOARD_SORT_COLUMNS = {
        "title": Board.title,
        "owner_name": User.name,
        "owner_email": User.email,
        "members_count": Board.created_at,
        "lists_count": Board.created_at,
        "cards_count": Board.created_at,
        "created_at": Board.created_at,
        "updated_at": Board.updated_at,
    }

    @staticmethod
    def _paginate(query, page, limit):
        total = query.count()
        total_pages = max(1, math.ceil(total / limit)) if total else 1

        items = (
            query
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )

        return {
            "items": items,
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages,
        }

    @staticmethod
    def _apply_sort(query, sort_column, order):
        if order == "asc":
            return query.order_by(sort_column.asc())

        return query.order_by(sort_column.desc())

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
    def get_users(params):
        page = params["page"]
        limit = params["limit"]
        search = params.get("search", "").strip()
        sort_by = params.get("sortBy", "created_at")
        order = params.get("order", "desc")

        query = User.query

        if search:
            search_pattern = f"%{search}%"

            query = query.filter(
                or_(
                    User.name.ilike(search_pattern),
                    User.email.ilike(search_pattern),
                )
            )

        sort_column = AdminService.USER_SORT_COLUMNS.get(
            sort_by,
            User.created_at,
        )

        query = AdminService._apply_sort(query, sort_column, order)

        return AdminService._paginate(query, page, limit)

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
    def get_boards(params):
        page = params["page"]
        limit = params["limit"]
        search = params.get("search", "").strip()
        sort_by = params.get("sortBy", "created_at")
        order = params.get("order", "desc")

        query = Board.query.outerjoin(User, Board.owner_id == User.id)

        if search:
            search_pattern = f"%{search}%"

            query = query.filter(
                or_(
                    Board.title.ilike(search_pattern),
                    User.name.ilike(search_pattern),
                    User.email.ilike(search_pattern),
                )
            )

        sort_column = AdminService.BOARD_SORT_COLUMNS.get(
            sort_by,
            Board.created_at,
        )

        query = AdminService._apply_sort(query, sort_column, order)

        paginated = AdminService._paginate(query, page, limit)

        paginated["items"] = [
            AdminService._attach_board_counts(board)
            for board in paginated["items"]
        ]

        return paginated

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