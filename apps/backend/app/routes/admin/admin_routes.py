from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.constants.routes import (
    ADMIN_USERS,
    ADMIN_USER_BY_ID,
    ADMIN_BOARDS,
    ADMIN_BOARD_BY_ID,
)
from app.schemas.admin.admin_schema import (
    AdminPaginationQuerySchema,
    AdminUserResponseSchema,
    AdminUserUpdateRoleSchema,
    AdminBoardResponseSchema,
)
from app.services.admin.admin_service import AdminService
from app.utils.admin_decorators import super_admin_required
from app.utils.responses import success_response


admin_bp = Blueprint("admin", __name__)

admin_pagination_query_schema = AdminPaginationQuerySchema()

admin_user_response_schema = AdminUserResponseSchema()
admin_users_response_schema = AdminUserResponseSchema(many=True)
admin_user_update_role_schema = AdminUserUpdateRoleSchema()

admin_board_response_schema = AdminBoardResponseSchema()
admin_boards_response_schema = AdminBoardResponseSchema(many=True)


def build_paginated_response(paginated_result, schema):
    return {
        "items": schema.dump(paginated_result["items"]),
        "page": paginated_result["page"],
        "limit": paginated_result["limit"],
        "total": paginated_result["total"],
        "total_pages": paginated_result["total_pages"],
    }


@admin_bp.get(ADMIN_USERS)
@jwt_required()
@super_admin_required
def get_users():
    params = admin_pagination_query_schema.load(request.args)

    paginated_users = AdminService.get_users(params)

    return success_response(
        data=build_paginated_response(
            paginated_users,
            admin_users_response_schema,
        ),
        message="Users fetched successfully",
    )


@admin_bp.patch(ADMIN_USER_BY_ID)
@jwt_required()
@super_admin_required
def update_user_role(user_id):
    data = admin_user_update_role_schema.load(request.get_json(silent=True) or {})

    user = AdminService.update_user_role(
        get_jwt_identity(),
        user_id,
        data,
    )

    return success_response(
        data=admin_user_response_schema.dump(user),
        message="User role updated successfully",
    )


@admin_bp.delete(ADMIN_USER_BY_ID)
@jwt_required()
@super_admin_required
def delete_user(user_id):
    AdminService.delete_user(get_jwt_identity(), user_id)

    return success_response(
        data=None,
        message="User deleted successfully",
    )


@admin_bp.get(ADMIN_BOARDS)
@jwt_required()
@super_admin_required
def get_boards():
    params = admin_pagination_query_schema.load(request.args)

    paginated_boards = AdminService.get_boards(params)

    return success_response(
        data=build_paginated_response(
            paginated_boards,
            admin_boards_response_schema,
        ),
        message="Boards fetched successfully",
    )


@admin_bp.delete(ADMIN_BOARD_BY_ID)
@jwt_required()
@super_admin_required
def delete_board(board_id):
    AdminService.delete_board(board_id)

    return success_response(
        data=None,
        message="Board deleted successfully",
    )