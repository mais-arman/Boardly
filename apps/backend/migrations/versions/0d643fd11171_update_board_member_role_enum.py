"""update board member role enum

Revision ID: 0d643fd11171
Revises: 0e2d3b2bb323
Create Date: 2026-05-06 19:02:51.349991
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0d643fd11171"
down_revision = "0e2d3b2bb323"
branch_labels = None
depends_on = None


board_role_enum = postgresql.ENUM(
    "owner",
    "admin",
    "editor",
    "viewer",
    name="boardrole",
)


def upgrade():
    board_role_enum.create(op.get_bind(), checkfirst=True)

    op.alter_column(
        "board_members",
        "role",
        existing_type=sa.VARCHAR(length=30),
        type_=board_role_enum,
        existing_nullable=False,
        postgresql_using="role::boardrole",
    )


def downgrade():
    op.alter_column(
        "board_members",
        "role",
        existing_type=board_role_enum,
        type_=sa.VARCHAR(length=30),
        existing_nullable=False,
        postgresql_using="role::text",
    )

    board_role_enum.drop(op.get_bind(), checkfirst=True)