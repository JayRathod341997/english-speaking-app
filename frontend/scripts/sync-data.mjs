// Regenerates the bundled learning data from the backend's source files.
//
//   node scripts/sync-data.mjs   (or: npm run sync-data)
//
// Two operations:
//   1. Copy backend/data/vocabulary_index.json -> src/data/vocabulary_index.json
//      (drop-in superset; the frontend reads category_summary + categories[].words[])
//   2. Regenerate src/data/flashcards.json from backend/data/vocabulary_flashcards_all.csv,
//      mapping CSV columns to the keys api.ts expects (frontside/backside, etc.).
//
// conversations.json and idioms.json are already in sync and are left untouched.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const backendData = resolve(here, '../../backend/data');
const frontendData = resolve(here, '../src/data');

// ── Minimal RFC-4180 CSV parser (handles quoted fields, commas, escaped quotes) ──
function parseCsv(text) {
  // Strip a leading UTF-8 BOM so the first header is "Category", not "﻿Category".
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const rows = [];
  let field = '';
  let record = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } // escaped quote
        else inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') { inQuotes = true; }
    else if (ch === ',') { record.push(field); field = ''; }
    else if (ch === '\r') { /* ignore, handled by \n */ }
    else if (ch === '\n') { record.push(field); rows.push(record); record = []; field = ''; }
    else { field += ch; }
  }
  // flush trailing field/record if the file doesn't end with a newline
  if (field.length > 0 || record.length > 0) { record.push(field); rows.push(record); }

  const [header, ...body] = rows;
  return body
    .filter(r => r.length > 1 || (r.length === 1 && r[0] !== ''))
    .map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

// ── 1. Vocabulary index: straight copy ──────────────────────────────────────────
function syncVocabulary() {
  const src = resolve(backendData, 'vocabulary_index.json');
  const dest = resolve(frontendData, 'vocabulary_index.json');
  const raw = readFileSync(src, 'utf-8');
  const data = JSON.parse(raw); // validate it parses before writing
  writeFileSync(dest, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  return { categories: data.categories?.length ?? 0, words: data.total_words ?? 0 };
}

// ── 2. Flashcards: CSV -> JSON in the frontend's expected shape ──────────────────
function syncFlashcards() {
  const src = resolve(backendData, 'vocabulary_flashcards_all.csv');
  const dest = resolve(frontendData, 'flashcards.json');
  const rows = parseCsv(readFileSync(src, 'utf-8'));

  const cards = rows.map((r, i) => ({
    id: i + 1,
    category: r.Category,
    frontside: r.Front,
    backside: r.Back,
    pronunciation: r.Pronunciation,
    part_of_speech: r.PartOfSpeech,
    difficulty: r.Difficulty,
    example: r.Example,
    tags: r.Tags.split(';').map(t => t.trim()).filter(Boolean),
  }));

  writeFileSync(dest, JSON.stringify(cards, null, 2) + '\n', 'utf-8');
  return { cards: cards.length };
}

const vocab = syncVocabulary();
const flash = syncFlashcards();

console.log('✓ vocabulary_index.json:', vocab.categories, 'categories,', vocab.words, 'words');
console.log('✓ flashcards.json:', flash.cards, 'cards');
