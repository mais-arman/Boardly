from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.schemas.assignee_schema import AddAssigneeSchema
from app.schemas.card_schema import CardResponseSchema
from app.services.assignee_service import AssigneeService
from app.utils.responses import success_response


assignee_bp = Blueprint("assignees", __name__)

add_assignee_schema = AddAssigneeSchema()
card_response_schema = CardResponseSchema()


@assignee_bp.post("/cards/<uuid:card_id>/assignees")
@jwt_required()
def add_assignee(card_id):
    data = add_assignee_schema.load(request.get_json(silent=True) or {})

    card = AssigneeService.add_assignee(
        get_jwt_identity(),
        card_id,
        data,
    )

    return success_response(
        data=card_response_schema.dump(card),
        message="Assignee added successfully",
    )


@assignee_bp.delete("/cards/<uuid:card_id>/assignees/<uuid:user_id>")
@jwt_required()
def remove_assignee(card_id, user_id):
    card = AssigneeService.remove_assignee(
        get_jwt_identity(),
        card_id,
        user_id,
    )

    return success_response(
        data=card_response_schema.dump(card),
        message="Assignee removed successfully",
    )