from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import progress, scenarios, sessions

app = FastAPI(title="English Speaking App API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://localhost:5173",
        "http://localhost:5174",
        "https://localhost:5174",
        "http://127.0.0.1:5173",
        "https://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://127.0.0.1:5174",
        "http://localhost:3000",
        "https://suhrad-english-app.netlify.app",
        "http://192.168.1.2:5173",
        "https://192.168.1.2:5173",
        "http://192.168.1.2:5174",
        "https://192.168.1.2:5174",
        "https://www.suhrad-english-app.dev"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scenarios.router)
app.include_router(sessions.router)
app.include_router(progress.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
