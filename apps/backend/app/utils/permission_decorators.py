from functools import wraps
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.boards.board import Board
from app.models.boards.board_member import BoardMember
from app.models.lists.board_list import BoardList
from app.models.cards.card import Card
from app.models.cards.comment import Comment
from app.models.cards.label import Label
from app.services.boards.board_permission_service import BoardPermissionService
from app.utils.exceptions import ForbiddenError, NotFoundError, BadRequestError


def _resolve_board_id_from_kwargs(kwargs):
    if "board_id" in kwargs:
        board = db.session.get(Board, kwargs["board_id"])

        if not board:
            raise NotFoundError("Board not found")

        return board.id

    if "list_id" in kwargs:
        board_list = db.session.get(BoardList, kwargs["list_id"])

        if not board_list:
            raise NotFoundError("List not found")

        return board_list.board_id

    if "card_id" in kwargs:
        card = db.session.get(Card, kwargs["card_id"])

        if not card:
            raise NotFoundError("Card not found")

        return card.list.board_id

    if "comment_id" in kwargs:
        comment = db.session.get(Comment, kwargs["comment_id"])

        if not comment:
            raise NotFoundError("Comment not found")

        return comment.card.list.board_id

    if "label_id" in kwargs:
        label = db.session.get(Label, kwargs["label_id"])

        if not label:
            raise NotFoundError("Label not found")

        return label.board_id

    if "member_id" in kwargs:
        member = db.session.get(BoardMember, kwargs["member_id"])

        if not member:
            raise NotFoundError("Member not found")

        return member.board_id

    raise BadRequestError("Cannot resolve board context for permission check")


def board_permission(permission):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            board_id = _resolve_board_id_from_kwargs(kwargs)

            if not BoardPermissionService.has_permission(
                user_id,
                board_id,
                permission,
            ):
                raise ForbiddenError(
                    "You do not have permission to perform this action"
                )

            return fn(*args, **kwargs)

        return wrapper

    return decorator