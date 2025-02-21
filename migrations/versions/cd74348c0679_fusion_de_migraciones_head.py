"""Fusion de migraciones head

Revision ID: cd74348c0679
Revises: 35e06d440656, c3ce7c3968b3
Create Date: 2025-02-12 22:54:02.570584

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cd74348c0679'
down_revision = ('35e06d440656', 'c3ce7c3968b3')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
