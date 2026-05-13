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


class MemberUserSchema(Schema):
    id = fields.UUID()
    name = fields.String()
    email = fields.Email()


class MemberResponseSchema(Schema):
    id = fields.UUID()
    board_id = fields.UUID()
    user_id = fields.UUID()
    role = fields.Function(lambda member: member.role.value)
    user = fields.Nested(MemberUserSchema)
    created_at = fields.DateTime()


class InvitationResponseSchema(Schema):
    id = fields.UUID()
    board_id = fields.UUID()
    invited_by_id = fields.UUID()
    email = fields.Email()
    role = fields.Function(lambda invitation: invitation.role.value)
    status = fields.Function(lambda invitation: invitation.status.value)
    expires_at = fields.DateTime()
    created_at = fields.DateTime()
    responded_at = fields.DateTime(allow_none=True)

    board_title = fields.Method("get_board_title")
    invited_by_name = fields.Method("get_invited_by_name")
    invited_by_email = fields.Method("get_invited_by_email")

    def get_board_title(self, invitation):
        return invitation.board.title if invitation.board else None

    def get_invited_by_name(self, invitation):
        return invitation.invited_by.name if invitation.invited_by else None

    def get_invited_by_email(self, invitation):
        return invitation.invited_by.email if invitation.invited_by else None