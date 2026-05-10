from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.constants.routes import (
    BOARD_LISTS,
    BOARD_LISTS_REORDER,
    LIST_BY_ID,
)
from app.models.boards.board_role import Permission
from app.schemas.lists.list_schema import (
    ListCreateSchema,
    ListUpdateSchema,
    ListReorderSchema,
    ListResponseSchema,
)
from app.services.lists.list_service import ListService
from app.utils.permission_decorators import board_permission
from app.utils.responses import success_response


list_bp = Blueprint("lists", __name__)

list_create_schema = ListCreateSchema()
list_update_schema = ListUpdateSchema()
list_reorder_schema = ListReorderSchema()
list_response_schema = ListResponseSchema()
lists_response_schema = ListResponseSchema(many=True)


@list_bp.get(BOARD_LISTS)
@jwt_required()
@board_permission(Permission.VIEW_BOARD)
def get_board_lists(board_id):
    lists = ListService.get_board_lists(board_id)

    return success_response(
        data=lists_response_schema.dump(lists),
        message="Lists fetched successfully",
    )


@list_bp.post(BOARD_LISTS)
@jwt_required()
@board_permission(Permission.CREATE_LIST)
def create_list(board_id):
    data = list_create_schema.load(request.get_json(silent=True) or {})
    board_list = ListService.create_list(board_id, data)

    return success_response(
        data=list_response_schema.dump(board_list),
        message="List created successfully",
        status_code=201,
    )


@list_bp.get(LIST_BY_ID)
@jwt_required()
@board_permission(Permission.VIEW_BOARD)
def get_list(list_id):
    board_list = ListService.get_list(list_id)

    return success_response(
        data=list_response_schema.dump(board_list),
        message="List fetched successfully",
    )


@list_bp.patch(LIST_BY_ID)
@jwt_required()
@board_permission(Permission.CREATE_LIST)
def update_list(list_id):
    data = list_update_schema.load(request.get_json(silent=True) or {})
    board_list = ListService.update_list(list_id, data)

    return success_response(
        data=list_response_schema.dump(board_list),
        message="List updated successfully",
    )


@list_bp.delete(LIST_BY_ID)
@jwt_required()
@board_permission(Permission.CREATE_LIST)
def delete_list(list_id):
    ListService.delete_list(list_id)

    return success_response(
        data=None,
        message="List deleted successfully",
    )


@list_bp.patch(BOARD_LISTS_REORDER)
@jwt_required()
@board_permission(Permission.CREATE_LIST)
def reorder_lists(board_id):
    data = list_reorder_schema.load(request.get_json(silent=True) or {})
    lists = ListService.reorder_lists(board_id, data)

    return success_response(
        data=lists_response_schema.dump(lists),
        message="Lists reordered successfully",
    )