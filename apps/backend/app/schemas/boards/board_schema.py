from marshmallow import Schema, fields, validate


class BoardCreateSchema(Schema):
    title = fields.String(
        required=True,
        validate=validate.Length(min=2, max=160),
    )

    description = fields.String(
        required=False,
        allow_none=True,
        validate=validate.Length(max=2000),
    )

    background_color = fields.String(
        required=False,
        validate=validate.Length(min=3, max=20),
    )


class BoardUpdateSchema(Schema):
    title = fields.String(
        required=False,
        validate=validate.Length(min=2, max=160),
    )

    description = fields.String(
        required=False,
        allow_none=True,
        validate=validate.Length(max=2000),
    )

    background_color = fields.String(
        required=False,
        validate=validate.Length(min=3, max=20),
    )


class BoardResponseSchema(Schema):
    id = fields.UUID()
    title = fields.String()
    description = fields.String(allow_none=True)
    background_color = fields.String()
    owner_id = fields.UUID()
    role = fields.Method("get_role")
    members_count = fields.Method("get_members_count")
    lists_count = fields.Method("get_lists_count")
    cards_count = fields.Method("get_cards_count")
    created_at = fields.DateTime()
    updated_at = fields.DateTime()

    def get_role(self, board):
        role = getattr(board, "current_user_role", None)
        return role.value if role else None

    def get_members_count(self, board):
        return getattr(board, "members_count", 0)

    def get_lists_count(self, board):
        return getattr(board, "lists_count", 0)

    def get_cards_count(self, board):
        return getattr(board, "cards_count", 0)