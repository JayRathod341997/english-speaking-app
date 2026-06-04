import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import PageHeader from '../components/PageHeader';
import PronounceButton from '../components/PronounceButton';
import { conversationsApi } from '../services/api';
import type { ConversationDetail } from '../types';

// A small palette cycled per distinct speaker so each voice is visually distinct.
const SPEAKER_STYLES: React.CSSProperties[] = [
  { background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' },
  { background: 'var(--teal-soft)', color: 'var(--teal)' },
  { background: 'var(--amber-soft)', color: 'var(--amber)' },
  { background: 'var(--rose-soft)', color: 'var(--rose)' },
  { background: 'var(--paper-2)', color: 'var(--ink)' },
];

export default function DialoguePractice() {
  const { id } = useParams();
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    conversationsApi.get(id)
      .then(c => { if (active) setConversation(c); })
      .catch(() => active && setNotFound(true))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  // Map each distinct speaker to a stable side + colour.
  const speakerMeta = useMemo(() => {
    const map: Record<string, { side: 'left' | 'right'; style: React.CSSProperties }> = {};
    (conversation?.speakers ?? []).forEach((sp, i) => {
      map[sp] = { side: i % 2 === 0 ? 'left' : 'right', style: SPEAKER_STYLES[i % SPEAKER_STYLES.length] };
    });
    return map;
  }, [conversation]);

  return (
    <div className="flex flex-col h-[100dvh] overflow-x-hidden w-full" style={{ background: 'var(--paper)' }}>
      <PageHeader title={conversation?.title ?? 'Dialogue'} subtitle="વાર્તાલાપ વાંચો" back="/dialogues" />

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          Loading…
        </div>
      ) : notFound || !conversation ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          Dialogue not found.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-4 pb-6">
          <p className="text-[12px] mb-4" style={{ color: 'var(--ink-soft)' }}>
            {conversation.speakers.join(' · ')} · {conversation.turn_count} turns
          </p>

          <div className="space-y-3">
            {conversation.turns.map((turn, i) => {
              const meta = speakerMeta[turn.speaker] ?? { side: 'left' as const, style: SPEAKER_STYLES[0] };
              return (
                <div key={i} className={`flex ${meta.side === 'right' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%] rounded-[16px] p-3.5 bubble-pop" style={meta.style}>
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
        </div>
      )}

      <BottomNav active="conversations" />
    </div>
  );
}
