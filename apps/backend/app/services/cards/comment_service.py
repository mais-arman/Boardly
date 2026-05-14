from app.extensions import db
from app.models.cards.card import Card
from app.models.cards.comment import Comment
from app.models.boards.board_role import Permission
from app.services.boards.board_permission_service import BoardPermissionService
from app.services.realtime_service import RealtimeService
from app.utils.exceptions import ForbiddenError, NotFoundError


class CommentService:
    @staticmethod
    def get_card_comments(card_id):
        card = db.session.get(Card, card_id)

        if not card:
            raise NotFoundError("Card not found")

        return (
            Comment.query
            .filter_by(card_id=card_id)
            .order_by(Comment.created_at.asc())
            .all()
        )

    @staticmethod
    def create_comment(user_id, card_id, data):
        card = db.session.get(Card, card_id)

        if not card:
            raise NotFoundError("Card not found")

        comment = Comment(
            card_id=card_id,
            user_id=user_id,
            content=data["content"].strip(),
        )

        db.session.add(comment)
        db.session.commit()

        RealtimeService.emit_board_event(card.list.board_id, "comment.created")

        return comment

    @staticmethod
    def delete_comment(user_id, comment_id):
        comment = db.session.get(Comment, comment_id)

        if not comment:
            raise NotFoundError("Comment not found")

        board_id = comment.card.list.board_id

        can_manage_board = BoardPermissionService.has_permission(
            user_id,
            board_id,
            Permission.MANAGE_MEMBERS,
        )

        is_comment_owner = str(comment.user_id) == str(user_id)

        if not can_manage_board and not is_comment_owner:
            raise ForbiddenError("You do not have permission to delete this comment")

        db.session.delete(comment)
        db.session.commit()

        RealtimeService.emit_board_event(board_id, "comment.deleted")