from fastapi import APIRouter, HTTPException

from app import data_store
from app.schemas.content import ConversationDetail, ConversationSummary

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationSummary])
async def list_conversations():
    """Lightweight: id/title/speakers/turn_count (no turn bodies)."""
    return data_store.conversations_index()


@router.get("/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(conversation_id: str):
    conversation = data_store.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation
