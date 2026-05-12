from app.extensions import socketio


class RealtimeService:
    @staticmethod
    def board_room(board_id):
        return f"board:{board_id}"

    @staticmethod
    def emit_board_event(board_id, event_type, payload=None):
        socketio.emit(
            "board:event",
            {
                "type": event_type,
                "board_id": str(board_id),
                "payload": payload or {},
            },
            room=RealtimeService.board_room(board_id),
        )