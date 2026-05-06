from app.models.board_role import Permission
from app.services.board_permission_service import BoardPermissionService


def can(user_id, board_id, permission: Permission):
    return BoardPermissionService.has_permission(
        user_id,
        board_id,
        permission,
    )


def can_view_board(user_id, board_id):
    return can(user_id, board_id, Permission.VIEW_BOARD)


def can_edit_board(user_id, board_id):
    return can(user_id, board_id, Permission.EDIT_BOARD)


def can_manage_members(user_id, board_id):
    return can(user_id, board_id, Permission.MANAGE_MEMBERS)


def can_create_list(user_id, board_id):
    return can(user_id, board_id, Permission.CREATE_LIST)


def can_create_card(user_id, board_id):
    return can(user_id, board_id, Permission.CREATE_CARD)


def can_move_card(user_id, board_id):
    return can(user_id, board_id, Permission.MOVE_CARD)


def can_delete_board(user_id, board_id):
    return can(user_id, board_id, Permission.DELETE_BOARD)