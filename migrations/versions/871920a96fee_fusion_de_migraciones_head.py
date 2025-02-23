"""Fusion de migraciones head

Revision ID: 871920a96fee
Revises: 789a973af01b, e854567503b4
Create Date: 2025-02-23 19:28:30.450197

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '871920a96fee'
down_revision = ('789a973af01b', 'e854567503b4')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
