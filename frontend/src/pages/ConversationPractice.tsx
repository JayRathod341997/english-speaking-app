import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import PageHeader from '../components/PageHeader';
import PronounceButton from '../components/PronounceButton';
import { vocabularyApi } from '../services/api';
import type { MiniDialogue } from '../types';

export default function ConversationPractice() {
  const { source, id } = useParams();
  const valid = source === 'dialogue' && !!id;
  const [dialogue, setDialogue] = useState<MiniDialogue | null>(null);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(valid);
  const [notFound, setNotFound] = useState(!valid);

  useEffect(() => {
    if (!valid) return;
    let active = true;
    const [catId, dlgId] = id!.split('.').map(Number);
    vocabularyApi.category(catId)
      .then(c => {
        if (!active) return;
        const d = c.mini_dialogues.find(x => x.id === dlgId);
        if (d) { setDialogue(d); setCategory(c.category); } else setNotFound(true);
      })
      .catch(() => active && setNotFound(true))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [valid, id]);

  return (
    <div className="flex flex-col h-[100dvh]" style={{ background: 'var(--paper)' }}>
      <PageHeader title={dialogue?.title ?? 'Practice'} subtitle={category} back="/conversations" />

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          Loading…
        </div>
      ) : notFound || !dialogue ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          Dialogue not found.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-6">
          <p className="text-[13px] mb-4" style={{ color: 'var(--ink-soft)' }}>{dialogue.situation}</p>

          <div className="space-y-3">
            {dialogue.turns.map((turn, i) => {
              const isYou = /^you$/i.test(turn.speaker.trim());
              return (
                <div key={i} className={`flex ${isYou ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] rounded-[16px] p-3.5 bubble-pop"
                    style={
                      isYou
                        ? { background: 'linear-gradient(140deg, var(--saffron), var(--saffron-deep))', color: '#fff' }
                        : { background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }
                    }
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ opacity: 0.75 }}>
                      {turn.speaker}
                    </p>
                    <p className="text-[14px] leading-snug mb-2">{turn.text}</p>
                    <PronounceButton target={turn.text} size="sm" hideResult />
                  </div>
                </div>
              );
            })}
          </div>

          {dialogue.words_used?.length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--ink-soft)' }}>
                Words used
              </p>
              <div className="flex flex-wrap gap-1.5">
                {dialogue.words_used.map(w => (
                  <span key={w} className="text-[11px] px-2.5 py-1 rounded-full"
                    style={{ background: 'var(--paper-2)', color: 'var(--ink-soft)' }}>
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <BottomNav active="conversations" />
    </div>
  );
}
