import { useEffect, useRef, useState } from 'react';

interface Props {
  /** The scrollable container to watch (the inner overflow-y-auto div). */
  targetRef: React.RefObject<HTMLElement | null>;
  /** Show the button once scrolled past this many pixels. */
  threshold?: number;
  /** Auto-hide after this many ms of no activity. */
  idleMs?: number;
}

/**
 * A floating "go to top" button that:
 *  - only appears once the watched container is scrolled past `threshold`,
 *  - reveals on scroll / mouse-move and auto-hides after `idleMs` of inactivity,
 *  - stays visible while the cursor is hovering it (so it can't vanish mid-reach).
 * Watches the inner scroll container (the page scrolls a div, not the window),
 * so it works with both touch and mouse.
 */
export default function ScrollToTop({ targetRef, threshold = 280, idleMs = 3000 }: Props) {
  const [scrolled, setScrolled] = useState(false); // past the threshold
  const [active, setActive] = useState(false);     // recent activity (within idleMs)
  const [hovered, setHovered] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const bump = () => {
      setActive(true);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setActive(false), idleMs);
    };

    const onScroll = () => {
      setScrolled(el.scrollTop > threshold);
      bump();
    };
    const onMove = () => {
      // Only matters once we're scrolled down; still cheap to always bump.
      if (el.scrollTop > threshold) bump();
    };

    onScroll(); // sync on mount / route change
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('mousemove', onMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [targetRef, threshold, idleMs]);

  // Visible when past threshold AND (recently active OR being hovered).
  const visible = scrolled && (active || hovered);

  const toTop = () => {
    targetRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    // Wrapper handles horizontal centering so the button's own transform is free
    // for the vertical slide-in animation.
    <div className="absolute left-1/2 -translate-x-1/2 bottom-[72px] z-20">
      <button
        type="button"
        onClick={toTop}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Scroll to top"
        tabIndex={visible ? 0 : -1}
        className="w-11 h-11 rounded-full grid place-items-center transition-all duration-300 active:scale-90"
        style={{
          background: 'var(--card)',
          color: 'var(--ink-soft)',
          border: '1px solid var(--line)',
          boxShadow: '0 4px 14px var(--shadow)',
          opacity: visible ? (hovered ? 1 : 0.7) : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
          strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </div>
  );
}
