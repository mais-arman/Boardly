from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.schemas.label_schema import (
    LabelCreateSchema,
    ApplyLabelSchema,
    LabelResponseSchema,
)
from app.schemas.card_schema import CardResponseSchema
from app.services.label_service import LabelService
from app.utils.responses import success_response


label_bp = Blueprint("labels", __name__)

label_create_schema = LabelCreateSchema()
apply_label_schema = ApplyLabelSchema()
label_response_schema = LabelResponseSchema()
labels_response_schema = LabelResponseSchema(many=True)
card_response_schema = CardResponseSchema()


@label_bp.get("/boards/<uuid:board_id>/labels")
@jwt_required()
def get_board_labels(board_id):
    labels = LabelService.get_board_labels(get_jwt_identity(), board_id)

    return success_response(
        data=labels_response_schema.dump(labels),
        message="Labels fetched successfully",
    )


@label_bp.post("/boards/<uuid:board_id>/labels")
@jwt_required()
def create_label(board_id):
    data = label_create_schema.load(request.get_json(silent=True) or {})

    label = LabelService.create_label(
        get_jwt_identity(),
        board_id,
        data,
    )

    return success_response(
        data=label_response_schema.dump(label),
        message="Label created successfully",
        status_code=201,
    )


@label_bp.post("/cards/<uuid:card_id>/labels")
@jwt_required()
def apply_label_to_card(card_id):
    data = apply_label_schema.load(request.get_json(silent=True) or {})

    card = LabelService.apply_label_to_card(
        get_jwt_identity(),
        card_id,
        data,
    )

    return success_response(
        data=card_response_schema.dump(card),
        message="Label applied successfully",
    )


@label_bp.delete("/cards/<uuid:card_id>/labels/<uuid:label_id>")
@jwt_required()
def remove_label_from_card(card_id, label_id):
    card = LabelService.remove_label_from_card(
        get_jwt_identity(),
        card_id,
        label_id,
    )

    return success_response(
        data=card_response_schema.dump(card),
        message="Label removed successfully",
    )