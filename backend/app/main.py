from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import (
    conversations,
    flashcards,
    grammar,
    idioms,
    progress,
    scenarios,
    sessions,
    vocabulary,
)

app = FastAPI(title="English Speaking App API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scenarios.router)
app.include_router(sessions.router)
app.include_router(progress.router)
app.include_router(idioms.router)
app.include_router(vocabulary.router)
app.include_router(conversations.router)
app.include_router(flashcards.router)
app.include_router(grammar.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
