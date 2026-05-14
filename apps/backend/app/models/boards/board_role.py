from enum import Enum

class BoardRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"


class Permission(str, Enum):
    VIEW_BOARD = "view_board"
    EDIT_BOARD = "edit_board"
    MANAGE_MEMBERS = "manage_members"

    CREATE_LIST = "create_list"
    MANAGE_LISTS = "manage_lists"

    CREATE_CARD = "create_card"
    EDIT_CARD = "edit_card"
    DELETE_CARD = "delete_card"
    MOVE_CARD = "move_card"

    DELETE_BOARD = "delete_board"

    MANAGE_LABELS = "manage_labels"
    APPLY_LABELS = "apply_labels"
    COMMENT_CARD = "comment_card"
    ASSIGN_CARD = "assign_card"


OWNER_ADMIN_EDITOR = {
    BoardRole.OWNER,
    BoardRole.ADMIN,
    BoardRole.EDITOR,
}

OWNER_ADMIN = {
    BoardRole.OWNER,
    BoardRole.ADMIN,
}

ALL_BOARD_ROLES = {
    BoardRole.OWNER,
    BoardRole.ADMIN,
    BoardRole.EDITOR,
    BoardRole.VIEWER,
}


PERMISSIONS = {
    Permission.VIEW_BOARD: ALL_BOARD_ROLES,

    Permission.EDIT_BOARD: OWNER_ADMIN,
    Permission.MANAGE_MEMBERS: OWNER_ADMIN,

    Permission.CREATE_LIST: OWNER_ADMIN_EDITOR,
    Permission.MANAGE_LISTS: OWNER_ADMIN_EDITOR,

    Permission.CREATE_CARD: OWNER_ADMIN_EDITOR,
    Permission.EDIT_CARD: OWNER_ADMIN_EDITOR,
    Permission.DELETE_CARD: OWNER_ADMIN_EDITOR,
    Permission.MOVE_CARD: OWNER_ADMIN_EDITOR,

    Permission.DELETE_BOARD: {BoardRole.OWNER},

    Permission.MANAGE_LABELS: OWNER_ADMIN,
    Permission.APPLY_LABELS: OWNER_ADMIN_EDITOR,
    Permission.COMMENT_CARD: OWNER_ADMIN_EDITOR,
    Permission.ASSIGN_CARD: OWNER_ADMIN_EDITOR,
}