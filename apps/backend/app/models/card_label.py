from app.extensions import db

card_labels = db.Table(
    "card_labels",
    db.Column(
        "card_id",
        db.UUID(as_uuid=True),
        db.ForeignKey("cards.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    db.Column(
        "label_id",
        db.UUID(as_uuid=True),
        db.ForeignKey("labels.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)