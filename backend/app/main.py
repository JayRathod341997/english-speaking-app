from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import progress, scenarios, sessions

app = FastAPI(title="English Speaking App API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000","https://suhrad-english-app.netlify.app"],
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
