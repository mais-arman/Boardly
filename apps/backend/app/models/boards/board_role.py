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
    CREATE_CARD = "create_card"
    MOVE_CARD = "move_card"
    DELETE_BOARD = "delete_board"
    MANAGE_LABELS = "manage_labels"
    APPLY_LABELS = "apply_labels"
    COMMENT_CARD = "comment_card"
    ASSIGN_CARD = "assign_card"


PERMISSIONS = {
    Permission.VIEW_BOARD: {
        BoardRole.OWNER,
        BoardRole.ADMIN,
        BoardRole.EDITOR,
        BoardRole.VIEWER,
    },
    Permission.EDIT_BOARD: {
        BoardRole.OWNER,
        BoardRole.ADMIN,
    },
    Permission.MANAGE_MEMBERS: {
        BoardRole.OWNER,
        BoardRole.ADMIN,
    },
    Permission.CREATE_LIST: {
        BoardRole.OWNER,
        BoardRole.ADMIN,
        BoardRole.EDITOR,
    },
    Permission.CREATE_CARD: {
        BoardRole.OWNER,
        BoardRole.ADMIN,
        BoardRole.EDITOR,
    },
    Permission.MOVE_CARD: {
        BoardRole.OWNER,
        BoardRole.ADMIN,
        BoardRole.EDITOR,
    },
    Permission.DELETE_BOARD: {
        BoardRole.OWNER,
    },
    Permission.MANAGE_LABELS: {
        BoardRole.OWNER,
        BoardRole.ADMIN,
    },
    Permission.APPLY_LABELS: {
        BoardRole.OWNER,
        BoardRole.ADMIN,
        BoardRole.EDITOR,
    },
    Permission.COMMENT_CARD: {
        BoardRole.OWNER,
        BoardRole.ADMIN,
        BoardRole.EDITOR,
    },
    Permission.ASSIGN_CARD: {
        BoardRole.OWNER,
        BoardRole.ADMIN,
        BoardRole.EDITOR,
    },
}