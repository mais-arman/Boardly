from marshmallow import Schema, fields, validate

class CommentCreateSchema(Schema):
    content = fields.String(
        required=True,
        validate=validate.Length(min=1, max=3000),
    )


class CommentUserSchema(Schema):
    id = fields.UUID()
    name = fields.String()
    email = fields.Email()


class CommentResponseSchema(Schema):
    id = fields.UUID()
    card_id = fields.UUID()
    user_id = fields.UUID()
    user = fields.Nested(CommentUserSchema)
    content = fields.String()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()