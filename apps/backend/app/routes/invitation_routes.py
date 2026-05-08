from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.schemas.member_schema import (
    InvitationResponseSchema,
    MemberResponseSchema,
)
from app.services.invitation_service import InvitationService
from app.utils.responses import success_response


invitation_bp = Blueprint("invitations", __name__)

invitation_response_schema = InvitationResponseSchema()
invitations_response_schema = InvitationResponseSchema(many=True)
member_response_schema = MemberResponseSchema()


@invitation_bp.get("/invitations/me")
@jwt_required()
def get_my_invitations():
    invitations = InvitationService.get_my_invitations(get_jwt_identity())

    return success_response(
        data=invitations_response_schema.dump(invitations),
        message="Invitations fetched successfully",
    )


@invitation_bp.post("/invitations/<uuid:invitation_id>/accept")
@jwt_required()
def accept_invitation(invitation_id):
    member = InvitationService.accept_invitation(
        get_jwt_identity(),
        invitation_id,
    )

    return success_response(
        data=member_response_schema.dump(member),
        message="Invitation accepted successfully",
    )


@invitation_bp.post("/invitations/<uuid:invitation_id>/decline")
@jwt_required()
def decline_invitation(invitation_id):
    invitation = InvitationService.decline_invitation(
        get_jwt_identity(),
        invitation_id,
    )

    return success_response(
        data=invitation_response_schema.dump(invitation),
        message="Invitation declined successfully",
    )