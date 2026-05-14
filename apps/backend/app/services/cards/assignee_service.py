from app.extensions import db
from app.models.auth.user import User
from app.models.cards.card import Card
from app.models.boards.board_member import BoardMember
from app.services.realtime_service import RealtimeService
from app.utils.exceptions import NotFoundError, BadRequestError


class AssigneeService:
    @staticmethod
    def add_assignee(card_id, data):
        card = db.session.get(Card, card_id)

        if not card:
            raise NotFoundError("Card not found")

        board_id = card.list.board_id

        user = db.session.get(User, data["user_id"])

        if not user:
            raise NotFoundError("User not found")

        is_board_member = BoardMember.query.filter_by(
            board_id=board_id,
            user_id=user.id,
        ).first()

        if not is_board_member:
            raise BadRequestError("Assignee must be a board member")

        if user not in card.assignees:
            card.assignees.append(user)

        db.session.commit()

        RealtimeService.emit_board_event(board_id, "card.assignee.added")

        return card

    @staticmethod
    def remove_assignee(card_id, user_id):
        card = db.session.get(Card, card_id)

        if not card:
            raise NotFoundError("Card not found")

        board_id = card.list.board_id

        user = db.session.get(User, user_id)

        if not user:
            raise NotFoundError("User not found")

        if user in card.assignees:
            card.assignees.remove(user)

        db.session.commit()

        RealtimeService.emit_board_event(board_id, "card.assignee.removed")

        return card