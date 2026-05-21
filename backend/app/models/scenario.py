from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Scenario(Base):
    __tablename__ = "scenarios"

    id: Mapped[int] = mapped_column(primary_key=True)
    category: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    difficulty: Mapped[str] = mapped_column(String(20))  # beginner/intermediate/advanced
    ai_role: Mapped[str] = mapped_column(String(100))
    user_role: Mapped[str] = mapped_column(String(100))
    system_prompt: Mapped[str] = mapped_column(Text)
    example_opener: Mapped[str] = mapped_column(Text)
    icon: Mapped[str] = mapped_column(String(10), default="💬")
    estimated_minutes: Mapped[int] = mapped_column(default=10)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    sessions: Mapped[list["ConversationSession"]] = relationship(back_populates="scenario")
