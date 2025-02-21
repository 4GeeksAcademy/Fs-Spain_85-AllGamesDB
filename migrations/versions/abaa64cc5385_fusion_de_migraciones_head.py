"""Fusion de migraciones head

Revision ID: abaa64cc5385
Revises: 08e100a9b26e, edaa3db8632b
Create Date: 2025-02-21 10:11:09.977501

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'abaa64cc5385'
down_revision = ('08e100a9b26e', 'edaa3db8632b')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
