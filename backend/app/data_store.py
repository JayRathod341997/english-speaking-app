"""Static learning content (idioms + vocabulary) loaded from the data/ folder.

Kept separate from store.py so runtime session state and static content stay
decoupled. The data/ folder is a sibling of backend/ at the repo root.
"""
import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[2] / "data"


def _load(filename: str) -> dict:
    with open(DATA_DIR / filename, encoding="utf-8") as f:
        return json.load(f)


IDIOMS: dict = _load("idioms.json")
VOCABULARY: dict = _load("vocabulary_index.json")


def get_idiom(idiom_id: int) -> dict | None:
    return next((i for i in IDIOMS.get("idioms", []) if i.get("id") == idiom_id), None)


def get_vocab_category(category_id: int) -> dict | None:
    return next(
        (c for c in VOCABULARY.get("categories", []) if c.get("id") == category_id),
        None,
    )


def vocab_index() -> dict:
    """Lightweight top-level payload: metadata + category_summary (no word bodies)."""
    return {
        "title": VOCABULARY.get("title"),
        "description": VOCABULARY.get("description"),
        "language_pair": VOCABULARY.get("language_pair"),
        "level": VOCABULARY.get("level"),
        "total_categories": VOCABULARY.get("total_categories"),
        "total_words": VOCABULARY.get("total_words"),
        "category_summary": VOCABULARY.get("category_summary", []),
    }
