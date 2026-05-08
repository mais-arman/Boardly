from app.extensions import db
from app.models.card import Card
from app.models.board_list import BoardList
from app.models.board_role import Permission
from app.services.board_permission_service import BoardPermissionService
from app.utils.exceptions import ForbiddenError, NotFoundError, BadRequestError


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
    def get_list_cards(user_id, list_id):
        board_list = CardService._get_list_or_404(list_id)

        if not BoardPermissionService.has_permission(
            user_id,
            board_list.board_id,
            Permission.VIEW_BOARD,
        ):
            raise ForbiddenError("You do not have permission to view cards")

        return (
            Card.query
            .filter_by(list_id=list_id)
            .order_by(Card.position.asc(), Card.created_at.asc())
            .all()
        )

    @staticmethod
    def get_card(user_id, card_id):
        card = CardService._get_card_or_404(card_id)

        if not BoardPermissionService.has_permission(
            user_id,
            card.list.board_id,
            Permission.VIEW_BOARD,
        ):
            raise ForbiddenError("You do not have permission to view this card")

        return card

    @staticmethod
    def create_card(user_id, list_id, data):
        board_list = CardService._get_list_or_404(list_id)

        if not BoardPermissionService.has_permission(
            user_id,
            board_list.board_id,
            Permission.CREATE_CARD,
        ):
            raise ForbiddenError("You do not have permission to create cards")

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
            position=next_position,
        )

        db.session.add(card)
        db.session.commit()

        return card

    @staticmethod
    def update_card(user_id, card_id, data):
        card = CardService._get_card_or_404(card_id)

        if not BoardPermissionService.has_permission(
            user_id,
            card.list.board_id,
            Permission.CREATE_CARD,
        ):
            raise ForbiddenError("You do not have permission to update cards")

        if "title" in data:
            card.title = data["title"].strip()

        if "description" in data:
            card.description = data["description"]

        db.session.commit()

        return card

    @staticmethod
    def delete_card(user_id, card_id):
        card = CardService._get_card_or_404(card_id)
        source_list_id = card.list_id

        if not BoardPermissionService.has_permission(
            user_id,
            card.list.board_id,
            Permission.CREATE_CARD,
        ):
            raise ForbiddenError("You do not have permission to delete cards")

        db.session.delete(card)
        db.session.flush()

        CardService._normalize_positions(source_list_id)

        db.session.commit()

    @staticmethod
    def move_card(user_id, card_id, data):
        card = CardService._get_card_or_404(card_id)

        source_list = card.list
        target_list = CardService._get_list_or_404(data["target_list_id"])

        if str(source_list.board_id) != str(target_list.board_id):
            raise BadRequestError("Card can only be moved within the same board")

        if not BoardPermissionService.has_permission(
            user_id,
            source_list.board_id,
            Permission.MOVE_CARD,
        ):
            raise ForbiddenError("You do not have permission to move cards")

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