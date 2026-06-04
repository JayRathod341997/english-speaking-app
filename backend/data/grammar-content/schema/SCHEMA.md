# Grammar content schema (authoring reference)

The **JSON is the single source of truth**. The frontend consumes `index.json` + `chapters/*.json`
(or the bundled `grammar.json`). `grammar.md` is generated for human proofreading only — never edited by hand.

Every text node is the bilingual pair:

```jsonc
T = { "en": "string", "gu": "string" }   // gu may be "" until translated
```

---

## `index.json` — collection manifest

```jsonc
{
  "schemaVersion": "1.0",
  "collection": {
    "id": "eng-grammar-merged",
    "title": { "en": "English Grammar", "gu": "" },
    "languages": ["en", "gu"],
    "sources": [
      { "id": "motion",  "title": "English Class 3 PDF Book By Motion Academy",          "pages": 83 },
      { "id": "anamika", "title": "English Grammar With Exercise PDF By Anamika Academy", "pages": 49 }
    ]
  },
  "chapters": [                              // ORDERED — drives the TOC and routing
    {
      "id": "ch-05-articles",
      "slug": "articles",                    // kebab-case, unique -> route /{slug}
      "order": 5,
      "title": { "en": "Articles", "gu": "" },
      "file": "chapters/05-articles.json"    // relative path the frontend lazy-loads
    }
  ]
}
```

---

## Chapter file — `chapters/NN-slug.json`

```jsonc
{
  "id": "ch-06-pronoun",                 // ch-<2-digit order>-<slug>
  "slug": "pronoun",
  "order": 6,
  "title":   { "en": "Pronoun", "gu": "" },
  "summary": { "en": "What pronouns are and their kinds.", "gu": "" },
  "sources": ["motion", "anamika"],      // which source book(s) this merged chapter draws from
  "explanations": [ /* ordered blocks */ ],
  "practice":     [ /* ordered items  */ ]
}
```

---

## Explanation blocks (`explanations[]`)

Discriminated by `block`. Each block carries a **stable** `id` = `<chapter.id>/exp-<n>`.

### prose
```jsonc
{ "block": "prose", "id": "ch-06-pronoun/exp-1",
  "text": { "en": "A pronoun is a word used in place of a noun.", "gu": "" } }
```

### rules
```jsonc
{ "block": "rules", "id": "ch-06-pronoun/exp-2",
  "title": { "en": "Rules", "gu": "" },
  "items": [
    { "text": { "en": "Use 'an' before a vowel sound.", "gu": "" },
      "examples": [ { "en": "an hour", "gu": "" } ] }   // examples optional
  ] }
```

### examples
```jsonc
{ "block": "examples", "id": "ch-06-pronoun/exp-3",
  "items": [ { "en": "They are going to Bombay.", "gu": "" } ] }
```

### table
`cells` are plain strings, or a `T` object when the cell holds a meaning/translation.
```jsonc
{ "block": "table", "id": "ch-06-pronoun/exp-4",
  "caption": { "en": "Personal pronoun cases", "gu": "" },
  "headers": [
    { "key": "subject",    "label": { "en": "Subject", "gu": "" } },
    { "key": "object",     "label": { "en": "Object",  "gu": "" } },
    { "key": "possessive", "label": { "en": "Possessive", "gu": "" } }
  ],
  "rows": [
    { "subject": "I",  "object": "me", "possessive": "my" },
    { "subject": "he", "object": "him","possessive": "his" }
  ] }
```

---

## Practice items (`practice[]`)

Discriminated by `type`. Common fields on every item:
`id` (= `<chapter.id>/q-<n>`), `type`, optional `hint: T`, optional `solution: T`,
optional `sourceRef: { "book": "motion"|"anamika", "page": number }`.

### fill_blank
Blank rendered as the literal `____`. `options` is an optional word-bank.
```jsonc
{ "id": "ch-05-articles/q-1", "type": "fill_blank",
  "prompt":  { "en": "The Sun sets in ____ west.", "gu": "" },
  "options": [ { "en": "the", "gu": "" }, { "en": "a", "gu": "" }, { "en": "X (none)", "gu": "" } ],
  "answer":  { "en": "the", "gu": "" },
  "hint":    { "en": "Unique object.", "gu": "" } }
```

### mcq
`answer` references an option `id`.
```jsonc
{ "id": "ch-06-pronoun/q-2", "type": "mcq",
  "prompt": { "en": "Which word is a pronoun?", "gu": "" },
  "options": [
    { "id": "a", "text": { "en": "table", "gu": "" } },
    { "id": "b", "text": { "en": "they",  "gu": "" } },
    { "id": "c", "text": { "en": "run",   "gu": "" } }
  ],
  "answer": "b",
  "solution": { "en": "'they' replaces a noun.", "gu": "" } }
```

### translation
`direction` tells the app which side of `answer` is the prompt.
```jsonc
{ "id": "ch-06-pronoun/q-3", "type": "translation",
  "direction": "en_to_gu",                       // or "gu_to_en"
  "prompt": { "en": "She is reading a book.", "gu": "" },
  "answer": { "en": "She is reading a book.", "gu": "" } }   // answer holds the full pair
```

### transformation
N named `forms` (2 for voice/speech, 3 for degrees). `answer` is denormalized to equal `forms[ask]`.
```jsonc
{ "id": "ch-07-degrees-of-comparison/q-4", "type": "transformation",
  "transform": "degrees_of_comparison",          // voice | speech | degrees_of_comparison | ...
  "given": "positive",
  "ask":   "superlative",
  "forms": {
    "positive":    { "en": "No other teacher is so good as Maulik.", "gu": "" },
    "comparative": { "en": "Maulik is better than any other teacher.", "gu": "" },
    "superlative": { "en": "Maulik is the best teacher.", "gu": "" }
  },
  "answer":   { "en": "Maulik is the best teacher.", "gu": "" },
  "solution": { "en": "Superlative uses 'the best'.", "gu": "" } }
```
- `transform: "voice"`  → `forms: { active, passive }`
- `transform: "speech"` → `forms: { direct, indirect }`

---

## ID / slug rules
- `chapter.slug`: kebab-case, unique → route `/{slug}`.
- `chapter.id`: `ch-<2-digit order>-<slug>`.
- block id: `<chapter.id>/exp-<n>`; item id: `<chapter.id>/q-<n>`.
- IDs are **append-only** — never renumber on edit (frontend deep-links and stores progress by id).

## Validation guarantees (`build/validate.py`)
- Unique chapter `id`/`slug`, unique block/item ids within a chapter.
- Every `mcq.answer` matches an existing option `id`.
- Every `transformation.answer` equals `forms[ask]`; `given`/`ask` exist in `forms`.
- Every `T` node has both `en` and `gu` keys (empty `gu` → warning, not error).
- `index.json` chapter `file` paths exist and match the chapter `id`/`slug`/`order`.
