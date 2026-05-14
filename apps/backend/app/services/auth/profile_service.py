from app.extensions import db
from app.models.auth.user import User
from app.models.boards.board import Board
from app.models.boards.board_member import BoardMember
from app.models.boards.invitation import BoardInvitation
from app.models.cards.comment import Comment
from app.models.cards.card_assignee import card_assignees
from app.utils.exceptions import NotFoundError, BadRequestError


class ProfileService:
    @staticmethod
    def update_profile(user_id, data):
        user = db.session.get(User, user_id)

        if not user:
            raise NotFoundError("User not found")

        if "name" in data:
            user.name = data["name"].strip()

        db.session.commit()
        return user

    @staticmethod
    def delete_account(user_id):
        user = db.session.get(User, user_id)

        if not user:
            raise NotFoundError("User not found")

        try:
            owned_boards = Board.query.filter_by(owner_id=user.id).all()

            for board in owned_boards:
                BoardMember.query.filter_by(board_id=board.id).delete()
                db.session.delete(board)

            BoardMember.query.filter_by(user_id=user.id).delete()
            BoardInvitation.query.filter_by(invited_by_id=user.id).delete()
            Comment.query.filter_by(user_id=user.id).delete()

            db.session.execute(
                card_assignees.delete().where(card_assignees.c.user_id == user.id)
            )

            db.session.delete(user)
            db.session.commit()

        except Exception:
            db.session.rollback()
            raise BadRequestError("Failed to delete account")