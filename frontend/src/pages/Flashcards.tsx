import { useEffect, useRef, useState } from 'react';
import BottomNav from '../components/BottomNav';
import PageHeader from '../components/PageHeader';
import PronounceButton from '../components/PronounceButton';
import { FlipIcon } from '../components/Icon';
import { usePersistentState } from '../hooks/usePersistentState';
import { useAutoHide } from '../hooks/useAutoHide';
import { flashcardsApi } from '../services/api';
import type { Flashcard, FlashcardDeck } from '../types';

const DIFF_BADGE: Record<string, React.CSSProperties> = {
  Beginner:     { background: 'var(--teal-soft)', color: 'var(--teal)' },
  Intermediate: { background: 'var(--amber-soft)', color: 'var(--amber)' },
  Advanced:     { background: 'var(--rose-soft)', color: 'var(--rose)' },
};

// Distance (px) the finger must travel before a release counts as a swipe.
const SWIPE_THRESHOLD = 60;
// Movement (px) under which a pointer release is treated as a tap (flip).
const TAP_SLOP = 8;

function ChevronLeft({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
function ChevronRight({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

/** Full card content for the single card on screen. */
function CardFace({ card, flipped }: { card: Flashcard; flipped: boolean }) {
  return (
    <div
      className="rounded-[20px] p-6 flex flex-col min-h-[320px]"
      style={{ background: 'var(--card)', border: '1px solid var(--line)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md"
          style={DIFF_BADGE[card.difficulty] ?? DIFF_BADGE.Intermediate}
        >
          {card.difficulty}
        </span>
        <PronounceButton target={card.front} size="sm" />
      </div>

      {/* Front: English word */}
      <div className="mt-4">
        <h4 className="font-serif text-3xl font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
          {card.front}
        </h4>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
          {card.part_of_speech} · <span className="font-guj">{card.pronunciation}</span>
        </p>
      </div>

      {/* Back: Gujarati meaning + example (revealed on flip) */}
      {flipped ? (
        <div className="mt-5 space-y-3 bubble-pop flex-1">
          <p className="text-[15px] font-guj leading-relaxed" style={{ color: 'var(--teal)' }}>
            {card.back}
          </p>
          {card.example && (
            <p className="text-[13px] italic" style={{ color: 'var(--ink-soft)' }}>
              “{card.example}”
            </p>
          )}
          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {card.tags.map(t => (
                <span
                  key={t}
                  className="text-[11px] px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--paper-2)', color: 'var(--ink-soft)' }}
                >
                  {t.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>
            <FlipIcon className="w-4 h-4" />
            Tap to reveal meaning
          </span>
        </div>
      )}
    </div>
  );
}

function SwipeDeck({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [animating, setAnimating] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);

  // Reset to the first card when the deck changes.
  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setDragX(0);
  }, [cards]);

  const card = cards[index];
  if (!card) return null;

  const go = (dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= cards.length) {
      setDragX(0); // bounce back at the ends
      return;
    }
    setIndex(next);
    setFlipped(false);
    setDragX(0);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
    setAnimating(false);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    setDragX(e.clientX - start.current.x);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    start.current = null;
    setAnimating(true);

    // Tap (barely moved) → flip the card.
    if (Math.abs(dx) < TAP_SLOP && Math.abs(dy) < TAP_SLOP) {
      setFlipped(f => !f);
      setDragX(0);
      return;
    }
    // Horizontal swipe past threshold → navigate.
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1); // swipe left → next, swipe right → prev
    } else {
      setDragX(0); // not far enough → snap back
    }
  };

  const atStart = index === 0;
  const atEnd = index === cards.length - 1;

  return (
    <div className="select-none">
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>
          {index + 1} / {cards.length}
        </span>
        <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>
          Swipe ← → to browse · tap to flip
        </span>
      </div>
      <div
        className="h-1 rounded-full mb-4 overflow-hidden"
        style={{ background: 'var(--line)' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${((index + 1) / cards.length) * 100}%`, background: 'var(--teal)' }}
        />
      </div>

      {/* Swipeable card */}
      <div
        className="touch-pan-y cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { start.current = null; setAnimating(true); setDragX(0); }}
      >
        <div
          style={{
            transform: `translateX(${dragX}px) rotate(${dragX * 0.02}deg)`,
            transition: animating ? 'transform .2s ease' : 'none',
          }}
        >
          <CardFace card={card} flipped={flipped} />
        </div>
      </div>

      {/* Prev / Next controls (desktop + a11y) */}
      <div className="flex items-center justify-between mt-5">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={atStart}
          className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: 'var(--card)', color: 'var(--ink)', border: '1.5px solid var(--line)' }}
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <button
          type="button"
          onClick={() => setFlipped(f => !f)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold"
          style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}
        >
          <FlipIcon className="w-4 h-4" />
          {flipped ? 'Hide' : 'Flip'}
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={atEnd}
          className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: 'var(--card)', color: 'var(--ink)', border: '1.5px solid var(--line)' }}
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function Flashcards() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [active, setActive] = usePersistentState('flashcards.active', 0);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { visible: uiVisible } = useAutoHide(scrollRef);

  useEffect(() => {
    flashcardsApi.decks().then(setDecks).finally(() => setLoading(false));
  }, []);

  // Guard against a stale persisted index when the deck list shrinks/changes.
  const activeIndex = decks.length ? Math.min(active, decks.length - 1) : 0;
  const deck = decks[activeIndex];

  return (
    <div className="relative flex flex-col h-[100dvh] overflow-x-hidden w-full" style={{ background: 'var(--paper)' }}>
      <PageHeader title="Flashcards" subtitle="શબ્દ કાર્ડ" back="/" visible={uiVisible} />

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          Loading…
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-4 pb-6">
          {/* Deck (category) chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {decks.map((d, i) => (
              <button
                key={d.category}
                onClick={() => setActive(i)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={
                  i === activeIndex
                    ? { background: 'var(--teal)', color: '#fff', border: '1.5px solid var(--teal)' }
                    : { background: 'var(--card)', color: 'var(--ink-soft)', border: '1.5px solid var(--line)' }
                }
              >
                {d.category} · {d.total}
              </button>
            ))}
          </div>

          {deck && <SwipeDeck key={deck.category} cards={deck.cards} />}
        </div>
      )}

      <BottomNav active="vocabulary" visible={uiVisible} />
    </div>
  );
}
