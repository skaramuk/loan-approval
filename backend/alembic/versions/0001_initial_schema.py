"""Initial schema: model_versions, predictions, Row Level Security.

Revision ID: 0001
Revises:
Create Date: 2026-11-10
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "model_versions",
        sa.Column("version", sa.Text(), primary_key=True),
        sa.Column("algorithm", sa.Text(), nullable=False),
        sa.Column("trained_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("metrics", postgresql.JSONB(), nullable=False),
        sa.Column("threshold", sa.Numeric(5, 4), nullable=False),
        sa.Column("data_sha256", sa.Text(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )

    op.create_table(
        "predictions",
        sa.Column("id", sa.Uuid(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "model_version", sa.Text(), sa.ForeignKey("model_versions.version"), nullable=False
        ),
        sa.Column("person_age", sa.Integer(), nullable=False),
        sa.Column("person_education", sa.Text(), nullable=False),
        sa.Column("person_income", sa.Numeric(12, 2), nullable=False),
        sa.Column("person_emp_exp", sa.Integer(), nullable=False),
        sa.Column("person_home_ownership", sa.Text(), nullable=False),
        sa.Column("loan_amnt", sa.Numeric(12, 2), nullable=False),
        sa.Column("loan_intent", sa.Text(), nullable=False),
        sa.Column("loan_int_rate", sa.Numeric(5, 2), nullable=False),
        sa.Column("cb_person_cred_hist_length", sa.Integer(), nullable=False),
        sa.Column("credit_score", sa.Integer(), nullable=False),
        sa.Column("previous_loan_defaults_on_file", sa.Boolean(), nullable=False),
        sa.Column("loan_percent_income", sa.Numeric(4, 2), nullable=False),
        sa.Column("probability", sa.Numeric(5, 4), nullable=False),
        sa.Column("threshold", sa.Numeric(5, 4), nullable=False),
        sa.Column("approved", sa.Boolean(), nullable=False),
        sa.Column("factors", postgresql.JSONB(), nullable=False),
        sa.Column(
            "low_confidence_fields",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
    )
    op.create_index(
        "ix_predictions_user_id_created_at",
        "predictions",
        ["user_id", sa.text("created_at DESC")],
    )

    # Accounts live in Supabase Auth. Deleting an account deletes its predictions.
    op.execute(
        """
        ALTER TABLE public.predictions
            ADD CONSTRAINT predictions_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
        """
    )

    # Row Level Security. Supabase also exposes `public` through an auto-generated API that
    # anyone holding the publishable key can call, so every table must have RLS enabled.
    # The backend connects as the table owner and is not subject to these policies; they are
    # the safety net for access that does not go through the backend.
    op.execute("ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY")
    # Alembic's own bookkeeping table also sits in `public`: enabled with no policy = no access.
    op.execute("ALTER TABLE public.alembic_version ENABLE ROW LEVEL SECURITY")

    op.execute(
        """
        CREATE POLICY "Model versions are readable by everyone"
            ON public.model_versions FOR SELECT
            TO anon, authenticated
            USING (true)
        """
    )
    op.execute(
        """
        CREATE POLICY "Users can read their own predictions"
            ON public.predictions FOR SELECT
            TO authenticated
            USING ((SELECT auth.uid()) = user_id)
        """
    )
    op.execute(
        """
        CREATE POLICY "Users can delete their own predictions"
            ON public.predictions FOR DELETE
            TO authenticated
            USING ((SELECT auth.uid()) = user_id)
        """
    )
    # No INSERT or UPDATE policy on purpose: predictions are only ever written by the backend,
    # so a client cannot fabricate or alter a result.


def downgrade() -> None:
    op.execute("ALTER TABLE public.alembic_version DISABLE ROW LEVEL SECURITY")
    op.drop_table("predictions")
    op.drop_table("model_versions")
