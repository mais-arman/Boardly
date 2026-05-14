from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.constants.routes import (
    CARD_ASSIGNEES,
    CARD_ASSIGNEE_BY_ID,
)
from app.models.boards.board_role import Permission
from app.schemas.cards.assignee_schema import AddAssigneeSchema
from app.schemas.cards.card_schema import CardResponseSchema
from app.services.cards.assignee_service import AssigneeService
from app.utils.permission_decorators import board_permission
from app.utils.responses import success_response


assignee_bp = Blueprint("assignees", __name__)

add_assignee_schema = AddAssigneeSchema()
card_response_schema = CardResponseSchema()


@assignee_bp.post(CARD_ASSIGNEES)
@jwt_required()
@board_permission(Permission.ASSIGN_CARD)
def add_assignee(card_id):
    data = add_assignee_schema.load(request.get_json(silent=True) or {})
    card = AssigneeService.add_assignee(card_id, data)

    return success_response(
        data=card_response_schema.dump(card),
        message="Assignee added successfully",
    )


@assignee_bp.delete(CARD_ASSIGNEE_BY_ID)
@jwt_required()
@board_permission(Permission.ASSIGN_CARD)
def remove_assignee(card_id, user_id):
    card = AssigneeService.remove_assignee(card_id, user_id)

    return success_response(
        data=card_response_schema.dump(card),
        message="Assignee removed successfully",
    )