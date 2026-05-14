from uuid import uuid4
from datetime import datetime, timezone
from app.extensions import db


class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid4)

    card_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("cards.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    content = db.Column(db.Text, nullable=False)

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

    card = db.relationship(
        "Card",
        backref=db.backref(
            "comments",
            lazy="selectin",
            cascade="all, delete-orphan",
        ),
    )

    user = db.relationship(
        "User",
        backref=db.backref("comments", lazy="selectin"),
    )