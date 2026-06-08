#!/usr/bin/env python3
"""
generate_vocab.py — Generates all vocabulary content using Groq API.
Produces cat_1_expansion.json through cat_4_expansion.json (60 new words each)
and cat_5.json through cat_14.json (100 words + dialogues + quiz each).

Run from: backend/data/temp/
    python generate_vocab.py
"""

import json, os, sys, time
from pathlib import Path
from dotenv import load_dotenv

TEMP_DIR = Path(__file__).parent                   # backend/data/temp/
BACKEND_DIR = TEMP_DIR.parent.parent               # backend/
load_dotenv(BACKEND_DIR / ".env")

try:
    from groq import Groq
except ImportError:
    print("groq package not found. Run: pip install groq")
    sys.exit(1)

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

# ── Style examples drawn from existing data ───────────────────────────────────
STYLE_EXAMPLE = """
EXACT STYLE TO FOLLOW (from the existing dataset):
{
  "word": "Acquaintance",
  "gujarati_pronunciation": "એક્વેઇન્ટન્સ",
  "gujarati_meaning": "ઓળખીતું વ્યક્તિ — જેને થોડું ઓળખો છો પણ ગાઢ મિત્ર નથી.",
  "memory_tip": "'acquaint' = ઓળખાણ કરાવવી -> acquaintance = ઓળખીતું."
}
{
  "word": "Catch up",
  "gujarati_pronunciation": "કેચ અπ",
  "gujarati_meaning": "ફરī મǳ-Līne ek-bijAnA samAcAr jANvA; pAChaL raHi gayelU pUrU karī levU.",
  "memory_tip": "pAChaL raHi gayelAne paDakī levU = catch up."
}
{
  "word": "Cordial",
  "gujarati_pronunciation": "કોર્ડિયયλ",
  "gujarati_meaning": "uShmAbharyU, maItrIpUrNA ane niKhaLasa.",
  "memory_tip": "diLathI (cor- = heart) uShmAbharyU = cordial."
}

CRITICAL RULES for Gujarati fields:
- gujarati_pronunciation: Write HOW the English word SOUNDS in Gujarati script (phonetic transliteration). E.g. "Compliment" -> "કૉmpλiment" (approximate sound).
- gujarati_meaning: Write a complete, natural Gujarati sentence explaining what the word means.
- memory_tip: Start with the English word/root in single quotes, then '=' Gujarati explanation, then '->' the word meaning. Mix English and Gujarati naturally.
- ALL Gujarati text must use actual Gujarati Unicode script (gu), NOT romanized Latin text.
"""

# ── Category definitions ──────────────────────────────────────────────────────

EXPANSIONS = {
    1: {
        "name": "Everyday Situations",
        "subcategories": {
            "Social & Greetings": {
                "avoid": ["Acquaintance","Catch up","Drop by","Mingle","Cordial","Mutual","Get acquainted"],
                "count": 10
            },
            "Polite Requests & Responses": {
                "avoid": ["Appreciate","Would you mind","By all means","My pleasure","Beg your pardon","I'd rather","Much obliged"],
                "count": 10
            },
            "Asking & Navigation": {
                "avoid": ["Whereabouts","Vicinity","Detour","Head towards","Around the corner","Bound for"],
                "count": 10
            },
            "Managing Daily Tasks": {
                "avoid": ["Manage","Sort out","Figure out","Postpone","Reschedule","Run errands","Drop off"],
                "count": 10
            },
            "Feelings & States": {
                "avoid": ["Exhausted","Overwhelmed","Content","Anxious","Relieved","Frustrated","Swamped"],
                "count": 10
            },
            "Time & Routine": {
                "avoid": ["Meanwhile","Eventually","Beforehand","In the meantime","Sooner or later","For the time being"],
                "count": 10
            }
        }
    },
    2: {
        "name": "Places",
        "subcategories": {
            "Around Town": {
                "avoid": ["Downtown","Suburb","Outskirts","Neighbourhood","Locality","Metropolis","Residential area"],
                "count": 10
            },
            "Buildings & Their Parts": {
                "avoid": ["Premises","Lobby","Foyer","Corridor","Basement","Terrace","Courtyard"],
                "count": 10
            },
            "Travel & Transit": {
                "avoid": ["Terminal","Junction","Platform","Depot","Lodge","Hostel"],
                "count": 10
            },
            "Shops & Services": {
                "avoid": ["Pharmacy","Kiosk","Outlet","Branch","Warehouse","Boutique","Grocer's"],
                "count": 10
            },
            "Describing Places": {
                "avoid": ["Bustling","Quaint","Picturesque","Secluded","Run-down","Spacious","Deserted"],
                "count": 10
            },
            "Location Phrases": {
                "avoid": ["A stone's throw away","Off the beaten track","In the heart of","Within walking distance","Miles from anywhere","On the doorstep"],
                "count": 10
            }
        }
    },
    3: {
        "name": "Picnic / Outing",
        "subcategories": {
            "Planning the Outing": {
                "avoid": ["Outing","Getaway","Excursion","Day trip","Itinerary","Venue","Gathering"],
                "count": 10
            },
            "Picnic Essentials": {
                "avoid": ["Hamper","Picnic rug","Flask","Cutlery","Refreshments","Leftovers","Disposable"],
                "count": 10
            },
            "The Outdoor Setting": {
                "avoid": ["Meadow","Riverbank","Clearing","Shade","Lawn","Grove","Trail"],
                "count": 10
            },
            "Activities & Fun": {
                "avoid": ["Stroll","Wander","Sightseeing","Unwind","Barbecue","Hike","Lounge"],
                "count": 10
            },
            "Weather & Conditions": {
                "avoid": ["Overcast","Breeze","Drizzle","Scorching","Humid","Pleasant"],
                "count": 10
            },
            "Describing the Experience": {
                "avoid": ["In the open air","Make the most of","A change of scenery","Picture-perfect","Laid-back","Breathtaking"],
                "count": 10
            }
        }
    },
    4: {
        "name": "Food & Eating",
        "subcategories": {
            "Taste & Flavour": {
                "avoid": ["Savoury","Bland","Tangy","Mouth-watering","Rich","Stale","Zesty"],
                "count": 10
            },
            "Cooking & Preparation": {
                "avoid": ["Simmer","Sauté","Marinate","Whisk","Knead","Season","Garnish"],
                "count": 10
            },
            "Eating Out": {
                "avoid": ["Cuisine","Appetiser","Main course","Beverage","The bill","Tip","Reservation"],
                "count": 10
            },
            "Diet & Health": {
                "avoid": ["Nutritious","Wholesome","Portion","Crave","Overeat","Balanced diet"],
                "count": 10
            },
            "Hunger & Appetite": {
                "avoid": ["Famished","Peckish","Appetite","Full up","Nibble","Devour"],
                "count": 10
            },
            "Describing a Meal": {
                "avoid": ["Delicacy","Helping","Homemade","Piping hot","Grab a bite","Eat out","Tuck in"],
                "count": 10
            }
        }
    }
}

NEW_CATEGORIES = {
    5: {
        "name": "Work & Office",
        "level": "Intermediate to Advanced",
        "subcategories": [
            ("Professional Communication", 17),
            ("Office Environment", 17),
            ("Meetings & Presentations", 17),
            ("Career & Employment", 17),
            ("Deadlines & Productivity", 16),
            ("Workplace Relationships", 16)
        ]
    },
    6: {
        "name": "Health & Medicine",
        "level": "Intermediate to Advanced",
        "subcategories": [
            ("Symptoms & Conditions", 17),
            ("Medical Appointments", 17),
            ("Treatments & Medicines", 17),
            ("Body Parts & Functions", 17),
            ("Mental Health & Wellness", 16),
            ("Emergency & First Aid", 16)
        ]
    },
    7: {
        "name": "Education & Learning",
        "level": "Intermediate to Advanced",
        "subcategories": [
            ("Classroom Language", 17),
            ("Academic Writing", 17),
            ("Study Habits", 17),
            ("Examinations & Grades", 17),
            ("School & University Life", 16),
            ("Knowledge & Understanding", 16)
        ]
    },
    8: {
        "name": "Travel & Tourism",
        "level": "Intermediate to Advanced",
        "subcategories": [
            ("Planning a Trip", 17),
            ("Airport & Transport", 17),
            ("Hotels & Accommodation", 17),
            ("Sightseeing & Culture", 17),
            ("Travel Problems", 16),
            ("Describing Experiences", 16)
        ]
    },
    9: {
        "name": "Technology & Digital Life",
        "level": "Intermediate to Advanced",
        "subcategories": [
            ("Devices & Hardware", 17),
            ("Internet & Apps", 17),
            ("Social Media", 17),
            ("Online Communication", 17),
            ("Digital Problems", 16),
            ("Technology Verbs", 16)
        ]
    },
    10: {
        "name": "Shopping & Money",
        "level": "Intermediate to Advanced",
        "subcategories": [
            ("Types of Shops", 17),
            ("Buying & Selling", 17),
            ("Prices & Bargaining", 17),
            ("Banking & Finance", 17),
            ("Currency & Payments", 16),
            ("Describing Products", 16)
        ]
    },
    11: {
        "name": "Family & Relationships",
        "level": "Intermediate to Advanced",
        "subcategories": [
            ("Family Members", 17),
            ("Relationships & Romance", 17),
            ("Emotions & Expressions", 17),
            ("Life Events & Milestones", 17),
            ("Conflicts & Resolution", 16),
            ("Home & Domestic Life", 16)
        ]
    },
    12: {
        "name": "Weather & Nature",
        "level": "Intermediate to Advanced",
        "subcategories": [
            ("Weather Conditions", 17),
            ("Seasons & Climate", 17),
            ("Natural Features", 17),
            ("Plants & Wildlife", 17),
            ("Environmental Issues", 16),
            ("Natural Disasters", 16)
        ]
    },
    13: {
        "name": "Entertainment & Leisure",
        "level": "Intermediate to Advanced",
        "subcategories": [
            ("Film & TV", 17),
            ("Music & Performing Arts", 17),
            ("Books & Reading", 17),
            ("Hobbies & Crafts", 17),
            ("Games & Activities", 16),
            ("Going Out & Socialising", 16)
        ]
    },
    14: {
        "name": "Sports & Fitness",
        "level": "Intermediate to Advanced",
        "subcategories": [
            ("Sports Types & Vocabulary", 17),
            ("Training & Exercise", 17),
            ("Competitions & Events", 17),
            ("Sports Equipment", 17),
            ("Coaches & Players", 16),
            ("Health & Performance", 16)
        ]
    }
}

# ── API helpers ───────────────────────────────────────────────────────────────

CALL_DELAY = 30   # seconds between API calls to stay under Groq TPM limit

def call_groq(prompt: str, max_tokens: int = 4000, retries: int = 5) -> dict | list | None:
    for attempt in range(retries):
        try:
            resp = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=max_tokens,
            )
            return json.loads(resp.choices[0].message.content)
        except Exception as e:
            err = str(e)
            wait = 60 if "rate_limit" in err.lower() or "429" in err else (2 ** attempt)
            print(f"    API error (attempt {attempt+1}/{retries}): {e}")
            print(f"    Waiting {wait}s before retry...")
            time.sleep(wait)
    return None


def extract_list(data: dict, *keys) -> list:
    """Try several key names to find the list in the response."""
    for k in keys:
        if k in data and isinstance(data[k], list):
            return data[k]
    for v in data.values():
        if isinstance(v, list):
            return v
    return []


# ── Word generation ───────────────────────────────────────────────────────────

def generate_words(category_name: str, subcategory: str, count: int,
                   avoid: list[str], start_id: int) -> list[dict]:
    avoid_str = ", ".join(avoid) if avoid else "none"

    prompt = f"""{STYLE_EXAMPLE}

Generate exactly {count} English vocabulary words for the "{subcategory}" subcategory of the "{category_name}" vocabulary set (English learning app for Gujarati speakers, Intermediate-Advanced level).

Do NOT include these words (already in dataset): {avoid_str}

Return a JSON object: {{"words": [...]}}

Each word object MUST contain ALL of these fields:
{{
  "id": {start_id},          (increment by 1 for each word)
  "word": "...",             (English word or phrase)
  "category": "{category_name}",
  "subcategory": "{subcategory}",
  "part_of_speech": "...",   (noun / verb / adjective / adverb / phrasal verb / noun phrase / adjective phrase)
  "difficulty": "...",       (Intermediate OR Advanced)
  "frequency": "...",        (Very common / Common / Less common)
  "gujarati_pronunciation": "...",  (GUJARATI SCRIPT — phonetic sound of the English word)
  "english_meaning": "...",         (clear 1-2 sentence English definition)
  "gujarati_meaning": "...",        (full Gujarati sentence explaining meaning in context)
  "synonyms": ["...", "..."],       (2-3 English synonyms)
  "antonyms": ["...", "..."],       (1-2 English antonyms; [] if none)
  "collocations": ["...", "...", "..."],  (2-3 natural collocations)
  "word_forms": ["..."],            (related forms; [] if minimal)
  "usage_note": "...",              (brief English note on usage, register, or common mistakes)
  "memory_tip": "...",              (GUJARATI SCRIPT — 'English_root' = Gujarati_keyword -> meaning)
  "examples": ["...", "...", "...", "..."]  (exactly 4 natural English sentences)
}}

IMPORTANT: Use real Gujarati Unicode script for gujarati_pronunciation, gujarati_meaning, and memory_tip. Do not use romanized text in those fields."""

    data = call_groq(prompt, max_tokens=4000)
    if not data:
        return []

    words = extract_list(data, "words", "items", "vocabulary")
    if not words:
        print(f"    WARNING: No words list found in response keys: {list(data.keys())}")
        return []

    for i, w in enumerate(words):
        w["id"] = start_id + i
        w.setdefault("category", category_name)
        w.setdefault("subcategory", subcategory)
        # Ensure examples is a list of 4
        if not isinstance(w.get("examples"), list):
            w["examples"] = []
        while len(w["examples"]) < 4:
            w["examples"].append(f"Example sentence for {w.get('word', '?')}.")
        w["examples"] = w["examples"][:4]

    time.sleep(CALL_DELAY)
    return words[:count]


# ── Mini-dialogue generation ──────────────────────────────────────────────────

def generate_dialogues(category_name: str, word_sample: list[str]) -> list[dict]:
    words_str = ", ".join(word_sample[:25])
    prompt = f"""Create exactly 5 short natural English dialogues for a vocabulary learning app focused on "{category_name}".

Each dialogue should:
- Have a realistic everyday situation as its setting
- Be 4-6 turns (alternating Speaker A and Speaker B)
- Use vocabulary from this word list naturally: {words_str}
- Feel authentic, not textbook-stilted

Return JSON object: {{"dialogues": [...]}}

Each dialogue format:
{{
  "id": 1,
  "title": "Short descriptive title",
  "situation": "One sentence describing the setting/context",
  "turns": [
    {{"speaker": "A", "text": "..."}},
    {{"speaker": "B", "text": "..."}}
  ],
  "words_used": ["word1", "word2", "word3"]
}}"""

    data = call_groq(prompt, max_tokens=4000)
    if not data:
        return []
    return extract_list(data, "dialogues", "mini_dialogues", "conversations")


# ── Quiz generation ───────────────────────────────────────────────────────────

def generate_quiz(category_name: str, words: list[dict]) -> dict:
    quiz_words = words[:20]
    word_refs = [{"id": w["id"], "word": w["word"], "english_meaning": w.get("english_meaning", ""),
                  "gujarati_meaning": w.get("gujarati_meaning", "")} for w in quiz_words]

    prompt = f"""Create a 15-question vocabulary quiz for "{category_name}" (English learning for Gujarati speakers).

Reference words (use word_id from id field):
{json.dumps(word_refs, ensure_ascii=False, indent=2)}

Mix question types: meaning_en_to_gu, meaning_gu_to_en, synonym, antonym, fill_blank, definition
Each question has 4 options (A/B/C/D) and one correct answer.

Return JSON: {{"quiz": {{...}}}}

Quiz object format:
{{
  "title": "...",
  "category": "{category_name}",
  "level": "Intermediate to Advanced",
  "instructions": "Choose the best answer for each question.",
  "total_questions": 15,
  "questions": [
    {{
      "id": 1,
      "type": "meaning_en_to_gu",
      "word_id": 1,
      "question": "What does 'Word' mean in Gujarati?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "A"
    }}
  ]
}}"""

    data = call_groq(prompt, max_tokens=4000)
    if not data:
        return {}
    quiz = data.get("quiz", data)
    if isinstance(quiz, dict) and "questions" in quiz:
        return quiz
    return {}


# ── Expansion generator (categories 1-4) ─────────────────────────────────────

def generate_expansion(cat_id: int, cat_info: dict):
    out_path = TEMP_DIR / f"cat_{cat_id}_expansion.json"
    if out_path.exists():
        existing = json.loads(out_path.read_text(encoding="utf-8"))
        if len(existing.get("new_words", [])) == 60:
            print(f"  {out_path.name} already complete - skipping")
            return
        print(f"  {out_path.name} incomplete - regenerating")

    print(f"\n> Expanding Category {cat_id}: {cat_info['name']}")
    all_words = []
    next_id = 41

    for subcategory, info in cat_info["subcategories"].items():
        count = info["count"]
        avoid = info["avoid"]
        print(f"  [{next_id}-{next_id+count-1}] {subcategory} ({count} words)...")
        words = generate_words(cat_info["name"], subcategory, count, avoid, next_id)
        print(f"    -> got {len(words)} words")
        all_words.extend(words)
        next_id += count

    out_path.write_text(
        json.dumps({"new_words": all_words}, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"  Saved {len(all_words)} words -> {out_path.name}")


# ── New category generator (categories 5-14) ─────────────────────────────────

def generate_new_category(cat_id: int, cat_info: dict):
    out_path = TEMP_DIR / f"cat_{cat_id}.json"
    if out_path.exists():
        existing = json.loads(out_path.read_text(encoding="utf-8"))
        if len(existing.get("words", [])) == 100:
            print(f"  {out_path.name} already complete - skipping")
            return
        print(f"  {out_path.name} incomplete - regenerating")

    print(f"\n> New Category {cat_id}: {cat_info['name']}")
    all_words = []
    next_id = 1

    for subcategory, count in cat_info["subcategories"]:
        print(f"  [{next_id}-{next_id+count-1}] {subcategory} ({count} words)...")
        words = generate_words(cat_info["name"], subcategory, count, [], next_id)
        print(f"    -> got {len(words)} words")
        all_words.extend(words)
        next_id += count

    # Counts
    subcat_counts: dict[str, int] = {}
    diff_counts: dict[str, int] = {}
    for w in all_words:
        sc = w.get("subcategory", "")
        subcat_counts[sc] = subcat_counts.get(sc, 0) + 1
        d = w.get("difficulty", "Intermediate")
        diff_counts[d] = diff_counts.get(d, 0) + 1

    subcategories = [sc for sc, _ in cat_info["subcategories"]]

    # Mini-dialogues
    print(f"  Generating 5 mini-dialogues...")
    dialogues = generate_dialogues(cat_info["name"], [w["word"] for w in all_words])
    print(f"    -> got {len(dialogues)} dialogues")
    time.sleep(CALL_DELAY)

    # Quiz
    print(f"  Generating 15-question quiz...")
    quiz = generate_quiz(cat_info["name"], all_words)
    print(f"    -> quiz has {len(quiz.get('questions', []))} questions")
    time.sleep(CALL_DELAY)

    cat_obj = {
        "id": cat_id,
        "category": cat_info["name"],
        "level": cat_info["level"],
        "total_words": len(all_words),
        "subcategories": subcategories,
        "subcategory_counts": subcat_counts,
        "difficulty_counts": diff_counts,
        "words": all_words,
        "mini_dialogues": dialogues,
        "quiz": quiz
    }

    out_path.write_text(
        json.dumps(cat_obj, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"  Saved -> {out_path.name}")


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=== Vocabulary Generator ===")
    print(f"Model : {MODEL}")
    print(f"Output: {TEMP_DIR}\n")

    if not os.environ.get("GROQ_API_KEY"):
        print("ERROR: GROQ_API_KEY not found. Check backend/.env")
        sys.exit(1)

    # Phase 1 — expand existing categories 1-4
    print("--- Phase 1: Expanding categories 1-4 ---")
    for cat_id, cat_info in EXPANSIONS.items():
        generate_expansion(cat_id, cat_info)

    # Phase 2 — generate new categories 5-14
    print("\n--- Phase 2: Generating new categories 5-14 ---")
    for cat_id, cat_info in NEW_CATEGORIES.items():
        generate_new_category(cat_id, cat_info)

    print("\n=== Done! Run assemble.py next. ===")
