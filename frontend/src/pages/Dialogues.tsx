import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import PageHeader from '../components/PageHeader';
import { SearchIcon } from '../components/Icon';
import { conversationsApi } from '../services/api';
import type { ConversationSummary } from '../types';

export default function Dialogues() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    conversationsApi.list().then(setConversations).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => conversations.filter(c => c.title.toLowerCase().includes(search.toLowerCase())),
    [conversations, search]
  );

  return (
    <div className="flex flex-col h-[100dvh] overflow-x-hidden w-full" style={{ background: 'var(--paper)' }}>
      <PageHeader title="Dialogues" subtitle="વાર્તાલાપ વાંચો" back="/" />

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          Loading…
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-4 pb-6">
          {/* search */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-[13px] mb-5"
            style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
          >
            <SearchIcon className="w-4 h-4" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search dialogues…"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--ink)' }}
            />
          </div>

          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-serif text-[16px] font-semibold" style={{ color: 'var(--ink)' }}>
              Read-Aloud Conversations
            </h3>
            <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{filtered.length}</span>
          </div>

          <div className="space-y-2.5">
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => navigate(`/dialogues/${c.id}`)}
                className="w-full text-left rounded-[14px] p-4 flex items-center gap-3 transition-all active:scale-[.98]"
                style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
              >
                <div className="w-10 h-10 rounded-full grid place-items-center text-lg flex-shrink-0" style={{ background: 'var(--teal-soft)' }}>
                  💬
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold leading-tight" style={{ color: 'var(--ink)' }}>{c.title}</h4>
                  <p className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>
                    {c.speakers.join(' · ')} · {c.turn_count} turns
                  </p>
                </div>
                <span style={{ color: 'var(--ink-soft)' }}>›</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <BottomNav active="conversations" />
    </div>
  );
}
