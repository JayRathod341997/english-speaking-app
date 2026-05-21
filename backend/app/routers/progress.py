from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.progress import DailyChallenge, UserStats
from app.models.session import ConversationSession
from app.schemas.conversation import DailyChallengeResponse, ProgressResponse, SessionResponse

router = APIRouter(prefix="/api", tags=["progress"])


@router.get("/progress", response_model=ProgressResponse)
async def get_progress(db: AsyncSession = Depends(get_db)):
    stats_result = await db.execute(select(UserStats).where(UserStats.id == 1))
    stats = stats_result.scalar_one_or_none()

    sessions_result = await db.execute(
        select(ConversationSession)
        .where(ConversationSession.ended_at.isnot(None))
        .order_by(desc(ConversationSession.started_at))
        .limit(10)
    )
    recent = sessions_result.scalars().all()

    if not stats:
        return ProgressResponse(
            total_sessions=0, total_minutes=0, current_streak=0,
            best_streak=0, vocabulary_count=0, avg_score=0.0,
            level="beginner", recent_sessions=[],
        )

    return ProgressResponse(
        total_sessions=stats.total_sessions,
        total_minutes=stats.total_minutes,
        current_streak=stats.current_streak,
        best_streak=stats.best_streak,
        vocabulary_count=stats.vocabulary_count,
        avg_score=stats.avg_score,
        level=stats.level,
        recent_sessions=[
            SessionResponse(
                id=s.id, scenario_id=s.scenario_id, difficulty=s.difficulty,
                started_at=s.started_at, total_messages=s.total_messages,
                overall_score=s.overall_score,
            )
            for s in recent
        ],
    )


@router.get("/daily-challenge", response_model=DailyChallengeResponse)
async def get_daily_challenge(db: AsyncSession = Depends(get_db)):
    today = date.today()
    result = await db.execute(select(DailyChallenge).where(DailyChallenge.date == today))
    challenge = result.scalar_one_or_none()

    if not challenge:
        # Default challenge if none seeded
        return DailyChallengeResponse(
            scenario_id=1,
            prompt="Introduce yourself to a new colleague at work. Tell them your name, your role, and one thing you enjoy about your job.",
            target_phrases=["Nice to meet you", "I'm responsible for", "I really enjoy"],
            date=str(today),
        )

    return DailyChallengeResponse(
        scenario_id=challenge.scenario_id,
        prompt=challenge.prompt,
        target_phrases=challenge.target_phrases,
        date=str(challenge.date),
    )
