from fastapi import APIRouter

from app import data_store
from app.schemas.content import FlashcardDeckResponse

router = APIRouter(prefix="/api/flashcards", tags=["flashcards"])


@router.get("", response_model=list[FlashcardDeckResponse])
async def list_flashcard_decks():
    """All flashcard decks (grouped by category) with their cards."""
    return data_store.flashcard_decks()
