from marshmallow import Schema, fields

class AddAssigneeSchema(Schema):
    user_id = fields.UUID(required=True)