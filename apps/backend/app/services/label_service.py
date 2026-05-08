from sqlalchemy.exc import IntegrityError
from app.extensions import db
from app.models.board import Board
from app.models.card import Card
from app.models.label import Label
from app.models.board_role import Permission
from app.services.board_permission_service import BoardPermissionService
from app.utils.exceptions import (
    ForbiddenError,
    NotFoundError,
    ConflictError,
    BadRequestError,
)


class LabelService:

    @staticmethod
    def get_board_labels(user_id, board_id):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if not BoardPermissionService.has_permission(
            user_id,
            board_id,
            Permission.VIEW_BOARD,
        ):
            raise ForbiddenError("You do not have permission to view labels")

        return Label.query.filter_by(board_id=board_id).all()

    @staticmethod
    def create_label(user_id, board_id, data):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        if not BoardPermissionService.has_permission(
            user_id,
            board_id,
            Permission.MANAGE_LABELS,
        ):
            raise ForbiddenError("You do not have permission to create labels")

        label = Label(
            board_id=board_id,
            name=data["name"].strip(),
            color=data["color"].strip(),
        )

        try:
            db.session.add(label)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            raise ConflictError("Label already exists on this board")

        return label

    @staticmethod
    def apply_label_to_card(user_id, card_id, data):
        card = db.session.get(Card, card_id)

        if not card:
            raise NotFoundError("Card not found")

        board_id = card.list.board_id

        if not BoardPermissionService.has_permission(
            user_id,
            board_id,
            Permission.APPLY_LABELS,
        ):
            raise ForbiddenError("You do not have permission to apply labels")

        label = db.session.get(Label, data["label_id"])

        if not label:
            raise NotFoundError("Label not found")

        if str(label.board_id) != str(board_id):
            raise BadRequestError("Label does not belong to this card board")

        if label not in card.labels:
            card.labels.append(label)

        db.session.commit()

        return card

    @staticmethod
    def remove_label_from_card(user_id, card_id, label_id):
        card = db.session.get(Card, card_id)

        if not card:
            raise NotFoundError("Card not found")

        board_id = card.list.board_id

        if not BoardPermissionService.has_permission(
            user_id,
            board_id,
            Permission.APPLY_LABELS,
        ):
            raise ForbiddenError("You do not have permission to remove labels")

        label = db.session.get(Label, label_id)

        if not label:
            raise NotFoundError("Label not found")

        if label in card.labels:
            card.labels.remove(label)

        db.session.commit()

        return card