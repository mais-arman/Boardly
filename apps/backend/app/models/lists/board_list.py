from uuid import uuid4
from datetime import datetime, timezone
from app.extensions import db

class BoardList(db.Model):
    __tablename__ = "board_lists"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid4)

    board_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("boards.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title = db.Column(db.String(160), nullable=False)

    position = db.Column(db.Integer, nullable=False, default=0)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    board = db.relationship(
        "Board",
        back_populates="lists",
    )

    __table_args__ = (
        db.Index("ix_board_lists_board_position", "board_id", "position"),
    )