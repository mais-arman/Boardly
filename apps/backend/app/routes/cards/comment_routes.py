from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.constants.routes import (
    CARD_COMMENTS,
    COMMENT_BY_ID,
)
from app.models.boards.board_role import Permission
from app.schemas.cards.comment_schema import (
    CommentCreateSchema,
    CommentResponseSchema,
)
from app.services.cards.comment_service import CommentService
from app.utils.permission_decorators import board_permission
from app.utils.responses import success_response


comment_bp = Blueprint("comments", __name__)

comment_create_schema = CommentCreateSchema()
comment_response_schema = CommentResponseSchema()
comments_response_schema = CommentResponseSchema(many=True)


@comment_bp.get(CARD_COMMENTS)
@jwt_required()
@board_permission(Permission.VIEW_BOARD)
def get_card_comments(card_id):
    comments = CommentService.get_card_comments(card_id)

    return success_response(
        data=comments_response_schema.dump(comments),
        message="Comments fetched successfully",
    )


@comment_bp.post(CARD_COMMENTS)
@jwt_required()
@board_permission(Permission.COMMENT_CARD)
def create_comment(card_id):
    data = comment_create_schema.load(request.get_json(silent=True) or {})

    comment = CommentService.create_comment(
        get_jwt_identity(),
        card_id,
        data,
    )

    return success_response(
        data=comment_response_schema.dump(comment),
        message="Comment created successfully",
        status_code=201,
    )


@comment_bp.delete(COMMENT_BY_ID)
@jwt_required()
def delete_comment(comment_id):
    CommentService.delete_comment(
        get_jwt_identity(),
        comment_id,
    )

    return success_response(
        data=None,
        message="Comment deleted successfully",
    )