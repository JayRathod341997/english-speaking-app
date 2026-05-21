from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.scenario import Scenario
from app.models.session import ConversationSession, Message
from app.schemas.conversation import (
    EndSessionResponse,
    MessageResponse,
    SendMessageRequest,
    SendMessageResponse,
    SessionDetailResponse,
    SessionResponse,
    StartSessionRequest,
)
from app.services.gemini import build_system_prompt, get_ai_response, get_opening_message

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("", response_model=SessionResponse)
async def start_session(body: StartSessionRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Scenario).where(Scenario.id == body.scenario_id))
    scenario = result.scalar_one_or_none()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    session = ConversationSession(scenario_id=body.scenario_id, difficulty=body.difficulty)
    db.add(session)
    await db.flush()

    # Add opening AI message
    opener = await get_opening_message(scenario.ai_role, scenario.example_opener)
    opening_msg = Message(session_id=session.id, role="ai", content=opener)
    db.add(opening_msg)
    session.total_messages = 1

    await db.commit()
    await db.refresh(session)
    return session


@router.post("/{session_id}/message", response_model=SendMessageResponse)
async def send_message(
    session_id: str,
    body: SendMessageRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ConversationSession)
        .where(ConversationSession.id == session_id)
        .options(selectinload(ConversationSession.messages))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.ended_at:
        raise HTTPException(status_code=400, detail="Session already ended")

    scenario_result = await db.execute(select(Scenario).where(Scenario.id == session.scenario_id))
    scenario = scenario_result.scalar_one()

    system_prompt = build_system_prompt(scenario.ai_role, scenario.user_role, session.difficulty)

    # Build full alternating history for Gemini (opener handled inside get_ai_response)
    history = [
        {"role": m.role, "content": m.content}
        for m in sorted(session.messages, key=lambda x: x.id)
    ]

    ai_reply, feedback = await get_ai_response(
        system_prompt=system_prompt,
        conversation_history=history,
        user_message=body.content,
        example_opener=scenario.example_opener,
    )

    # Save user message
    user_msg = Message(session_id=session.id, role="user", content=body.content)
    db.add(user_msg)
    await db.flush()

    # Save AI reply with feedback
    ai_msg = Message(
        session_id=session.id,
        role="ai",
        content=ai_reply,
        grammar_issues=feedback.issues,
        corrected_version=feedback.corrected,
        better_phrasing=feedback.better_phrasing,
        gujarati_note=feedback.gujarati_note,
        score=feedback.score,
    )
    db.add(ai_msg)
    session.total_messages += 2

    await db.commit()
    await db.refresh(ai_msg)

    return SendMessageResponse(ai_reply=ai_reply, feedback=feedback, message_id=ai_msg.id)


@router.get("/{session_id}", response_model=SessionDetailResponse)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ConversationSession)
        .where(ConversationSession.id == session_id)
        .options(selectinload(ConversationSession.messages))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages_with_feedback = []
    for m in session.messages:
        fb = None
        if m.role == "ai" and m.score is not None:
            from app.schemas.conversation import FeedbackSchema
            fb = FeedbackSchema(
                has_errors=bool(m.grammar_issues),
                corrected=m.corrected_version or "",
                issues=m.grammar_issues or [],
                better_phrasing=m.better_phrasing or "",
                gujarati_note=m.gujarati_note or "",
                score=m.score or 0,
            )
        messages_with_feedback.append(
            MessageResponse(
                id=m.id,
                role=m.role,
                content=m.content,
                timestamp=m.timestamp,
                feedback=fb,
            )
        )

    return SessionDetailResponse(
        id=session.id,
        scenario_id=session.scenario_id,
        difficulty=session.difficulty,
        started_at=session.started_at,
        ended_at=session.ended_at,
        total_messages=session.total_messages,
        overall_score=session.overall_score,
        messages=messages_with_feedback,
    )


@router.post("/{session_id}/end", response_model=EndSessionResponse)
async def end_session(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ConversationSession)
        .where(ConversationSession.id == session_id)
        .options(selectinload(ConversationSession.messages))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    scored_messages = [m for m in session.messages if m.score is not None]
    if not scored_messages:
        scores = {"overall": 0, "grammar": 0, "vocabulary": 0, "fluency": 0, "confidence": 0}
    else:
        avg = lambda lst: sum(lst) / len(lst) if lst else 0
        raw_scores = [m.score for m in scored_messages]

        # Decompose overall score into sub-scores using weighted approximation
        grammar_scores = [min(s + 5 if s > 60 else s - 5, 100) for s in raw_scores]
        vocab_scores = [min(s + 3 if s > 50 else s, 100) for s in raw_scores]
        fluency_scores = raw_scores
        confidence_scores = [min(s + 10 if len(session.messages) > 4 else s, 100) for s in raw_scores]

        scores = {
            "overall": round(avg(raw_scores), 1),
            "grammar": round(avg(grammar_scores), 1),
            "vocabulary": round(avg(vocab_scores), 1),
            "fluency": round(avg(fluency_scores), 1),
            "confidence": round(avg(confidence_scores), 1),
        }

    session.ended_at = datetime.now(timezone.utc)
    session.overall_score = scores["overall"]
    session.grammar_score = scores["grammar"]
    session.vocabulary_score = scores["vocabulary"]
    session.fluency_score = scores["fluency"]
    session.confidence_score = scores["confidence"]

    duration = (session.ended_at - session.started_at).seconds // 60

    # Update user stats
    from app.models.progress import UserStats
    stats_result = await db.execute(select(UserStats).where(UserStats.id == 1))
    stats = stats_result.scalar_one_or_none()
    if not stats:
        stats = UserStats(id=1)
        db.add(stats)

    stats.total_sessions += 1
    stats.total_minutes += duration
    prev_avg = stats.avg_score
    prev_count = stats.total_sessions - 1
    stats.avg_score = round((prev_avg * prev_count + scores["overall"]) / stats.total_sessions, 1)

    # Level up logic
    if stats.avg_score >= 80 and stats.total_sessions >= 3 and stats.level == "beginner":
        stats.level = "intermediate"
    elif stats.avg_score >= 85 and stats.total_sessions >= 10 and stats.level == "intermediate":
        stats.level = "advanced"

    await db.commit()

    return EndSessionResponse(
        overall_score=scores["overall"],
        grammar_score=scores["grammar"],
        vocabulary_score=scores["vocabulary"],
        fluency_score=scores["fluency"],
        confidence_score=scores["confidence"],
        total_messages=session.total_messages,
        duration_minutes=duration,
    )
