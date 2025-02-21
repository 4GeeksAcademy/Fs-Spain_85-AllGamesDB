"""Fusion de migraciones head

Revision ID: 88425e3bcf28
Revises: 3328edb6cd17, 6aeae884f261
Create Date: 2025-02-21 10:22:16.387723

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '88425e3bcf28'
down_revision = ('3328edb6cd17', '6aeae884f261')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
