from uuid import uuid4
from datetime import datetime, timezone
from app.extensions import db
from app.models.card_label import card_labels


class Label(db.Model):
    __tablename__ = "labels"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid4)

    board_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("boards.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name = db.Column(db.String(80), nullable=False)

    color = db.Column(db.String(20), nullable=False, default="#808080")

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    board = db.relationship(
        "Board",
        backref=db.backref(
            "labels",
            lazy="selectin",
            cascade="all, delete-orphan",
        ),
    )

    cards = db.relationship(
        "Card",
        secondary=card_labels,
        back_populates="labels",
        lazy="selectin",
    )

    __table_args__ = (
        db.UniqueConstraint("board_id", "name", name="uq_label_board_name"),
    )