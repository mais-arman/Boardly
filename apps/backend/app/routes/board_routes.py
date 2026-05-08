from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.schemas.board_schema import (
    BoardCreateSchema,
    BoardUpdateSchema,
    BoardResponseSchema,
)
from app.schemas.member_schema import (
    InviteMemberSchema,
    UpdateMemberRoleSchema,
    MemberResponseSchema,
    InvitationResponseSchema,
)
from app.services.board_service import BoardService
from app.services.member_service import MemberService
from app.utils.responses import success_response


board_bp = Blueprint("boards", __name__)

board_create_schema = BoardCreateSchema()
board_update_schema = BoardUpdateSchema()
board_response_schema = BoardResponseSchema()
boards_response_schema = BoardResponseSchema(many=True)

invite_member_schema = InviteMemberSchema()
invitation_response_schema = InvitationResponseSchema()
update_member_role_schema = UpdateMemberRoleSchema()
member_response_schema = MemberResponseSchema()
members_response_schema = MemberResponseSchema(many=True)


@board_bp.get("")
@jwt_required()
def get_boards():
    boards = BoardService.get_user_boards(get_jwt_identity())

    return success_response(
        data=boards_response_schema.dump(boards),
        message="Boards fetched successfully",
    )


@board_bp.post("")
@jwt_required()
def create_board():
    data = board_create_schema.load(request.get_json(silent=True) or {})
    board = BoardService.create_board(get_jwt_identity(), data)

    return success_response(
        data=board_response_schema.dump(board),
        message="Board created successfully",
        status_code=201,
    )


@board_bp.get("/<uuid:board_id>")
@jwt_required()
def get_board(board_id):
    board = BoardService.get_board(get_jwt_identity(), board_id)

    return success_response(
        data=board_response_schema.dump(board),
        message="Board fetched successfully",
    )


@board_bp.patch("/<uuid:board_id>")
@jwt_required()
def update_board(board_id):
    data = board_update_schema.load(request.get_json(silent=True) or {})
    board = BoardService.update_board(get_jwt_identity(), board_id, data)

    return success_response(
        data=board_response_schema.dump(board),
        message="Board updated successfully",
    )


@board_bp.delete("/<uuid:board_id>")
@jwt_required()
def delete_board(board_id):
    BoardService.delete_board(get_jwt_identity(), board_id)

    return success_response(
        data=None,
        message="Board deleted successfully",
    )


@board_bp.post("/<uuid:board_id>/invitations")
@jwt_required()
def invite_member(board_id):
    data = invite_member_schema.load(request.get_json(silent=True) or {})

    invitation = MemberService.invite_member(
        get_jwt_identity(),
        board_id,
        data,
    )

    return success_response(
        data=invitation_response_schema.dump(invitation),
        message="Invitation created successfully",
        status_code=201,
    )


@board_bp.get("/<uuid:board_id>/members")
@jwt_required()
def get_members(board_id):
    members = MemberService.get_members(get_jwt_identity(), board_id)

    return success_response(
        data=members_response_schema.dump(members),
        message="Members fetched successfully",
    )


@board_bp.patch("/<uuid:board_id>/members/<uuid:member_id>")
@jwt_required()
def update_member_role(board_id, member_id):
    data = update_member_role_schema.load(request.get_json(silent=True) or {})

    member = MemberService.update_member_role(
        get_jwt_identity(),
        board_id,
        member_id,
        data,
    )

    return success_response(
        data=member_response_schema.dump(member),
        message="Member role updated successfully",
    )


@board_bp.delete("/<uuid:board_id>/members/<uuid:member_id>")
@jwt_required()
def remove_member(board_id, member_id):
    MemberService.remove_member(
        get_jwt_identity(),
        board_id,
        member_id,
    )

    return success_response(
        data=None,
        message="Member removed successfully",
    )