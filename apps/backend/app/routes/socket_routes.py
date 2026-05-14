from flask import request
from flask_socketio import join_room, leave_room
from flask_jwt_extended import decode_token
from app.extensions import db, socketio
from app.models.boards.board import Board
from app.models.boards.board_role import Permission
from app.services.boards.board_permission_service import BoardPermissionService
from app.services.realtime_service import RealtimeService


def _get_user_id_from_socket():
    token = request.args.get("token")

    if not token:
        return None

    try:
        decoded = decode_token(token)
        return decoded["sub"]
    except Exception:
        return None


@socketio.on("connect")
def handle_connect():
    user_id = _get_user_id_from_socket()

    if not user_id:
        return False

    join_room(RealtimeService.user_room(user_id))


@socketio.on("disconnect")
def handle_disconnect():
    user_id = _get_user_id_from_socket()

    if user_id:
        leave_room(RealtimeService.user_room(user_id))


@socketio.on("join_board")
def handle_join_board(data):
    user_id = _get_user_id_from_socket()

    if not user_id:
        return

    board_id = data.get("board_id")

    if not board_id:
        return

    board = db.session.get(Board, board_id)

    if not board:
        return

    has_access = BoardPermissionService.has_permission(
        user_id,
        board_id,
        Permission.VIEW_BOARD,
    )

    if not has_access:
        return

    join_room(RealtimeService.board_room(board_id))


@socketio.on("leave_board")
def handle_leave_board(data):
    board_id = data.get("board_id")

    if board_id:
        leave_room(RealtimeService.board_room(board_id))