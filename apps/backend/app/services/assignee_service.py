from app.extensions import db
from app.models.user import User
from app.models.card import Card
from app.models.board_member import BoardMember
from app.models.board_role import Permission
from app.services.board_permission_service import BoardPermissionService
from app.utils.exceptions import ForbiddenError, NotFoundError, BadRequestError


class AssigneeService:

    @staticmethod
    def add_assignee(request_user_id, card_id, data):
        card = db.session.get(Card, card_id)

        if not card:
            raise NotFoundError("Card not found")

        board_id = card.list.board_id

        if not BoardPermissionService.has_permission(
            request_user_id,
            board_id,
            Permission.ASSIGN_CARD,
        ):
            raise ForbiddenError("You do not have permission to assign cards")

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

        return card

    @staticmethod
    def remove_assignee(request_user_id, card_id, user_id):
        card = db.session.get(Card, card_id)

        if not card:
            raise NotFoundError("Card not found")

        board_id = card.list.board_id

        if not BoardPermissionService.has_permission(
            request_user_id,
            board_id,
            Permission.ASSIGN_CARD,
        ):
            raise ForbiddenError("You do not have permission to remove assignees")

        user = db.session.get(User, user_id)

        if not user:
            raise NotFoundError("User not found")

        if user in card.assignees:
            card.assignees.remove(user)

        db.session.commit()

        return card