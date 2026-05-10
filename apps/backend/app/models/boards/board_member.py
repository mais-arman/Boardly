from uuid import uuid4
from datetime import datetime, timezone
from app.extensions import db
from app.models.boards.board_role import BoardRole

class BoardMember(db.Model):
    __tablename__ = "board_members"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid4)

    board_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("boards.id"),
        nullable=False,
    )

    user_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id"),
        nullable=False,
    )

    role = db.Column(
        db.Enum(BoardRole, values_callable=lambda enum: [e.value for e in enum]),
        nullable=False,
        default=BoardRole.VIEWER,
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    board = db.relationship(
        "Board",
        backref=db.backref("members", lazy="selectin"),
    )

    user = db.relationship(
        "User",
        backref=db.backref("board_memberships", lazy="selectin"),
    )

    __table_args__ = (
        db.UniqueConstraint("board_id", "user_id", name="uq_board_member"),
        db.Index("ix_board_members_user_id", "user_id"),
    )