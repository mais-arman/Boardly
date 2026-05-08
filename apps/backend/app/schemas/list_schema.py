from marshmallow import Schema, fields, validate


class ListCreateSchema(Schema):
    title = fields.String(
        required=True,
        validate=validate.Length(min=2, max=160),
    )


class ListUpdateSchema(Schema):
    title = fields.String(
        required=True,
        validate=validate.Length(min=2, max=160),
    )


class ListReorderItemSchema(Schema):
    id = fields.UUID(required=True)
    position = fields.Integer(required=True, validate=validate.Range(min=0))


class ListReorderSchema(Schema):
    lists = fields.List(
        fields.Nested(ListReorderItemSchema),
        required=True,
        validate=validate.Length(min=1),
    )


class ListResponseSchema(Schema):
    id = fields.UUID()
    board_id = fields.UUID()
    title = fields.String()
    position = fields.Integer()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()