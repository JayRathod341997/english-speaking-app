from datetime import date

from fastapi import APIRouter

from app import store
from app.schemas.conversation import DailyChallengeResponse, ProgressResponse, SessionResponse

router = APIRouter(prefix="/api", tags=["progress"])


@router.get("/progress", response_model=ProgressResponse)
async def get_progress():
    st = store.stats
    recent = sorted(
        [s for s in store.sessions.values() if s["ended_at"] is not None],
        key=lambda s: s["started_at"],
        reverse=True,
    )[:10]

    return ProgressResponse(
        total_sessions=st["total_sessions"],
        total_minutes=st["total_minutes"],
        current_streak=st["current_streak"],
        best_streak=st["best_streak"],
        vocabulary_count=st["vocabulary_count"],
        avg_score=st["avg_score"],
        level=st["level"],
        recent_sessions=[
            SessionResponse(
                id=s["id"],
                scenario_id=s["scenario_id"],
                difficulty=s["difficulty"],
                started_at=s["started_at"],
                total_messages=s["total_messages"],
                overall_score=s["overall_score"],
            )
            for s in recent
        ],
    )


@router.get("/daily-challenge", response_model=DailyChallengeResponse)
async def get_daily_challenge():
    challenge = store.DAILY_CHALLENGE.copy()
    challenge["date"] = str(date.today())
    return DailyChallengeResponse(**challenge)
