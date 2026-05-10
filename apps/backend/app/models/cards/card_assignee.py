from app.extensions import db

card_assignees = db.Table(
    "card_assignees",
    db.Column(
        "card_id",
        db.UUID(as_uuid=True),
        db.ForeignKey("cards.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    db.Column(
        "user_id",
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)