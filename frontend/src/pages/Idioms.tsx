import { useEffect, useMemo, useState } from 'react';
import BottomNav from '../components/BottomNav';
import IdiomCard from '../components/IdiomCard';
import PageHeader from '../components/PageHeader';
import { useLocalProgress } from '../hooks/useLocalProgress';
import { idiomsApi } from '../services/api';
import type { IdiomsLibrary } from '../types';

const PAGE = 12;
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

function Chip({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0"
      style={
        active
          ? { background: 'var(--teal)', color: '#fff', border: '1.5px solid var(--teal)' }
          : { background: 'var(--card)', color: 'var(--ink-soft)', border: '1.5px solid var(--line)' }
      }
    >
      {children}
    </button>
  );
}

export default function Idioms() {
  const [lib, setLib] = useState<IdiomsLibrary | null>(null);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('All');
  const [diff, setDiff] = useState('All');
  const [limit, setLimit] = useState(PAGE);
  const { progress, toggleIdiomBookmark } = useLocalProgress();

  useEffect(() => {
    idiomsApi.list().then(setLib).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!lib) return [];
    return lib.idioms.filter(
      i => (cat === 'All' || i.category === cat) && (diff === 'All' || i.difficulty === diff)
    );
  }, [lib, cat, diff]);

  // reset pagination whenever a filter changes
  const setCatFiltered = (c: string) => { setCat(c); setLimit(PAGE); };
  const setDiffFiltered = (d: string) => { setDiff(d); setLimit(PAGE); };

  const visible = filtered.slice(0, limit);
  const bookmarks = new Set(progress.idiomBookmarks);

  return (
    <div className="flex flex-col h-[100dvh]" style={{ background: 'var(--paper)' }}>
      <PageHeader title="Idioms Library" subtitle="રૂઢિપ્રયોગો" back="/" />

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          Loading idioms…
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-6">
          <p className="text-sm mb-3" style={{ color: 'var(--ink-soft)' }}>
            {lib?.total_idioms} idioms with meanings, examples & pronunciation. Tap 🔊 to hear, 🎙 to practise.
          </p>

          {/* Difficulty filters */}
          <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar">
            {DIFFICULTIES.map(d => (
              <Chip key={d} active={diff === d} onClick={() => setDiffFiltered(d)}>{d}</Chip>
            ))}
          </div>

          {/* Category filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            <Chip active={cat === 'All'} onClick={() => setCatFiltered('All')}>All topics</Chip>
            {lib?.categories.map(c => (
              <Chip key={c} active={cat === c} onClick={() => setCatFiltered(c)}>{c}</Chip>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visible.map(idiom => (
              <IdiomCard
                key={idiom.id}
                idiom={idiom}
                bookmarked={bookmarks.has(idiom.id)}
                onToggleBookmark={() => toggleIdiomBookmark(idiom.id)}
              />
            ))}
          </div>

          {visible.length === 0 && (
            <p className="text-center py-12 text-sm" style={{ color: 'var(--ink-soft)' }}>
              No idioms match these filters.
            </p>
          )}

          {limit < filtered.length && (
            <button
              onClick={() => setLimit(l => l + PAGE)}
              className="w-full mt-4 py-3 rounded-[14px] font-semibold text-sm"
              style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }}
            >
              Load more ({filtered.length - limit} left)
            </button>
          )}
        </div>
      )}

      <BottomNav active="idioms" />
    </div>
  );
}
