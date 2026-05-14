from marshmallow import Schema, fields, validate


class SignupSchema(Schema):
    name = fields.String(
        required=True,
        validate=validate.Length(min=2, max=120),
    )

    email = fields.Email(required=True)

    password = fields.String(
        required=True,
        load_only=True,
        validate=validate.Length(min=8, max=128),
    )


class LoginSchema(Schema):
    email = fields.Email(required=True)

    password = fields.String(
        required=True,
        load_only=True,
        validate=validate.Length(min=8, max=128),
    )


class ProfileUpdateSchema(Schema):
    name = fields.String(
        required=False,
        validate=validate.Length(min=2, max=120),
    )


class UserResponseSchema(Schema):
    id = fields.UUID()
    name = fields.String()
    email = fields.Email()
    role = fields.Function(lambda user: user.role.value)
    is_email_verified = fields.Boolean()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()