from app.extensions import db
from app.models.cards.card import Card
from app.models.lists.board_list import BoardList
from app.utils.exceptions import NotFoundError, BadRequestError


class CardService:

    @staticmethod
    def _get_list_or_404(list_id):
        board_list = db.session.get(BoardList, list_id)

        if not board_list:
            raise NotFoundError("List not found")

        return board_list

    @staticmethod
    def _get_card_or_404(card_id):
        card = db.session.get(Card, card_id)

        if not card:
            raise NotFoundError("Card not found")

        return card

    @staticmethod
    def _normalize_positions(list_id):
        cards = (
            Card.query
            .filter_by(list_id=list_id)
            .order_by(Card.position.asc(), Card.created_at.asc())
            .all()
        )

        for index, card in enumerate(cards):
            card.position = index

    @staticmethod
    def get_list_cards(list_id):
        CardService._get_list_or_404(list_id)

        return (
            Card.query
            .filter_by(list_id=list_id)
            .order_by(Card.position.asc(), Card.created_at.asc())
            .all()
        )

    @staticmethod
    def get_card(card_id):
        return CardService._get_card_or_404(card_id)

    @staticmethod
    def create_card(list_id, data):
        CardService._get_list_or_404(list_id)

        max_position = (
            db.session.query(db.func.max(Card.position))
            .filter_by(list_id=list_id)
            .scalar()
        )

        next_position = 0 if max_position is None else max_position + 1

        card = Card(
            list_id=list_id,
            title=data["title"].strip(),
            description=data.get("description"),
            due_date=data.get("due_date"),
            position=next_position,
        )

        db.session.add(card)
        db.session.commit()

        return card

    @staticmethod
    def update_card(card_id, data):
        card = CardService._get_card_or_404(card_id)

        if "title" in data:
            card.title = data["title"].strip()

        if "description" in data:
            card.description = data["description"]

        if "due_date" in data:
            card.due_date = data["due_date"]

        db.session.commit()

        return card

    @staticmethod
    def delete_card(card_id):
        card = CardService._get_card_or_404(card_id)
        source_list_id = card.list_id

        db.session.delete(card)
        db.session.flush()

        CardService._normalize_positions(source_list_id)

        db.session.commit()

    @staticmethod
    def move_card(card_id, data):
        card = CardService._get_card_or_404(card_id)

        source_list = card.list
        target_list = CardService._get_list_or_404(data["target_list_id"])

        if str(source_list.board_id) != str(target_list.board_id):
            raise BadRequestError("Card can only be moved within the same board")

        source_list_id = card.list_id
        target_list_id = target_list.id
        target_position = data["position"]

        target_cards = (
            Card.query
            .filter_by(list_id=target_list_id)
            .order_by(Card.position.asc(), Card.created_at.asc())
            .all()
        )

        if str(source_list_id) == str(target_list_id):
            target_cards = [
                existing_card
                for existing_card in target_cards
                if existing_card.id != card.id
            ]

        if target_position > len(target_cards):
            target_position = len(target_cards)

        target_cards.insert(target_position, card)

        for index, existing_card in enumerate(target_cards):
            existing_card.list_id = target_list_id
            existing_card.position = index

        if str(source_list_id) != str(target_list_id):
            CardService._normalize_positions(source_list_id)

        db.session.commit()

        return card