import { useCallback, useSyncExternalStore } from 'react';

/**
 * Local learning progress, persisted to localStorage.
 * The only persistence layer for now — login + DB come later.
 * A single external store backs every consumer so all components re-render on change.
 */

const KEY = 'bolo_progress_v1';

export interface WordProgress {
  learned?: boolean;
  spoken?: boolean;
  bookmarked?: boolean;
}

export interface LocalProgress {
  vocab: Record<string, WordProgress>;          // keyed by word id
  quizScores: Record<string, number>;           // categoryId -> best percent (0–100)
  idiomBookmarks: number[];
  learnedIdioms: number[];                      // IDs of mastered idioms
  convoBookmarks: string[];                      // e.g. "dialogue-3", "scenario-1"
  streak: number;
  lastActiveDate: string;                        // YYYY-MM-DD
}

const EMPTY: LocalProgress = {
  vocab: {},
  quizScores: {},
  idiomBookmarks: [],
  learnedIdioms: [],
  convoBookmarks: [],
  streak: 0,
  lastActiveDate: '',
};

// ── store internals ─────────────────────────────────────────────────────────
let cache: LocalProgress | null = null;
const listeners = new Set<() => void>();

function read(): LocalProgress {
  if (cache) return cache;
  let next: LocalProgress;
  try {
    const raw = localStorage.getItem(KEY);
    next = raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
  } catch {
    next = { ...EMPTY };
  }
  cache = next;
  return next;
}

function write(next: LocalProgress) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private-mode errors */
  }
  listeners.forEach(l => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  // keep multiple tabs roughly in sync
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

function update(fn: (p: LocalProgress) => LocalProgress) {
  write(fn(read()));
}

// ── public hook ──────────────────────────────────────────────────────────────
export function useLocalProgress() {
  const progress = useSyncExternalStore(subscribe, read, read);

  const setWord = useCallback((wordKey: string | number, patch: WordProgress) => {
    update(p => ({
      ...p,
      vocab: { ...p.vocab, [wordKey]: { ...p.vocab[wordKey], ...patch } },
    }));
  }, []);

  const setQuizScore = useCallback((categoryId: number, percent: number) => {
    update(p => ({
      ...p,
      quizScores: {
        ...p.quizScores,
        [categoryId]: Math.max(percent, p.quizScores[categoryId] ?? 0),
      },
    }));
  }, []);

  const toggleIdiomBookmark = useCallback((idiomId: number) => {
    update(p => ({
      ...p,
      idiomBookmarks: p.idiomBookmarks.includes(idiomId)
        ? p.idiomBookmarks.filter(i => i !== idiomId)
        : [...p.idiomBookmarks, idiomId],
    }));
  }, []);

  const toggleIdiomLearned = useCallback((idiomId: number) => {
    update(p => ({
      ...p,
      learnedIdioms: (p.learnedIdioms ?? []).includes(idiomId)
        ? p.learnedIdioms.filter(i => i !== idiomId)
        : [...(p.learnedIdioms ?? []), idiomId],
    }));
  }, []);

  const toggleConvoBookmark = useCallback((key: string) => {
    update(p => ({
      ...p,
      convoBookmarks: p.convoBookmarks.includes(key)
        ? p.convoBookmarks.filter(k => k !== key)
        : [...p.convoBookmarks, key],
    }));
  }, []);

  return {
    progress,
    setWord,
    setQuizScore,
    toggleIdiomBookmark,
    toggleIdiomLearned,
    toggleConvoBookmark,
  };
}
