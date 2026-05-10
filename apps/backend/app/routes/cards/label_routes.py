from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.constants.routes import (
    BOARD_LABELS,
    CARD_LABELS,
    CARD_LABEL_BY_ID,
)
from app.models.boards.board_role import Permission
from app.schemas.cards.label_schema import (
    LabelCreateSchema,
    ApplyLabelSchema,
    LabelResponseSchema,
)
from app.schemas.cards.card_schema import CardResponseSchema
from app.services.cards.label_service import LabelService
from app.utils.permission_decorators import board_permission
from app.utils.responses import success_response


label_bp = Blueprint("labels", __name__)

label_create_schema = LabelCreateSchema()
apply_label_schema = ApplyLabelSchema()
label_response_schema = LabelResponseSchema()
labels_response_schema = LabelResponseSchema(many=True)
card_response_schema = CardResponseSchema()


@label_bp.get(BOARD_LABELS)
@jwt_required()
@board_permission(Permission.VIEW_BOARD)
def get_board_labels(board_id):
    labels = LabelService.get_board_labels(board_id)

    return success_response(
        data=labels_response_schema.dump(labels),
        message="Labels fetched successfully",
    )


@label_bp.post(BOARD_LABELS)
@jwt_required()
@board_permission(Permission.MANAGE_LABELS)
def create_label(board_id):
    data = label_create_schema.load(request.get_json(silent=True) or {})
    label = LabelService.create_label(board_id, data)

    return success_response(
        data=label_response_schema.dump(label),
        message="Label created successfully",
        status_code=201,
    )


@label_bp.post(CARD_LABELS)
@jwt_required()
@board_permission(Permission.APPLY_LABELS)
def apply_label_to_card(card_id):
    data = apply_label_schema.load(request.get_json(silent=True) or {})
    card = LabelService.apply_label_to_card(card_id, data)

    return success_response(
        data=card_response_schema.dump(card),
        message="Label applied successfully",
    )


@label_bp.delete(CARD_LABEL_BY_ID)
@jwt_required()
@board_permission(Permission.APPLY_LABELS)
def remove_label_from_card(card_id, label_id):
    card = LabelService.remove_label_from_card(card_id, label_id)

    return success_response(
        data=card_response_schema.dump(card),
        message="Label removed successfully",
    )