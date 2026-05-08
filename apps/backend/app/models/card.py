from uuid import uuid4
from datetime import datetime, timezone
from app.extensions import db


class Card(db.Model):
    __tablename__ = "cards"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid4)

    list_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("board_lists.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title = db.Column(db.String(200), nullable=False)

    description = db.Column(db.Text, nullable=True)

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

    list = db.relationship(
        "BoardList",
        backref=db.backref(
            "cards",
            lazy="selectin",
            cascade="all, delete-orphan",
        ),
    )

    __table_args__ = (
        db.Index("ix_cards_list_position", "list_id", "position"),
    )