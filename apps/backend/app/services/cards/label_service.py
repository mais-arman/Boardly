from sqlalchemy.exc import IntegrityError
from app.extensions import db
from app.models.boards.board import Board
from app.models.cards.card import Card
from app.models.cards.label import Label
from app.services.realtime_service import RealtimeService
from app.utils.exceptions import (
    NotFoundError,
    ConflictError,
    BadRequestError,
)


class LabelService:
    @staticmethod
    def get_board_labels(board_id):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

        return Label.query.filter_by(board_id=board_id).all()

    @staticmethod
    def create_label(board_id, data):
        board = db.session.get(Board, board_id)

        if not board:
            raise NotFoundError("Board not found")

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

        RealtimeService.emit_board_event(board_id, "label.created")

        return label

    @staticmethod
    def apply_label_to_card(card_id, data):
        card = db.session.get(Card, card_id)

        if not card:
            raise NotFoundError("Card not found")

        board_id = card.list.board_id

        label = db.session.get(Label, data["label_id"])

        if not label:
            raise NotFoundError("Label not found")

        if str(label.board_id) != str(board_id):
            raise BadRequestError("Label does not belong to this card board")

        if label not in card.labels:
            card.labels.append(label)

        db.session.commit()

        RealtimeService.emit_board_event(board_id, "card.label.applied")

        return card

    @staticmethod
    def remove_label_from_card(card_id, label_id):
        card = db.session.get(Card, card_id)

        if not card:
            raise NotFoundError("Card not found")

        board_id = card.list.board_id

        label = db.session.get(Label, label_id)

        if not label:
            raise NotFoundError("Label not found")

        if label in card.labels:
            card.labels.remove(label)

        db.session.commit()

        RealtimeService.emit_board_event(board_id, "card.label.removed")

        return card