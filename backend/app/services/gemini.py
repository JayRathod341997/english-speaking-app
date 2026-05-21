import json
import re
from google import genai
from google.genai import types

from app.config import settings
from app.schemas.conversation import FeedbackSchema

client = genai.Client(api_key=settings.gemini_api_key)

SYSTEM_PROMPT_TEMPLATE = """You are {ai_role} in a real-life English conversation.
The user is a native Gujarati speaker who is learning English. Their current level is {level}.

Your TWO jobs:
1. Stay fully in character as {ai_role} and keep the conversation realistic and engaging.
2. After every user message, evaluate their English and give structured feedback.

Common mistakes Gujarati speakers make that you should watch for:
- Using continuous tense wrongly: "I am knowing" → should be "I know"
- Using "have" wrong: "He is having a car" → "He has a car"
- Missing articles: "I went to hospital" → "I went to the hospital"
- "Do the needful" → "Please take care of this"
- Literal Gujarati translations that sound unnatural in English

ALWAYS respond in this exact JSON format (no extra text, only JSON):
{{
  "reply": "<your in-character response as {ai_role}>",
  "feedback": {{
    "has_errors": true or false,
    "corrected": "<corrected version of exactly what the user said, or same if no errors>",
    "issues": ["<specific issue 1>", "<specific issue 2>"],
    "better_phrasing": "<a more natural, native-speaker way to say it>",
    "gujarati_note": "<brief helpful note in simple English or 1 Gujarati word if needed>",
    "score": <number 0 to 100>
  }}
}}

Scoring guide:
- 90-100: Near-perfect, natural English
- 70-89: Good with minor issues
- 50-69: Understood but noticeable errors
- 30-49: Many errors, hard to follow
- 0-29: Major communication breakdown

User's role in this scenario: {user_role}
"""


def build_system_prompt(ai_role: str, user_role: str, level: str) -> str:
    return SYSTEM_PROMPT_TEMPLATE.format(ai_role=ai_role, user_role=user_role, level=level)


def parse_gemini_response(raw: str) -> dict:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw)
    return json.loads(raw)


async def get_ai_response(
    system_prompt: str,
    conversation_history: list[dict],
    user_message: str,
    example_opener: str,
) -> tuple[str, FeedbackSchema]:
    # Seed history: opener is always first model turn
    opener_json = json.dumps({"reply": example_opener, "feedback": {
        "has_errors": False, "corrected": "", "issues": [],
        "better_phrasing": "", "gujarati_note": "", "score": 100,
    }})

    gemini_history: list[types.Content] = [
        types.Content(role="model", parts=[types.Part(text=opener_json)])
    ]

    # Append saved turns, skipping the stored opener (first ai message)
    skip_first_ai = True
    for msg in conversation_history:
        if skip_first_ai and msg["role"] == "ai":
            skip_first_ai = False
            continue
        role = "user" if msg["role"] == "user" else "model"
        gemini_history.append(
            types.Content(role=role, parts=[types.Part(text=msg["content"])])
        )

    chat = client.aio.chats.create(
        model="gemini-2.0-flash",
        history=gemini_history,
        config=types.GenerateContentConfig(system_instruction=system_prompt),
    )
    response = await chat.send_message(user_message)

    parsed = parse_gemini_response(response.text)

    feedback = FeedbackSchema(
        has_errors=parsed["feedback"]["has_errors"],
        corrected=parsed["feedback"]["corrected"],
        issues=parsed["feedback"].get("issues", []),
        better_phrasing=parsed["feedback"]["better_phrasing"],
        gujarati_note=parsed["feedback"]["gujarati_note"],
        score=float(parsed["feedback"]["score"]),
    )

    return parsed["reply"], feedback


async def get_opening_message(_ai_role: str, example_opener: str) -> str:
    return example_opener
