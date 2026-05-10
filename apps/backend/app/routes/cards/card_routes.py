from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.constants.routes import (
    LIST_CARDS,
    CARD_BY_ID,
    CARD_MOVE,
)
from app.models.boards.board_role import Permission
from app.schemas.cards.card_schema import (
    CardCreateSchema,
    CardUpdateSchema,
    CardMoveSchema,
    CardResponseSchema,
)
from app.services.cards.card_service import CardService
from app.utils.permission_decorators import board_permission
from app.utils.responses import success_response


card_bp = Blueprint("cards", __name__)

card_create_schema = CardCreateSchema()
card_update_schema = CardUpdateSchema()
card_move_schema = CardMoveSchema()
card_response_schema = CardResponseSchema()
cards_response_schema = CardResponseSchema(many=True)


@card_bp.get(LIST_CARDS)
@jwt_required()
@board_permission(Permission.VIEW_BOARD)
def get_list_cards(list_id):
    cards = CardService.get_list_cards(list_id)

    return success_response(
        data=cards_response_schema.dump(cards),
        message="Cards fetched successfully",
    )


@card_bp.post(LIST_CARDS)
@jwt_required()
@board_permission(Permission.CREATE_CARD)
def create_card(list_id):
    data = card_create_schema.load(request.get_json(silent=True) or {})
    card = CardService.create_card(list_id, data)

    return success_response(
        data=card_response_schema.dump(card),
        message="Card created successfully",
        status_code=201,
    )


@card_bp.get(CARD_BY_ID)
@jwt_required()
@board_permission(Permission.VIEW_BOARD)
def get_card(card_id):
    card = CardService.get_card(card_id)

    return success_response(
        data=card_response_schema.dump(card),
        message="Card fetched successfully",
    )


@card_bp.patch(CARD_BY_ID)
@jwt_required()
@board_permission(Permission.CREATE_CARD)
def update_card(card_id):
    data = card_update_schema.load(request.get_json(silent=True) or {})
    card = CardService.update_card(card_id, data)

    return success_response(
        data=card_response_schema.dump(card),
        message="Card updated successfully",
    )


@card_bp.delete(CARD_BY_ID)
@jwt_required()
@board_permission(Permission.CREATE_CARD)
def delete_card(card_id):
    CardService.delete_card(card_id)

    return success_response(
        data=None,
        message="Card deleted successfully",
    )


@card_bp.patch(CARD_MOVE)
@jwt_required()
@board_permission(Permission.MOVE_CARD)
def move_card(card_id):
    data = card_move_schema.load(request.get_json(silent=True) or {})
    card = CardService.move_card(card_id, data)

    return success_response(
        data=card_response_schema.dump(card),
        message="Card moved successfully",
    )