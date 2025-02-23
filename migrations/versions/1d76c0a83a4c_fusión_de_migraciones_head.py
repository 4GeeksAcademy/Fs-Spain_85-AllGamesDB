"""Fusión de migraciones head

Revision ID: 1d76c0a83a4c
Revises: 6bc4e7651e16, 871920a96fee
Create Date: 2025-02-23 21:35:47.570315

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1d76c0a83a4c'
down_revision = ('6bc4e7651e16', '871920a96fee')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
