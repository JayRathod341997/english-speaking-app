from datetime import date, datetime, timezone
from sqlalchemy import String, Text, Float, Integer, Date, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class UserStats(Base):
    __tablename__ = "user_stats"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    total_sessions: Mapped[int] = mapped_column(Integer, default=0)
    total_minutes: Mapped[int] = mapped_column(Integer, default=0)
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    best_streak: Mapped[int] = mapped_column(Integer, default=0)
    vocabulary_count: Mapped[int] = mapped_column(Integer, default=0)
    avg_score: Mapped[float] = mapped_column(Float, default=0.0)
    level: Mapped[str] = mapped_column(String(20), default="beginner")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )


class DailyChallenge(Base):
    __tablename__ = "daily_challenges"

    id: Mapped[int] = mapped_column(primary_key=True)
    date: Mapped[date] = mapped_column(Date, unique=True)
    scenario_id: Mapped[int] = mapped_column(Integer)
    prompt: Mapped[str] = mapped_column(Text)
    target_phrases: Mapped[list] = mapped_column(JSON, default=list)
