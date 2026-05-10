from marshmallow import Schema, fields, validate
from app.models.boards.board_role import BoardRole

class InviteMemberSchema(Schema):
    email = fields.Email(required=True)

    role = fields.String(
        required=True,
        validate=validate.OneOf([
            BoardRole.ADMIN.value,
            BoardRole.EDITOR.value,
            BoardRole.VIEWER.value,
        ]),
    )

class UpdateMemberRoleSchema(Schema):
    role = fields.String(
        required=True,
        validate=validate.OneOf([
            BoardRole.ADMIN.value,
            BoardRole.EDITOR.value,
            BoardRole.VIEWER.value,
        ]),
    )


class MemberResponseSchema(Schema):
    id = fields.UUID()
    board_id = fields.UUID()
    user_id = fields.UUID()
    role = fields.Function(lambda member: member.role.value)
    created_at = fields.DateTime()


class InvitationResponseSchema(Schema):
    id = fields.UUID()
    token = fields.UUID()
    board_id = fields.UUID()
    invited_by_id = fields.UUID()
    email = fields.Email()
    role = fields.Function(lambda invitation: invitation.role.value)
    status = fields.Function(lambda invitation: invitation.status.value)
    expires_at = fields.DateTime()
    created_at = fields.DateTime()
    responded_at = fields.DateTime(allow_none=True)