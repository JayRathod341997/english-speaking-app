import { useEffect, useState } from 'react';

/**
 * Like useState, but the value is persisted to localStorage under `key`, so a
 * user's UI selection (filter tabs, "Unread" toggles, chosen difficulty, etc.)
 * survives navigating away and back, and full reloads.
 *
 * All keys are namespaced under `bolo_ui_` to keep them grouped and avoid
 * clashing with the learning-progress store (`bolo_progress_v1`).
 *
 * JSON-serialisable values only. For a Set, store an array and rebuild it in
 * the component (see Grammar's collapsed levels).
 */
const PREFIX = 'bolo_ui_';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function usePersistentState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => load(key, defaultValue));

  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(state));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [key, state]);

  return [state, setState];
}
