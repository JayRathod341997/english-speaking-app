"""Response schemas for static learning content (idioms, vocabulary,
conversations, flashcards).

Field names mirror the data files exactly. extra="ignore" keeps these resilient
to extra keys present in the JSON. Detail endpoints return raw dicts; these
schemas document/validate the list & summary shapes.
"""
from pydantic import BaseModel, ConfigDict


class IdiomResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: int
    idiom: str
    category: str
    difficulty: str
    english_meaning: str
    gujarati_meaning: str
    examples: list[str]


class IdiomsLibraryResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str | None = None
    description: str | None = None
    total_idioms: int
    categories: list[str]
    difficulty_levels: list[str]
    category_counts: dict[str, int]
    difficulty_counts: dict[str, int]
    idioms: list[IdiomResponse]


class CategorySummaryResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: int
    category: str
    total_words: int
    subcategories: int | None = None


class VocabIndexResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str | None = None
    description: str | None = None
    language_pair: str | None = None
    level: str | None = None
    total_categories: int | None = None
    total_words: int | None = None
    category_summary: list[CategorySummaryResponse]


class ConversationTurn(BaseModel):
    model_config = ConfigDict(extra="ignore")

    order: int
    speaker: str
    text: str


class ConversationSummary(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    title: str
    speakers: list[str]
    turn_count: int


class ConversationDetail(ConversationSummary):
    turns: list[ConversationTurn]


class FlashcardResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: int
    category: str
    front: str
    back: str
    pronunciation: str
    part_of_speech: str
    difficulty: str
    example: str
    tags: list[str]


class FlashcardDeckResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    category: str
    total: int
    cards: list[FlashcardResponse]
