"""Fusion de migraciones head

Revision ID: 49515dc3a16d
Revises: 2fd70f040408, a043bd7ae7f8
Create Date: 2025-02-26 00:13:28.981828

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '49515dc3a16d'
down_revision = ('2fd70f040408', 'a043bd7ae7f8')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
