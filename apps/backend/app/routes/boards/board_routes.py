from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.constants.routes import (
    BOARD_ROOT,
    BOARD_BY_ID,
    BOARD_INVITATIONS,
    BOARD_INVITATION_BY_TOKEN,
    BOARD_MEMBERS,
    BOARD_MEMBER_BY_ID,
    BOARD_INVITATION_CANCEL,
)
from app.models.boards.board_role import Permission
from app.schemas.boards.board_schema import (
    BoardCreateSchema,
    BoardUpdateSchema,
    BoardResponseSchema,
)
from app.schemas.boards.member_schema import (
    InviteMemberSchema,
    UpdateMemberRoleSchema,
    MemberResponseSchema,
    InvitationResponseSchema,
)
from app.services.boards.board_service import BoardService
from app.services.boards.member_service import MemberService
from app.services.boards.invitation_service import InvitationService
from app.utils.permission_decorators import board_permission
from app.utils.responses import success_response
from app.constants.messages import Messages


board_bp = Blueprint("boards", __name__)

board_create_schema = BoardCreateSchema()
board_update_schema = BoardUpdateSchema()
board_response_schema = BoardResponseSchema()
boards_response_schema = BoardResponseSchema(many=True)

invite_member_schema = InviteMemberSchema()
invitation_response_schema = InvitationResponseSchema()
invitations_response_schema = InvitationResponseSchema(many=True)
update_member_role_schema = UpdateMemberRoleSchema()
member_response_schema = MemberResponseSchema()
members_response_schema = MemberResponseSchema(many=True)


@board_bp.get(BOARD_ROOT)
@jwt_required()
def get_boards():
    boards = BoardService.get_user_boards(get_jwt_identity())

    return success_response(
        data=boards_response_schema.dump(boards),
        message="Boards fetched successfully",
    )


@board_bp.post(BOARD_ROOT)
@jwt_required()
def create_board():
    data = board_create_schema.load(request.get_json(silent=True) or {})
    board = BoardService.create_board(get_jwt_identity(), data)

    return success_response(
        data=board_response_schema.dump(board),
        message="Board created successfully",
        status_code=201,
    )


@board_bp.get(BOARD_BY_ID)
@jwt_required()
@board_permission(Permission.VIEW_BOARD)
def get_board(board_id):
    board = BoardService.get_board(
        board_id,
        get_jwt_identity(),
    )

    return success_response(
        data=board_response_schema.dump(board),
        message="Board fetched successfully",
    )


@board_bp.patch(BOARD_BY_ID)
@jwt_required()
@board_permission(Permission.EDIT_BOARD)
def update_board(board_id):
    data = board_update_schema.load(request.get_json(silent=True) or {})
    board = BoardService.update_board(
        board_id,
        data,
        get_jwt_identity(),
    )

    return success_response(
        data=board_response_schema.dump(board),
        message="Board updated successfully",
    )


@board_bp.delete(BOARD_BY_ID)
@jwt_required()
@board_permission(Permission.DELETE_BOARD)
def delete_board(board_id):
    BoardService.delete_board(board_id)

    return success_response(
        data=None,
        message="Board deleted successfully",
    )


@board_bp.post(BOARD_INVITATIONS)
@jwt_required()
@board_permission(Permission.MANAGE_MEMBERS)
def invite_member(board_id):
    data = invite_member_schema.load(request.get_json(silent=True) or {})

    invitation = MemberService.invite_member(
        get_jwt_identity(),
        board_id,
        data,
    )

    return success_response(
        data=invitation_response_schema.dump(invitation),
        message=Messages.INVITATION_CREATED,
        status_code=201,
    )


@board_bp.get(BOARD_INVITATIONS)
@jwt_required()
@board_permission(Permission.MANAGE_MEMBERS)
def get_board_invitations(board_id):
    invitations = InvitationService.get_board_invitations(
        get_jwt_identity(),
        board_id,
    )

    return success_response(
        data=invitations_response_schema.dump(invitations),
        message=Messages.INVITATIONS_FETCHED,
    )


@board_bp.delete(BOARD_INVITATION_BY_TOKEN)
@jwt_required()
@board_permission(Permission.MANAGE_MEMBERS)
def cancel_invitation(board_id, token):
    invitation = InvitationService.cancel_invitation(
        get_jwt_identity(),
        board_id,
        token,
    )

    return success_response(
        data=invitation_response_schema.dump(invitation),
        message=Messages.INVITATION_CANCELLED,
    )


@board_bp.get(BOARD_MEMBERS)
@jwt_required()
@board_permission(Permission.VIEW_BOARD)
def get_members(board_id):
    members = MemberService.get_members(board_id)

    return success_response(
        data=members_response_schema.dump(members),
        message="Members fetched successfully",
    )


@board_bp.patch(BOARD_MEMBER_BY_ID)
@jwt_required()
@board_permission(Permission.MANAGE_MEMBERS)
def update_member_role(board_id, member_id):
    data = update_member_role_schema.load(request.get_json(silent=True) or {})

    member = MemberService.update_member_role(
        board_id,
        member_id,
        data,
    )

    return success_response(
        data=member_response_schema.dump(member),
        message="Member role updated successfully",
    )


@board_bp.delete(BOARD_MEMBER_BY_ID)
@jwt_required()
@board_permission(Permission.MANAGE_MEMBERS)
def remove_member(board_id, member_id):
    MemberService.remove_member(board_id, member_id)

    return success_response(
        data=None,
        message="Member removed successfully",
    )

@board_bp.delete(BOARD_INVITATION_CANCEL)
@jwt_required()
@board_permission(Permission.MANAGE_MEMBERS)
def cancel_invitation_by_id(board_id, invitation_id):
    invitation = InvitationService.cancel_invitation_by_id(
        get_jwt_identity(),
        board_id,
        invitation_id,
    )

    return success_response(
        data=invitation_response_schema.dump(invitation),
        message=Messages.INVITATION_CANCELLED,
    )    