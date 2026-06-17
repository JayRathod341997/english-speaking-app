# Home "Today's" idioms & words — full behaviour parity with dedicated pages

**Date:** 2026-06-18
**Status:** Approved (design)

## Problem

On Home, the "Today's Idioms" and "Today's Words" sections render with a
stripped-down card (`DailyItemCard`): expand → English/Gujarati meaning + one
example + a "mark as read" button. The dedicated Idioms and Vocabulary pages render
the same items with far richer, interactive cards. The daily items should behave
exactly like they do on their own pages.

### Current card behaviour gap

| Capability | Dedicated page | Home "Today's" (now) |
|---|---|---|
| Component | `IdiomCard` / `Flashcard` | `DailyItemCard` |
| Mark learned | ✓ | ✓ (as "read") |
| Bookmark / save | ✓ | ✗ |
| 🔊 Pronounce + 🎙 practice (speech) | ✓ (`PronounceButton`) | ✗ |
| Idiom: highlighted examples, category | ✓ | partial |
| Word: flip-to-reveal, synonyms/antonyms, collocations, multiple examples, usage note, memory tip, "spoken" tracking | ✓ | ✗ |

The dedicated pages use these components on **both** mobile (`Idioms`, `Vocabulary`)
and desktop (`IdiomsDesktop` → `IdiomCard`, `VocabularyDesktop` → `Flashcard`).

## Goal

Reuse the exact `IdiomCard` and `Flashcard` components in Home's "Today's Idioms" /
"Today's Words" sections, on both the mobile (`Home.tsx`) and desktop
(`HomeDesktop.tsx`) layouts, so behaviour is identical to the dedicated pages. Keep
the existing daily framing: the `Section` wrapper with its `done/total` count and the
`TargetComplete` banner.

## Non-goals

- Today's Grammar stays as-is (`ChapterCard`) — not in scope.
- No change to `IdiomCard` / `Flashcard` themselves.
- No change to the daily-pick logic (`getOrPickDaily`, locked-for-the-day sets).
- `DailyItemCard` component is left in the repo (now unused by Home); removing it is
  out of scope.

## Design

### Shared progress wiring

Both layouts already receive `progress` and the `useLocalProgress` actions. Confirmed
available: `setWord(key, patch)` (partial `WordProgress`), `toggleIdiomBookmark(id)`,
`toggleIdiomLearned(id)`; state `progress.idiomBookmarks: number[]` and
`progress.vocab[key]: { learned?, spoken?, bookmarked? }`.

### 1. `Home.tsx` (mobile)

- Destructure `toggleIdiomBookmark` from `useLocalProgress` (alongside the existing
  `toggleIdiomLearned`, `setWord`, `toggleGrammarComplete`).
- Add `const idiomBookmarkSet = useMemo(() => new Set(progress.idiomBookmarks ?? []), [progress.idiomBookmarks])`.
- **Today's Idioms:** replace the `DailyItemCard` map with `IdiomCard`:
  ```tsx
  <IdiomCard
    idiom={i}
    bookmarked={idiomBookmarkSet.has(i.id)}
    learned={learnedIdiomSet.has(i.id)}
    onToggleBookmark={() => toggleIdiomBookmark(i.id)}
    onToggleLearned={() => toggleIdiomLearned(i.id)}
  />
  ```
- **Today's Words:** replace the `DailyItemCard` map with `Flashcard`:
  ```tsx
  const wp = progress.vocab[key] ?? {};
  <Flashcard
    word={w}
    learned={wp.learned}
    spoken={wp.spoken}
    bookmarked={wp.bookmarked}
    onToggleLearned={() => setWord(key, { learned: !wp.learned })}
    onSpoken={() => setWord(key, { spoken: true })}
    onToggleBookmark={() => setWord(key, { bookmarked: !wp.bookmarked })}
  />
  ```
- Card containers use the same grid the dedicated pages use:
  `grid grid-cols-1 sm:grid-cols-2 gap-3`.
- Remove the now-unused `DailyItemCard` import.
- `idiomsDone` / `wordsDone` counts are unchanged — they key off `learned`, which both
  new cards toggle.

### 2. `HomeDesktop.tsx`

- Replace the hand-rolled `<details>` idiom block with `IdiomCard`, and the
  `<article>` word block with `Flashcard`, using the same prop wiring as above.
- Update the `HomeDesktopProps` interface: add
  `toggleIdiomBookmark: (id: number) => void` and widen `setWord` to
  `(key: string, data: Partial<{ learned: boolean; spoken: boolean; bookmarked: boolean }>) => void`.
- Remove the now-unused `useSpeechSynthesis` import and `speak`/`isSpeaking`
  (pronunciation is handled inside the cards via `PronounceButton`).
- Keep the section headers, counts, and empty-state messages.
- `Home.tsx` passes the new `toggleIdiomBookmark` prop into `HomeDesktop`.

## Verification

1. `npm run build` (tsc + vite) passes — confirms prop types line up.
2. Mobile Home: today's idiom cards show bookmark + learned + pronounce/practice and
   match the Idioms page; today's word cards flip to reveal synonyms/usage/memory tip
   and track "spoken", matching the Vocabulary flashcards.
3. Bookmarking a daily idiom/word makes it appear under the "Saved" tab on the
   respective dedicated page (shared `localStorage` progress).
4. Marking learned still advances the section's `done/total` and triggers
   `TargetComplete` at full completion.
5. Desktop Home renders the same cards without console errors.

## Risks

- **Taller Home feed** — full cards are larger than `DailyItemCard`. Accepted per
  product decision (parity was explicitly requested).
