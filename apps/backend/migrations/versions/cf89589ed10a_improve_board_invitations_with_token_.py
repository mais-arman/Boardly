from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'cf89589ed10a'
down_revision = '19d5fa613a3e'
branch_labels = None
depends_on = None


invitation_status_enum = postgresql.ENUM(
    'pending',
    'accepted',
    'declined',
    'cancelled',
    'expired',
    name='invitationstatus',
)


def upgrade():

    invitation_status_enum.create(op.get_bind(), checkfirst=True)

    with op.batch_alter_table('board_invitations', schema=None) as batch_op:

        batch_op.add_column(
            sa.Column(
                'token',
                sa.UUID(),
                nullable=False,
                server_default=sa.text('gen_random_uuid()'),
            )
        )

        batch_op.add_column(
            sa.Column(
                'expires_at',
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text(
                    "(CURRENT_TIMESTAMP + interval '7 days')"
                ),
            )
        )

        batch_op.add_column(
            sa.Column(
                'responded_at',
                sa.DateTime(timezone=True),
                nullable=True,
            )
        )

        batch_op.alter_column(
            'status',
            existing_type=sa.VARCHAR(length=30),
            type_=invitation_status_enum,
            existing_nullable=False,
            postgresql_using='status::invitationstatus',
        )

        batch_op.drop_constraint(
            'uq_board_invitation_email',
            type_='unique',
        )

        batch_op.create_index(
            'ix_board_invitations_board_email',
            ['board_id', 'email'],
            unique=False,
        )

        batch_op.create_index(
            'ix_board_invitations_token',
            ['token'],
            unique=True,
        )

    op.execute(
        """
        UPDATE board_invitations
        SET token = gen_random_uuid()
        WHERE token IS NULL
        """
    )

    op.alter_column(
        'board_invitations',
        'token',
        server_default=None,
    )

    op.alter_column(
        'board_invitations',
        'expires_at',
        server_default=None,
    )


def downgrade():

    with op.batch_alter_table('board_invitations', schema=None) as batch_op:

        batch_op.drop_index('ix_board_invitations_token')

        batch_op.drop_index('ix_board_invitations_board_email')

        batch_op.create_unique_constraint(
            'uq_board_invitation_email',
            ['board_id', 'email'],
        )

        batch_op.alter_column(
            'status',
            existing_type=invitation_status_enum,
            type_=sa.VARCHAR(length=30),
            existing_nullable=False,
            postgresql_using='status::text',
        )

        batch_op.drop_column('responded_at')

        batch_op.drop_column('expires_at')

        batch_op.drop_column('token')

    invitation_status_enum.drop(op.get_bind(), checkfirst=True)
