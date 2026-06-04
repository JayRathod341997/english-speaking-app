"""Static learning content (idioms + vocabulary) loaded from the data/ folder.

Kept separate from store.py so runtime session state and static content stay
decoupled. The data/ folder lives inside backend/ so the backend ships as a
self-contained deployable unit.
"""
import csv
import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
GRAMMAR_DIR = DATA_DIR / "grammar-content"


def _load(filename: str) -> dict:
    with open(DATA_DIR / filename, encoding="utf-8") as f:
        return json.load(f)


def _load_grammar(filename: str) -> dict:
    with open(GRAMMAR_DIR / filename, encoding="utf-8") as f:
        return json.load(f)


def _load_list(filename: str) -> list:
    with open(DATA_DIR / filename, encoding="utf-8") as f:
        return json.load(f)


def _load_flashcards(filename: str) -> list[dict]:
    # utf-8-sig strips the BOM so the first header isn't "﻿Category".
    with open(DATA_DIR / filename, encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    return [
        {
            "id": i,
            "category": r["Category"],
            "front": r["Front"],
            "back": r["Back"],
            "pronunciation": r["Pronunciation"],
            "part_of_speech": r["PartOfSpeech"],
            "difficulty": r["Difficulty"],
            "example": r["Example"],
            "tags": [t.strip() for t in r["Tags"].split(";") if t.strip()],
        }
        for i, r in enumerate(rows, start=1)
    ]


IDIOMS: dict = _load("idioms.json")
VOCABULARY: dict = _load("vocabulary_index.json")
CONVERSATIONS: list = _load_list("conversations.json")
FLASHCARDS: list = _load_flashcards("vocabulary_flashcards_all.csv")

GRAMMAR_INDEX: dict = _load_grammar("index.json")
# Eagerly load every chapter body, keyed by slug (20 small files).
GRAMMAR_CHAPTERS: dict = {
    ch["slug"]: _load_grammar(ch["file"])
    for ch in GRAMMAR_INDEX.get("chapters", [])
}


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


def conversations_index() -> list[dict]:
    """Lightweight list: id/title/speakers/turn_count only (no turn bodies)."""
    return [
        {
            "id": c["id"],
            "title": c["title"],
            "speakers": c.get("speakers", []),
            "turn_count": c.get("turn_count", len(c.get("turns", []))),
        }
        for c in CONVERSATIONS
    ]


def get_conversation(conversation_id: str) -> dict | None:
    # ids are strings with gaps in the data, so compare as strings.
    return next(
        (c for c in CONVERSATIONS if str(c.get("id")) == str(conversation_id)), None
    )


def flashcard_decks() -> list[dict]:
    """Flashcards grouped into decks by category, preserving file order."""
    decks: dict[str, list] = {}
    for card in FLASHCARDS:
        decks.setdefault(card["category"], []).append(card)
    return [
        {"category": category, "total": len(cards), "cards": cards}
        for category, cards in decks.items()
    ]


def _grammar_level(order: int) -> str:
    """Derive a difficulty band from chapter order (no level field in the data)."""
    if order <= 7:
        return "Beginner"
    if order <= 14:
        return "Intermediate"
    return "Advanced"


def grammar_index() -> dict:
    """Lightweight payload: collection meta + chapter summaries (no bodies)."""
    chapters = []
    for ch in GRAMMAR_INDEX.get("chapters", []):
        body = GRAMMAR_CHAPTERS.get(ch["slug"], {})
        chapters.append(
            {
                "id": ch["id"],
                "slug": ch["slug"],
                "order": ch["order"],
                "title": ch["title"],
                "summary": body.get("summary"),
                "level": _grammar_level(ch["order"]),
                "explanation_count": len(body.get("explanations", [])),
                "practice_count": len(body.get("practice", [])),
            }
        )
    chapters.sort(key=lambda c: c["order"])
    return {
        "collection": GRAMMAR_INDEX.get("collection"),
        "total_chapters": len(chapters),
        "chapters": chapters,
    }


def get_grammar_chapter(slug: str) -> dict | None:
    return GRAMMAR_CHAPTERS.get(slug)
