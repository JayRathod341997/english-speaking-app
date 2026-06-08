import { useCallback, useEffect, useRef, useState } from 'react';

export function useAutoHide(
  scrollRef: React.RefObject<HTMLElement | null>,
  idleMs = 3000,
) {
  const [visible, setVisible] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable show fn — won't change between renders so it's safe in event listeners.
  const show = useCallback(() => {
    setVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), idleMs);
  }, [idleMs]);

  // Re-attach whenever the scroll element is actually mounted (handles conditional rendering).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    show(); // start idle countdown once the element is available

    el.addEventListener('scroll', show, { passive: true });
    el.addEventListener('touchstart', show, { passive: true });
    el.addEventListener('click', show);

    return () => {
      el.removeEventListener('scroll', show);
      el.removeEventListener('touchstart', show);
      el.removeEventListener('click', show);
      if (timer.current) clearTimeout(timer.current);
    };
  });
  // NOTE: No dependency array — runs after every render so it always picks up
  // the ref once the element mounts. The listeners are idempotent (add+remove
  // each cycle is cheap) and this is the simplest way to handle conditional
  // rendering without a callback-ref or MutationObserver.

  return { visible, show };
}
