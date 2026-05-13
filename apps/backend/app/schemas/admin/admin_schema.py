from marshmallow import Schema, fields, validate
from app.models.auth.user_role import UserRole


class AdminUserUpdateRoleSchema(Schema):
    role = fields.String(
        required=True,
        validate=validate.OneOf([
            UserRole.USER.value,
            UserRole.SUPER_ADMIN.value,
        ]),
    )


class AdminUserResponseSchema(Schema):
    id = fields.UUID()
    name = fields.String()
    email = fields.Email()
    role = fields.Function(lambda user: user.role.value)
    is_email_verified = fields.Boolean()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()


class AdminBoardResponseSchema(Schema):
    id = fields.UUID()
    title = fields.String()
    description = fields.String(allow_none=True)
    background_color = fields.String()
    owner_id = fields.UUID()
    owner_name = fields.Method("get_owner_name")
    owner_email = fields.Method("get_owner_email")
    members_count = fields.Method("get_members_count")
    lists_count = fields.Method("get_lists_count")
    cards_count = fields.Method("get_cards_count")
    created_at = fields.DateTime()
    updated_at = fields.DateTime()

    def get_owner_name(self, board):
        return board.owner.name if board.owner else None

    def get_owner_email(self, board):
        return board.owner.email if board.owner else None

    def get_members_count(self, board):
        return getattr(board, "members_count", 0)

    def get_lists_count(self, board):
        return getattr(board, "lists_count", 0)

    def get_cards_count(self, board):
        return getattr(board, "cards_count", 0)