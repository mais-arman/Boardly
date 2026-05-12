from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.constants.routes import (
    MY_INVITATIONS,
    INVITATION_PREVIEW,
    INVITATION_ACCEPT,
    INVITATION_DECLINE,
)
from app.constants.messages import Messages
from app.schemas.boards.member_schema import (
    InvitationResponseSchema,
    MemberResponseSchema,
)
from app.services.boards.invitation_service import InvitationService
from app.utils.responses import success_response


invitation_bp = Blueprint("invitations", __name__)

invitation_response_schema = InvitationResponseSchema()
invitations_response_schema = InvitationResponseSchema(many=True)
member_response_schema = MemberResponseSchema()


@invitation_bp.get(INVITATION_PREVIEW)
def preview_invitation(token):
    invitation = InvitationService.get_invitation_by_token(token)

    return success_response(
        data=invitation_response_schema.dump(invitation),
        message=Messages.INVITATION_FETCHED,
    )


@invitation_bp.get(MY_INVITATIONS)
@jwt_required()
def get_my_invitations():
    invitations = InvitationService.get_my_invitations(get_jwt_identity())

    return success_response(
        data=invitations_response_schema.dump(invitations),
        message=Messages.INVITATIONS_FETCHED,
    )


@invitation_bp.post(INVITATION_ACCEPT)
@jwt_required()
def accept_invitation(token):
    member = InvitationService.accept_invitation(
        get_jwt_identity(),
        token,
    )

    return success_response(
        data=member_response_schema.dump(member),
        message=Messages.INVITATION_ACCEPTED,
    )


@invitation_bp.post(INVITATION_DECLINE)
@jwt_required()
def decline_invitation(token):
    invitation = InvitationService.decline_invitation(
        get_jwt_identity(),
        token,
    )

    return success_response(
        data=invitation_response_schema.dump(invitation),
        message=Messages.INVITATION_DECLINED,
    )