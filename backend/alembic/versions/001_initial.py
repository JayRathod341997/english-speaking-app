"""Initial schema

Revision ID: 001
Revises:
Create Date: 2026-05-21

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "scenarios",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("difficulty", sa.String(20), nullable=False),
        sa.Column("ai_role", sa.String(100), nullable=False),
        sa.Column("user_role", sa.String(100), nullable=False),
        sa.Column("system_prompt", sa.Text(), nullable=False),
        sa.Column("example_opener", sa.Text(), nullable=False),
        sa.Column("icon", sa.String(10), server_default="💬"),
        sa.Column("estimated_minutes", sa.Integer(), server_default="10"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "conversation_sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("scenario_id", sa.Integer(), sa.ForeignKey("scenarios.id"), nullable=False),
        sa.Column("difficulty", sa.String(20), server_default="beginner"),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("total_messages", sa.Integer(), server_default="0"),
        sa.Column("overall_score", sa.Float(), nullable=True),
        sa.Column("fluency_score", sa.Float(), nullable=True),
        sa.Column("grammar_score", sa.Float(), nullable=True),
        sa.Column("vocabulary_score", sa.Float(), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=True),
    )

    op.create_table(
        "messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("session_id", sa.String(36), sa.ForeignKey("conversation_sessions.id"), nullable=False),
        sa.Column("role", sa.String(10), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("grammar_issues", sa.JSON(), nullable=True),
        sa.Column("corrected_version", sa.Text(), nullable=True),
        sa.Column("better_phrasing", sa.Text(), nullable=True),
        sa.Column("gujarati_note", sa.Text(), nullable=True),
        sa.Column("score", sa.Float(), nullable=True),
    )

    op.create_table(
        "user_stats",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("total_sessions", sa.Integer(), server_default="0"),
        sa.Column("total_minutes", sa.Integer(), server_default="0"),
        sa.Column("current_streak", sa.Integer(), server_default="0"),
        sa.Column("best_streak", sa.Integer(), server_default="0"),
        sa.Column("vocabulary_count", sa.Integer(), server_default="0"),
        sa.Column("avg_score", sa.Float(), server_default="0"),
        sa.Column("level", sa.String(20), server_default="beginner"),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "daily_challenges",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("date", sa.Date(), nullable=False, unique=True),
        sa.Column("scenario_id", sa.Integer(), nullable=False),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column("target_phrases", sa.JSON(), server_default="[]"),
    )


def downgrade() -> None:
    op.drop_table("daily_challenges")
    op.drop_table("user_stats")
    op.drop_table("messages")
    op.drop_table("conversation_sessions")
    op.drop_table("scenarios")
