from fastapi import APIRouter, HTTPException

from app import data_store
from app.schemas.content import VocabIndexResponse

router = APIRouter(prefix="/api/vocabulary", tags=["vocabulary"])


@router.get("", response_model=VocabIndexResponse)
async def get_vocab_index():
    """Lightweight: metadata + category summaries (no word bodies)."""
    return data_store.vocab_index()


@router.get("/categories/{category_id}")
async def get_category(category_id: int):
    """Full category: words + mini_dialogues + quiz. Returned as a raw dict."""
    category = data_store.get_vocab_category(category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category
