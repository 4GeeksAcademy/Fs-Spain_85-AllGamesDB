"""Fusion de migraciones head

Revision ID: 2212fbc9fdc7
Revises: 45e17b322d01, a236689c4102
Create Date: 2025-02-13 20:45:52.292925

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2212fbc9fdc7'
down_revision = ('45e17b322d01', 'a236689c4102')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
