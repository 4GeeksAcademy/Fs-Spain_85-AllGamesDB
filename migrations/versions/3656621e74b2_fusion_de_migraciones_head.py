"""Fusion de migraciones head

Revision ID: 3656621e74b2
Revises: 35e06d440656, c3ce7c3968b3
Create Date: 2025-02-13 16:08:42.174053

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3656621e74b2'
down_revision = ('35e06d440656', 'c3ce7c3968b3')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
