from datetime import datetime
from pydantic import BaseModel


class FeedbackSchema(BaseModel):
    has_errors: bool
    corrected: str
    issues: list[str]
    better_phrasing: str
    gujarati_note: str
    score: float


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    timestamp: datetime
    feedback: FeedbackSchema | None = None

    class Config:
        from_attributes = True


class SendMessageRequest(BaseModel):
    content: str


class SendMessageResponse(BaseModel):
    ai_reply: str
    feedback: FeedbackSchema
    message_id: int


class StartSessionRequest(BaseModel):
    scenario_id: int
    difficulty: str = "beginner"


class SessionResponse(BaseModel):
    id: str
    scenario_id: int
    difficulty: str
    started_at: datetime
    total_messages: int
    overall_score: float | None = None

    class Config:
        from_attributes = True


class SessionDetailResponse(SessionResponse):
    messages: list[MessageResponse]
    ended_at: datetime | None = None


class ScenarioResponse(BaseModel):
    id: int
    category: str
    title: str
    description: str
    difficulty: str
    ai_role: str
    user_role: str
    example_opener: str
    icon: str
    estimated_minutes: int

    class Config:
        from_attributes = True


class EndSessionResponse(BaseModel):
    overall_score: float
    grammar_score: float
    vocabulary_score: float
    fluency_score: float
    confidence_score: float
    total_messages: int
    duration_minutes: int


class ProgressResponse(BaseModel):
    total_sessions: int
    total_minutes: int
    current_streak: int
    best_streak: int
    vocabulary_count: int
    avg_score: float
    level: str
    recent_sessions: list[SessionResponse]


class DailyChallengeResponse(BaseModel):
    scenario_id: int
    prompt: str
    target_phrases: list[str]
    date: str
