"""
Assembly script: merges category temp files into vocabulary_index.json and vocabulary_flashcards_all.csv.

Usage: python assemble.py  (run from project root or temp dir)
"""
import json, csv, os, re, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # backend/data
TEMP = os.path.dirname(os.path.abspath(__file__))                    # backend/data/temp
JSON_OUT = os.path.join(BASE, "vocabulary_index.json")
CSV_OUT  = os.path.join(BASE, "vocabulary_flashcards_all.csv")


def make_tag(s: str) -> str:
    """Convert 'Social & Greetings' → 'Social_&_Greetings', 'Picnic / Outing' → 'Picnic_Outing'."""
    s = s.replace("/", "").replace("  ", " ").strip()
    s = s.replace(" ", "_")
    s = re.sub(r"_+", "_", s)
    return s


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Wrote {path}")


# ── 1. Load existing vocabulary_index.json ─────────────────────────────────
print("Loading existing vocabulary_index.json …")
data = load_json(JSON_OUT)

# ── 2. Expand existing categories 1-4 ─────────────────────────────────────
for cat_id in range(1, 5):
    frag_path = os.path.join(TEMP, f"cat_{cat_id}_expansion.json")
    if not os.path.exists(frag_path):
        print(f"  [WARN] Missing {frag_path} – skipping category {cat_id} expansion")
        continue
    frag = load_json(frag_path)
    cat = data["categories"][cat_id - 1]

    # Append new words — skip any whose id is already present (idempotent)
    existing_ids_in_cat = {w["id"] for w in cat["words"]}
    new_words = [w for w in frag.get("new_words", []) if w["id"] not in existing_ids_in_cat]
    if not new_words:
        print(f"  Category {cat_id} already fully expanded – nothing to add")
    cat["words"].extend(new_words)
    cat["total_words"] = len(cat["words"])

    # Recompute subcategory_counts
    counts = {}
    for w in cat["words"]:
        sc = w["subcategory"]
        counts[sc] = counts.get(sc, 0) + 1
    cat["subcategory_counts"] = counts

    # Recompute difficulty_counts
    diff = {}
    for w in cat["words"]:
        d = w["difficulty"]
        diff[d] = diff.get(d, 0) + 1
    cat["difficulty_counts"] = diff

    print(f"  Category {cat_id} '{cat['category']}': {len(cat['words'])} words total")

# ── 3. Add new categories 5-14 ─────────────────────────────────────────────
existing_ids = {c["id"] for c in data["categories"]}
for cat_id in range(5, 15):
    if cat_id in existing_ids:
        print(f"  Category {cat_id} already exists – skipping")
        continue
    frag_path = os.path.join(TEMP, f"cat_{cat_id}.json")
    if not os.path.exists(frag_path):
        print(f"  [WARN] Missing {frag_path} – skipping category {cat_id}")
        continue
    new_cat = load_json(frag_path)
    # Ensure id is set
    new_cat["id"] = cat_id
    data["categories"].append(new_cat)
    print(f"  Added category {cat_id} '{new_cat['category']}': {new_cat.get('total_words', len(new_cat.get('words', [])))} words")

# ── 4. Update top-level metadata ───────────────────────────────────────────
data["total_categories"] = len(data["categories"])
data["total_words"] = sum(len(c["words"]) for c in data["categories"])
data["category_summary"] = [
    {
        "id": c["id"],
        "category": c["category"],
        "total_words": len(c["words"]),
        "subcategories": len(c.get("subcategories", [])),
    }
    for c in data["categories"]
]
print(f"\nFinal: {data['total_categories']} categories, {data['total_words']} words total")

# ── 5. Write vocabulary_index.json ─────────────────────────────────────────
save_json(JSON_OUT, data)

# ── 6. Regenerate vocabulary_flashcards_all.csv ────────────────────────────
print("\nGenerating vocabulary_flashcards_all.csv …")
rows_written = 0
with open(CSV_OUT, "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["Category", "Front", "Back", "Pronunciation", "PartOfSpeech", "Difficulty", "Example", "Tags"])
    for cat in data["categories"]:
        cat_tag = make_tag(cat["category"])
        for word in cat["words"]:
            category    = word["category"]
            front       = word["word"]
            back        = word["gujarati_meaning"]
            pron        = word["gujarati_pronunciation"]
            pos         = word["part_of_speech"]
            difficulty  = word["difficulty"]
            example     = word["examples"][0] if word.get("examples") else ""
            subcat_tag  = make_tag(word.get("subcategory", ""))
            tags        = f"{cat_tag}; {subcat_tag}; {difficulty}"
            writer.writerow([category, front, back, pron, pos, difficulty, example, tags])
            rows_written += 1

print(f"Wrote {rows_written} rows (+ header) -> {CSV_OUT}")

# ── 7. Verification summary ────────────────────────────────────────────────
print("\n── Verification ──────────────────────────────────────────────────────")
print(f"total_categories : {data['total_categories']} (expected 14)")
print(f"total_words      : {data['total_words']} (expected 1400)")
for c in data["categories"]:
    wc = len(c["words"])
    dq = "✓ quiz" if "quiz" in c else "✗ no quiz"
    dd = "✓ dialogues" if c.get("mini_dialogues") else "✗ no dialogues"
    flag = "✓" if wc == 100 else f"✗ ({wc})"
    print(f"  [{c['id']:2d}] {c['category']:<30} {flag:8}  {dq}  {dd}")
print("──────────────────────────────────────────────────────────────────────")
print("Done.")
