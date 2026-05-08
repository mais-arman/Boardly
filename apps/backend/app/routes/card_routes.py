from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.schemas.card_schema import (
    CardCreateSchema,
    CardUpdateSchema,
    CardMoveSchema,
    CardResponseSchema,
)
from app.services.card_service import CardService
from app.utils.responses import success_response


card_bp = Blueprint("cards", __name__)

card_create_schema = CardCreateSchema()
card_update_schema = CardUpdateSchema()
card_move_schema = CardMoveSchema()
card_response_schema = CardResponseSchema()
cards_response_schema = CardResponseSchema(many=True)


@card_bp.get("/lists/<uuid:list_id>/cards")
@jwt_required()
def get_list_cards(list_id):
    cards = CardService.get_list_cards(get_jwt_identity(), list_id)

    return success_response(
        data=cards_response_schema.dump(cards),
        message="Cards fetched successfully",
    )


@card_bp.post("/lists/<uuid:list_id>/cards")
@jwt_required()
def create_card(list_id):
    data = card_create_schema.load(request.get_json(silent=True) or {})

    card = CardService.create_card(
        get_jwt_identity(),
        list_id,
        data,
    )

    return success_response(
        data=card_response_schema.dump(card),
        message="Card created successfully",
        status_code=201,
    )


@card_bp.get("/cards/<uuid:card_id>")
@jwt_required()
def get_card(card_id):
    card = CardService.get_card(get_jwt_identity(), card_id)

    return success_response(
        data=card_response_schema.dump(card),
        message="Card fetched successfully",
    )


@card_bp.patch("/cards/<uuid:card_id>")
@jwt_required()
def update_card(card_id):
    data = card_update_schema.load(request.get_json(silent=True) or {})

    card = CardService.update_card(
        get_jwt_identity(),
        card_id,
        data,
    )

    return success_response(
        data=card_response_schema.dump(card),
        message="Card updated successfully",
    )


@card_bp.delete("/cards/<uuid:card_id>")
@jwt_required()
def delete_card(card_id):
    CardService.delete_card(get_jwt_identity(), card_id)

    return success_response(
        data=None,
        message="Card deleted successfully",
    )


@card_bp.patch("/cards/<uuid:card_id>/move")
@jwt_required()
def move_card(card_id):
    data = card_move_schema.load(request.get_json(silent=True) or {})

    card = CardService.move_card(
        get_jwt_identity(),
        card_id,
        data,
    )

    return success_response(
        data=card_response_schema.dump(card),
        message="Card moved successfully",
    )