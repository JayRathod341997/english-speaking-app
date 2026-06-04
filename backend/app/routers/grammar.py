from fastapi import APIRouter, HTTPException

from app import data_store

router = APIRouter(prefix="/api/grammar", tags=["grammar"])


@router.get("")
async def list_grammar():
    """Lightweight index: collection meta + chapter summaries (no bodies)."""
    return data_store.grammar_index()


@router.get("/{slug}")
async def get_grammar_chapter(slug: str):
    chapter = data_store.get_grammar_chapter(slug)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter
