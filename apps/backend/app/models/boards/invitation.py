from uuid import uuid4
from datetime import datetime, timezone, timedelta
from app.extensions import db
from app.models.boards.board_role import BoardRole
from app.models.boards.invitation_status import InvitationStatus


class BoardInvitation(db.Model):
    __tablename__ = "board_invitations"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid4)

    token = db.Column(
        db.UUID(as_uuid=True),
        unique=True,
        nullable=False,
        default=uuid4,
        index=True,
    )

    board_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("boards.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    invited_by_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    email = db.Column(db.String(255), nullable=False, index=True)

    role = db.Column(
        db.Enum(BoardRole, values_callable=lambda enum: [e.value for e in enum]),
        nullable=False,
    )

    status = db.Column(
        db.Enum(
            InvitationStatus,
            values_callable=lambda enum: [e.value for e in enum],
        ),
        nullable=False,
        default=InvitationStatus.PENDING,
    )

    expires_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc) + timedelta(days=7),
        nullable=False,
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    responded_at = db.Column(
        db.DateTime(timezone=True),
        nullable=True,
    )

    board = db.relationship(
        "Board",
        backref=db.backref(
            "invitations",
            lazy="selectin",
            cascade="all, delete-orphan",
        ),
    )

    invited_by = db.relationship(
        "User",
        backref=db.backref("sent_invitations", lazy="selectin"),
    )

    __table_args__ = (
        db.Index("ix_board_invitations_board_email", "board_id", "email"),
    )