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

    due_date = fields.DateTime(
        required=False,
        allow_none=True,
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

    due_date = fields.DateTime(
        required=False,
        allow_none=True,
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
    due_date = fields.DateTime(allow_none=True)
    position = fields.Integer()
    labels = fields.Method("get_labels")
    assignees = fields.Method("get_assignees")
    created_at = fields.DateTime()
    updated_at = fields.DateTime()

    def get_labels(self, card):
        return [
            {
                "id": str(label.id),
                "board_id": str(label.board_id),
                "name": label.name,
                "color": label.color,
            }
            for label in card.labels
        ]

    def get_assignees(self, card):
        return [
            {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
            }
            for user in card.assignees
        ]