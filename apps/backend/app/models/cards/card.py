from uuid import uuid4
from datetime import datetime, timezone
from app.extensions import db
from app.models.cards.card_label import card_labels
from app.models.cards.card_assignee import card_assignees

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

    due_date = db.Column(
        db.DateTime(timezone=True),
        nullable=True,
    )

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

    labels = db.relationship(
        "Label",
        secondary=card_labels,
        back_populates="cards",
        lazy="selectin",
    )

    assignees = db.relationship(
        "User",
        secondary=card_assignees,
        backref=db.backref("assigned_cards", lazy="selectin"),
        lazy="selectin",
    )

    __table_args__ = (
        db.Index("ix_cards_list_position", "list_id", "position"),
    )