import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app import store
from app.schemas.conversation import (
    EndSessionResponse,
    FeedbackSchema,
    MessageResponse,
    SendMessageRequest,
    SendMessageResponse,
    SessionDetailResponse,
    SessionResponse,
    StartSessionRequest,
)
from app.services.gemini import build_system_prompt, get_ai_response, get_opening_message

router = APIRouter(prefix="/api/sessions", tags=["sessions"])

_msg_counter = 0


def _next_msg_id() -> int:
    global _msg_counter
    _msg_counter += 1
    return _msg_counter


@router.post("", response_model=SessionResponse)
async def start_session(body: StartSessionRequest):
    scenario = store.get_scenario(body.scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    session_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    opener = await get_opening_message(scenario["ai_role"], scenario["example_opener"])
    opening_msg = {
        "id": _next_msg_id(),
        "role": "ai",
        "content": opener,
        "timestamp": now.isoformat(),
        "grammar_issues": None,
        "corrected_version": None,
        "better_phrasing": None,
        "gujarati_note": None,
        "score": None,
    }

    session = {
        "id": session_id,
        "scenario_id": body.scenario_id,
        "difficulty": body.difficulty,
        "started_at": now,
        "ended_at": None,
        "total_messages": 1,
        "overall_score": None,
        "grammar_score": None,
        "vocabulary_score": None,
        "fluency_score": None,
        "confidence_score": None,
        "messages": [opening_msg],
    }
    store.sessions[session_id] = session

    return SessionResponse(
        id=session_id,
        scenario_id=body.scenario_id,
        difficulty=body.difficulty,
        started_at=now,
        total_messages=1,
        overall_score=None,
    )


@router.post("/{session_id}/message", response_model=SendMessageResponse)
async def send_message(session_id: str, body: SendMessageRequest):
    session = store.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["ended_at"]:
        raise HTTPException(status_code=400, detail="Session already ended")

    scenario = store.get_scenario(session["scenario_id"])
    system_prompt = build_system_prompt(scenario["ai_role"], scenario["user_role"], session["difficulty"])
    history = [{"role": m["role"], "content": m["content"]} for m in session["messages"]]

    ai_reply, feedback = await get_ai_response(
        system_prompt=system_prompt,
        conversation_history=history,
        user_message=body.content,
        example_opener=scenario["example_opener"],
    )

    now = datetime.now(timezone.utc).isoformat()
    user_msg = {
        "id": _next_msg_id(),
        "role": "user",
        "content": body.content,
        "timestamp": now,
        "grammar_issues": None,
        "corrected_version": None,
        "better_phrasing": None,
        "gujarati_note": None,
        "score": None,
    }

    ai_msg_id = _next_msg_id()
    ai_msg = {
        "id": ai_msg_id,
        "role": "ai",
        "content": ai_reply,
        "timestamp": now,
        "grammar_issues": feedback.issues,
        "corrected_version": feedback.corrected,
        "better_phrasing": feedback.better_phrasing,
        "gujarati_note": feedback.gujarati_note,
        "score": feedback.score,
    }

    session["messages"].append(user_msg)
    session["messages"].append(ai_msg)
    session["total_messages"] += 2

    return SendMessageResponse(ai_reply=ai_reply, feedback=feedback, message_id=ai_msg_id)


@router.get("/{session_id}", response_model=SessionDetailResponse)
async def get_session(session_id: str):
    session = store.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages_out = []
    for m in session["messages"]:
        fb = None
        if m["role"] == "ai" and m["score"] is not None:
            fb = FeedbackSchema(
                has_errors=bool(m["grammar_issues"]),
                corrected=m["corrected_version"] or "",
                issues=m["grammar_issues"] or [],
                better_phrasing=m["better_phrasing"] or "",
                gujarati_note=m["gujarati_note"] or "",
                score=m["score"] or 0,
            )
        messages_out.append(
            MessageResponse(
                id=m["id"],
                role=m["role"],
                content=m["content"],
                timestamp=m["timestamp"],
                feedback=fb,
            )
        )

    return SessionDetailResponse(
        id=session["id"],
        scenario_id=session["scenario_id"],
        difficulty=session["difficulty"],
        started_at=session["started_at"],
        ended_at=session["ended_at"],
        total_messages=session["total_messages"],
        overall_score=session["overall_score"],
        messages=messages_out,
    )


@router.post("/{session_id}/end", response_model=EndSessionResponse)
async def end_session(session_id: str):
    session = store.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    scored = [m for m in session["messages"] if m["score"] is not None]
    if not scored:
        scores = {"overall": 0.0, "grammar": 0.0, "vocabulary": 0.0, "fluency": 0.0, "confidence": 0.0}
    else:
        avg = lambda lst: sum(lst) / len(lst) if lst else 0
        raw = [m["score"] for m in scored]
        grammar_scores    = [min(s + 5 if s > 60 else s - 5, 100) for s in raw]
        vocab_scores      = [min(s + 3 if s > 50 else s, 100) for s in raw]
        confidence_scores = [min(s + 10 if len(session["messages"]) > 4 else s, 100) for s in raw]
        scores = {
            "overall":    round(avg(raw), 1),
            "grammar":    round(avg(grammar_scores), 1),
            "vocabulary": round(avg(vocab_scores), 1),
            "fluency":    round(avg(raw), 1),
            "confidence": round(avg(confidence_scores), 1),
        }

    now = datetime.now(timezone.utc)
    session["ended_at"]         = now
    session["overall_score"]    = scores["overall"]
    session["grammar_score"]    = scores["grammar"]
    session["vocabulary_score"] = scores["vocabulary"]
    session["fluency_score"]    = scores["fluency"]
    session["confidence_score"] = scores["confidence"]

    duration = (now - session["started_at"]).seconds // 60

    st = store.stats
    st["total_sessions"] += 1
    st["total_minutes"]  += duration
    prev_avg   = st["avg_score"]
    prev_count = st["total_sessions"] - 1
    st["avg_score"] = round(
        (prev_avg * prev_count + scores["overall"]) / st["total_sessions"], 1
    )
    if st["avg_score"] >= 80 and st["total_sessions"] >= 3 and st["level"] == "beginner":
        st["level"] = "intermediate"
    elif st["avg_score"] >= 85 and st["total_sessions"] >= 10 and st["level"] == "intermediate":
        st["level"] = "advanced"

    return EndSessionResponse(
        overall_score=scores["overall"],
        grammar_score=scores["grammar"],
        vocabulary_score=scores["vocabulary"],
        fluency_score=scores["fluency"],
        confidence_score=scores["confidence"],
        total_messages=session["total_messages"],
        duration_minutes=duration,
    )
