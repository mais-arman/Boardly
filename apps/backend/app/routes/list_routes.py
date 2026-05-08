from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.schemas.list_schema import (
    ListCreateSchema,
    ListUpdateSchema,
    ListReorderSchema,
    ListResponseSchema,
)
from app.services.list_service import ListService
from app.utils.responses import success_response


list_bp = Blueprint("lists", __name__)

list_create_schema = ListCreateSchema()
list_update_schema = ListUpdateSchema()
list_reorder_schema = ListReorderSchema()
list_response_schema = ListResponseSchema()
lists_response_schema = ListResponseSchema(many=True)


@list_bp.get("/boards/<uuid:board_id>/lists")
@jwt_required()
def get_board_lists(board_id):
    lists = ListService.get_board_lists(get_jwt_identity(), board_id)

    return success_response(
        data=lists_response_schema.dump(lists),
        message="Lists fetched successfully",
    )


@list_bp.post("/boards/<uuid:board_id>/lists")
@jwt_required()
def create_list(board_id):
    data = list_create_schema.load(request.get_json(silent=True) or {})

    board_list = ListService.create_list(
        get_jwt_identity(),
        board_id,
        data,
    )

    return success_response(
        data=list_response_schema.dump(board_list),
        message="List created successfully",
        status_code=201,
    )


@list_bp.get("/lists/<uuid:list_id>")
@jwt_required()
def get_list(list_id):
    board_list = ListService.get_list(get_jwt_identity(), list_id)

    return success_response(
        data=list_response_schema.dump(board_list),
        message="List fetched successfully",
    )


@list_bp.patch("/lists/<uuid:list_id>")
@jwt_required()
def update_list(list_id):
    data = list_update_schema.load(request.get_json(silent=True) or {})

    board_list = ListService.update_list(
        get_jwt_identity(),
        list_id,
        data,
    )

    return success_response(
        data=list_response_schema.dump(board_list),
        message="List updated successfully",
    )


@list_bp.delete("/lists/<uuid:list_id>")
@jwt_required()
def delete_list(list_id):
    ListService.delete_list(get_jwt_identity(), list_id)

    return success_response(
        data=None,
        message="List deleted successfully",
    )


@list_bp.patch("/boards/<uuid:board_id>/lists/reorder")
@jwt_required()
def reorder_lists(board_id):
    data = list_reorder_schema.load(request.get_json(silent=True) or {})

    lists = ListService.reorder_lists(
        get_jwt_identity(),
        board_id,
        data,
    )

    return success_response(
        data=lists_response_schema.dump(lists),
        message="Lists reordered successfully",
    )