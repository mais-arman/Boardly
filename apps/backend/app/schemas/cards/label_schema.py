from marshmallow import Schema, fields, validate

class LabelCreateSchema(Schema):
    name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=80),
    )

    color = fields.String(
        required=True,
        validate=validate.Length(min=3, max=20),
    )


class ApplyLabelSchema(Schema):
    label_id = fields.UUID(required=True)


class LabelResponseSchema(Schema):
    id = fields.UUID()
    board_id = fields.UUID()
    name = fields.String()
    color = fields.String()
    created_at = fields.DateTime()