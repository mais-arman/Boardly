from uuid import uuid4
from datetime import datetime, timezone
from app.extensions import db

class Board(db.Model):
    __tablename__ = "boards"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid4)

    title = db.Column(db.String(160), nullable=False)

    description = db.Column(db.Text, nullable=True)

    owner_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

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

    owner = db.relationship(
        "User",
        backref=db.backref("owned_boards", lazy="selectin"),
    )