from marshmallow import Schema, fields, validate


class CardCreateSchema(Schema):
    title = fields.String(
        required=True,
        validate=validate.Length(min=2, max=200),
    )

    description = fields.String(
        required=False,
        allow_none=True,
        validate=validate.Length(max=5000),
    )


class CardUpdateSchema(Schema):
    title = fields.String(
        required=False,
        validate=validate.Length(min=2, max=200),
    )

    description = fields.String(
        required=False,
        allow_none=True,
        validate=validate.Length(max=5000),
    )


class CardMoveSchema(Schema):
    target_list_id = fields.UUID(required=True)

    position = fields.Integer(
        required=True,
        validate=validate.Range(min=0),
    )


class CardResponseSchema(Schema):
    id = fields.UUID()
    list_id = fields.UUID()
    title = fields.String()
    description = fields.String(allow_none=True)
    position = fields.Integer()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()