from app.extensions import socketio

class RealtimeService:
    @staticmethod
    def board_room(board_id):
        return f"board:{board_id}"

    @staticmethod
    def user_room(user_id):
        return f"user:{user_id}"

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

    @staticmethod
    def emit_user_event(user_id, event_type, payload=None):
        socketio.emit(
            "user:event",
            {
                "type": event_type,
                "user_id": str(user_id),
                "payload": payload or {},
            },
            room=RealtimeService.user_room(user_id),
        )