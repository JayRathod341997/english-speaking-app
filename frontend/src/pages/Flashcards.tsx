import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import PageHeader from '../components/PageHeader';
import PronounceButton from '../components/PronounceButton';
import { FlipIcon } from '../components/Icon';
import { flashcardsApi } from '../services/api';
import type { Flashcard, FlashcardDeck } from '../types';

const DIFF_BADGE: Record<string, React.CSSProperties> = {
  Beginner:     { background: 'var(--teal-soft)', color: 'var(--teal)' },
  Intermediate: { background: 'var(--amber-soft)', color: 'var(--amber)' },
  Advanced:     { background: 'var(--rose-soft)', color: 'var(--rose)' },
};

function FlashcardItem({ card }: { card: Flashcard }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="rounded-[15px] p-4 relative"
      style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
    >
      <span
        className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md"
        style={DIFF_BADGE[card.difficulty] ?? DIFF_BADGE.Intermediate}
      >
        {card.difficulty}
      </span>

      {/* Front: English word */}
      <button type="button" onClick={() => setFlipped(f => !f)} className="text-left w-full mt-2">
        <h4 className="font-serif text-xl font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
          {card.front}
        </h4>
        <p className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>
          {card.part_of_speech} · <span className="font-guj">{card.pronunciation}</span>
        </p>
      </button>

      {/* Back: Gujarati meaning + example (revealed on flip) */}
      {flipped && (
        <div className="mt-3 space-y-2 bubble-pop">
          <p className="text-[13px] font-guj leading-relaxed" style={{ color: 'var(--teal)' }}>
            {card.back}
          </p>
          {card.example && (
            <p className="text-[12px] italic" style={{ color: 'var(--ink-soft)' }}>
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
      )}

      {/* Footer: flip + pronounce */}
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
        <button
          type="button"
          onClick={() => setFlipped(f => !f)}
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: 'var(--ink-soft)' }}
        >
          <FlipIcon className="w-4 h-4" />
          {flipped ? 'Hide' : 'Reveal'}
        </button>
        <PronounceButton target={card.front} size="sm" />
      </div>
    </div>
  );
}

export default function Flashcards() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    flashcardsApi.decks().then(setDecks).finally(() => setLoading(false));
  }, []);

  const deck = decks[active];

  return (
    <div className="flex flex-col h-[100dvh] overflow-x-hidden w-full" style={{ background: 'var(--paper)' }}>
      <PageHeader title="Flashcards" subtitle="શબ્દ કાર્ડ" back="/" />

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          Loading…
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-4 pb-6">
          {/* Deck (category) chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {decks.map((d, i) => (
              <button
                key={d.category}
                onClick={() => setActive(i)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={
                  i === active
                    ? { background: 'var(--teal)', color: '#fff', border: '1.5px solid var(--teal)' }
                    : { background: 'var(--card)', color: 'var(--ink-soft)', border: '1.5px solid var(--line)' }
                }
              >
                {d.category} · {d.total}
              </button>
            ))}
          </div>

          {deck && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {deck.cards.map(card => (
                <FlashcardItem key={card.id} card={card} />
              ))}
            </div>
          )}
        </div>
      )}

      <BottomNav active="vocabulary" />
    </div>
  );
}
