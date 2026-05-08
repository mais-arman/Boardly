from alembic import op
import sqlalchemy as sa


revision = 'c364260252df'
down_revision = '8b6955997065'
branch_labels = None
depends_on = None


user_role_enum = sa.Enum(
    "user",
    "super_admin",
    name="userrole",
)


def upgrade():
    user_role_enum.create(op.get_bind(), checkfirst=True)

    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "role",
                user_role_enum,
                nullable=False,
                server_default="user",
            )
        )


def downgrade():
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_column("role")

    user_role_enum.drop(op.get_bind(), checkfirst=True)