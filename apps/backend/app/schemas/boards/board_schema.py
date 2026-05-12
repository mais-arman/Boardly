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


class BoardResponseSchema(Schema):
    id = fields.UUID()
    title = fields.String()
    description = fields.String(allow_none=True)
    owner_id = fields.UUID()
    role = fields.String(allow_none=True)
    members_count = fields.Integer()
    lists_count = fields.Integer()
    cards_count = fields.Integer()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()