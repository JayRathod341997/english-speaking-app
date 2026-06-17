# Bundle backend data into the app — data sync

**Date:** 2026-06-18
**Status:** Approved (design)

## Problem

The app should ship its learning content (conversations, idioms, vocabulary,
flashcards) inside the build rather than fetching it from the backend API.

Investigation showed the frontend **already** bundles this data: `src/services/api.ts`
imports the JSON from `src/data/` at build time and resolves it locally — there are
no runtime API calls for this content. The real gap is that two bundled files are
**stale** relative to the backend's current data.

| File | Frontend bundled | Backend current | Action |
|---|---|---|---|
| `conversations.json` | 475 KB | identical | none |
| `idioms.json` | 97 KB | identical | none |
| `vocabulary_index.json` | 260 KB · 4 categories · 160 words | 1.69 MB · 14 categories · 980 words | refresh |
| `flashcards.json` | 160 cards | (from CSV) 980 cards | regenerate |

## Goal

Refresh the two stale files so the bundled vocabulary and flashcards match the
backend's full dataset (980 words / 980 cards), with **no frontend code changes**
and **no API client**. Provide a re-runnable script so future backend updates can
be re-bundled in one command.

## Non-goals

- No change to how data is consumed (`api.ts` stays as-is).
- No changes to `conversations.json` / `idioms.json` (already in sync).
- No backend changes.

## Design

### 1. Sync script — `frontend/scripts/sync-data.mjs`

A standalone Node ESM script (no new dependencies; uses built-in `fs`/`path` and a
minimal inline CSV parser) that regenerates the bundled data from the backend's
source files. Run via an npm script: `npm run sync-data`.

It performs two operations:

**a. Copy `vocabulary_index.json`**
Direct file copy from `backend/data/vocabulary_index.json` →
`frontend/src/data/vocabulary_index.json`.

Verified drop-in compatible: the backend file is a superset containing the exact
keys `api.ts` reads — `title`, `description`, `language_pair`, `level`,
`total_categories`, `total_words`, `category_summary`, and a `categories[]` array
where each category carries its full `words[]` bodies. Extra keys
(`related_resources`, `quizzes`, `combined_flashcards`) are ignored by the frontend.

**b. Regenerate `flashcards.json` from the CSV**
Parse `backend/data/vocabulary_flashcards_all.csv` (UTF-8 with BOM; the BOM must be
stripped so the first header is `Category`, not `﻿Category`). Emit a JSON array
matching the existing frontend shape — note the key names differ from the CSV
columns:

| CSV column | JSON key |
|---|---|
| (row index, 1-based) | `id` |
| `Category` | `category` |
| `Front` | `frontside` |
| `Back` | `backside` |
| `Pronunciation` | `pronunciation` |
| `PartOfSpeech` | `part_of_speech` |
| `Difficulty` | `difficulty` |
| `Example` | `example` |
| `Tags` | `tags` — split on `;`, each value trimmed, empties dropped |

The `frontside`/`backside` naming (not `front`/`back`) is required because
`flashcardsApi.decks()` in `api.ts:221-222` reads `card.frontside` / `card.backside`.

CSV parsing must handle quoted fields containing commas (e.g. example sentences) and
escaped quotes, since the data uses them.

### 2. Output

Running `npm run sync-data` overwrites:
- `frontend/src/data/vocabulary_index.json`
- `frontend/src/data/flashcards.json`

Both are committed to the repo (they are build inputs, consistent with the existing
setup where these files are already checked in).

## Verification

1. Script runs without error and prints a summary (categories + card count).
2. `flashcards.json` parses as valid JSON with 980 cards; spot-check the first card
   matches the existing format exactly (same keys, `frontside`/`backside`).
3. `vocabulary_index.json` has `total_words: 980`, 14 categories, first category has
   100 words.
4. `npm run build` (Vite + tsc) succeeds — confirms the new data bundles cleanly and
   types still hold.
5. Quick manual check: Vocabulary and Flashcards pages render the expanded dataset.

## Risks

- **Bundle size** grows ~1.4 MB (vocab) + larger flashcards JSON. Acceptable for an
  offline-first app; all data is already imported eagerly. Noted, not blocking.
- **CSV edge cases** (quotes/commas) — mitigated by a quote-aware parser and the
  card-count assertion against the known 980 rows.
