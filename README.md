# English Speaking App

An AI-powered English conversation learning app for native Gujarati speakers.

## Quick Start

### Prerequisites
- Python 3.11+ with `uv` installed
- Node.js 18+
- PostgreSQL running locally
- Google Gemini API key

### Backend Setup

```bash
cd backend

# Copy env file and add your keys
cp .env.example .env
# Edit .env: set GEMINI_API_KEY and DATABASE_URL

# Install dependencies
uv sync

# Create the database
createdb english_app  # or use pgAdmin

# Run migrations
uv run alembic upgrade head

# Start backend
uv run uvicorn app.main:app --reload --port 8000

uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev

npm run dev -- --host 0.0.0.0
```

Open http://localhost:5173 in Chrome or Edge (required for Web Speech API).

## Project Structure

```
backend/           FastAPI + Python backend
  app/
    main.py        Entry point
    models/        SQLAlchemy models
    routers/       API endpoints
    services/
      gemini.py    Google Gemini AI integration
      seed.py      14 scenario seed data
  alembic/         Database migrations

frontend/          React + Vite + TypeScript
  src/
    pages/         Home, Conversation, Feedback, Progress
    components/    ScenarioCard, MicButton, ChatBubble, FeedbackPanel
    hooks/         useSpeechRecognition, useSpeechSynthesis
    services/      API client
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /api/scenarios | List all 14 scenarios |
| POST | /api/sessions | Start a conversation |
| POST | /api/sessions/{id}/message | Send message, get AI reply + feedback |
| POST | /api/sessions/{id}/end | End session, get scores |
| GET | /api/progress | User stats |
| GET | /api/daily-challenge | Today's challenge |
