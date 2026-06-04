import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import PageHeader from '../components/PageHeader';
import ScrollToTop from '../components/ScrollToTop';
import { SearchIcon } from '../components/Icon';
import { scenariosApi, vocabularyApi } from '../services/api';
import type { Scenario } from '../types';

interface DialogueCardData {
  key: string;          // `${categoryId}.${dialogueId}`
  title: string;
  category: string;
}

const DIFF_BADGE: Record<string, React.CSSProperties> = {
  beginner:     { background: 'var(--teal-soft)', color: 'var(--teal)' },
  intermediate: { background: 'var(--amber-soft)', color: 'var(--amber)' },
  advanced:     { background: 'var(--rose-soft)', color: 'var(--rose)' },
};

export default function Conversations() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [dialogues, setDialogues] = useState<DialogueCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([scenariosApi.list(), vocabularyApi.index()])
      .then(async ([s, v]) => {
        setScenarios(s);
        // load mini-dialogues from every category for read-aloud practice
        const cats = await Promise.all(v.category_summary.map(c => vocabularyApi.category(c.id)));
        setDialogues(
          cats.flatMap(c =>
            c.mini_dialogues.map(d => ({
              key: `${c.id}.${d.id}`,
              title: d.title,
              category: c.category,
            }))
          )
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredScenarios = useMemo(
    () => scenarios.filter(s => s.title.toLowerCase().includes(search.toLowerCase())),
    [scenarios, search]
  );
  const filteredDialogues = useMemo(
    () => dialogues.filter(d => d.title.toLowerCase().includes(search.toLowerCase())),
    [dialogues, search]
  );

  return (
    <div className="relative flex flex-col h-[100dvh] overflow-x-hidden w-full" style={{ background: 'var(--paper)' }}>
      <PageHeader title="Conversations" subtitle="વાર્તાલાપ પ્રૅક્ટિસ" back="/" />

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          Loading…
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-4 pb-6">
          {/* search */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-[13px] mb-5"
            style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
          >
            <SearchIcon className="w-4 h-4" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--ink)' }}
            />
          </div>

          {/* Live AI scenarios */}
          <h3 className="font-serif text-[16px] font-semibold mb-3" style={{ color: 'var(--ink)' }}>
            Live AI Practice
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {filteredScenarios.map(s => (
              <button
                key={s.id}
                onClick={() => navigate(`/practice/${s.id}`, { state: { scenario: s } })}
                className="text-left rounded-[15px] p-4 relative transition-all active:scale-[.97]"
                style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
              >
                <span
                  className="absolute top-3 right-3 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md"
                  style={DIFF_BADGE[s.difficulty] ?? DIFF_BADGE.beginner}
                >
                  {s.difficulty.slice(0, 3)}
                </span>
                <div className="text-2xl mb-2">{s.icon}</div>
                <h4 className="text-[13px] font-bold leading-tight mb-1 pr-6" style={{ color: 'var(--ink)' }}>
                  {s.title}
                </h4>
                <p className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>
                  {s.category} · ~{s.estimated_minutes}m
                </p>
              </button>
            ))}
          </div>

          {/* Read-aloud mini-dialogues */}
          <h3 className="font-serif text-[16px] font-semibold mb-3" style={{ color: 'var(--ink)' }}>
            Read-Aloud Dialogues
          </h3>
          <div className="space-y-2.5">
            {filteredDialogues.map(d => (
              <button
                key={d.key}
                onClick={() => navigate(`/conversations/dialogue/${d.key}`)}
                className="w-full text-left rounded-[14px] p-4 flex items-center gap-3 transition-all active:scale-[.98]"
                style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
              >
                <div className="w-10 h-10 rounded-full grid place-items-center text-lg flex-shrink-0" style={{ background: 'var(--teal-soft)' }}>
                  💬
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold leading-tight" style={{ color: 'var(--ink)' }}>{d.title}</h4>
                  <p className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>{d.category}</p>
                </div>
                <span style={{ color: 'var(--ink-soft)' }}>›</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && <ScrollToTop targetRef={scrollRef} />}
      <BottomNav active="conversations" />
    </div>
  );
}
