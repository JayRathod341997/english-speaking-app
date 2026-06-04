import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import ChapterCard from '../components/ChapterCard';
import PageHeader from '../components/PageHeader';
import ScrollToTop from '../components/ScrollToTop';
import { useLocalProgress } from '../hooks/useLocalProgress';
import { usePersistentState } from '../hooks/usePersistentState';
import { grammarApi } from '../services/api';
import type { GrammarChapterSummary, GrammarIndex, GrammarLevel } from '../types';

type LevelFilter = 'All' | GrammarLevel;

const LEVELS: GrammarLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
const FILTERS: LevelFilter[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const FILTER_ACTIVE: Record<LevelFilter, React.CSSProperties> = {
  All: { background: 'var(--ink)', color: '#fff', border: '1.5px solid var(--ink)' },
  Beginner: { background: 'var(--teal)', color: '#fff', border: '1.5px solid var(--teal)' },
  Intermediate: { background: 'var(--amber)', color: '#fff', border: '1.5px solid var(--amber)' },
  Advanced: { background: 'var(--rose)', color: '#fff', border: '1.5px solid var(--rose)' },
};

const LEVEL_HEADER: Record<GrammarLevel, string> = {
  Beginner: 'var(--teal)',
  Intermediate: 'var(--amber)',
  Advanced: 'var(--rose)',
};

const ToggleIndicator = ({ className = 'w-4 h-4', expanded = true, style }: { className?: string; expanded?: boolean; style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className}`}
    style={style}
  >
    {expanded ? (
      <line x1="5" y1="12" x2="19" y2="12" />
    ) : (
      <>
        <line x1="5" y1="12" x2="19" y2="12" />
        <line x1="12" y1="5" x2="12" y2="19" />
      </>
    )}
  </svg>
);

export default function Grammar() {
  const [index, setIndex] = useState<GrammarIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = usePersistentState<LevelFilter>('grammar.level', 'All');
  // Persisted as an array (Set is not JSON-serialisable); rebuilt into a Set for lookups.
  const [collapsedList, setCollapsedList] = usePersistentState<GrammarLevel[]>('grammar.collapsed', []);
  const collapsedLevels = useMemo(() => new Set(collapsedList), [collapsedList]);
  const navigate = useNavigate();
  const { progress, toggleGrammarComplete } = useLocalProgress();
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleLevelCollapse = (lvl: GrammarLevel) => {
    setCollapsedList(prev =>
      prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]
    );
  };

  useEffect(() => {
    grammarApi.index().then(setIndex).finally(() => setLoading(false));
  }, []);

  const completedSet = useMemo(
    () => new Set(progress.grammarCompleted ?? []),
    [progress.grammarCompleted]
  );

  const total = index?.total_chapters ?? 0;
  const completedCount = useMemo(
    () => (index?.chapters ?? []).filter(c => completedSet.has(c.slug)).length,
    [index, completedSet]
  );
  const pct = total ? Math.round((completedCount / total) * 100) : 0;
  const left = total - completedCount;

  // Chapters for the chosen filter, grouped by level (preserving order).
  const grouped = useMemo(() => {
    const map: Record<GrammarLevel, GrammarChapterSummary[]> = {
      Beginner: [],
      Intermediate: [],
      Advanced: [],
    };
    for (const ch of index?.chapters ?? []) {
      if (level === 'All' || ch.level === level) map[ch.level].push(ch);
    }
    return map;
  }, [index, level]);

  // Per-level completion counts (always over the full set, not the filtered view).
  const levelCounts = useMemo(() => {
    const counts: Record<GrammarLevel, { done: number; total: number }> = {
      Beginner: { done: 0, total: 0 },
      Intermediate: { done: 0, total: 0 },
      Advanced: { done: 0, total: 0 },
    };
    for (const ch of index?.chapters ?? []) {
      counts[ch.level].total += 1;
      if (completedSet.has(ch.slug)) counts[ch.level].done += 1;
    }
    return counts;
  }, [index, completedSet]);

  return (
    <div className="relative flex flex-col h-[100dvh] overflow-x-hidden w-full" style={{ background: 'var(--paper)' }}>
      <PageHeader title="Grammar" subtitle="વ્યાકરણ" back="/" />

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          Loading grammar…
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-4 pb-6">
          <p className="text-sm mb-3" style={{ color: 'var(--ink-soft)' }}>
            {total} chapters from Beginner to Advanced — bilingual lessons with examples & practice. Tap a chapter to learn.
          </p>

          {/* Overall progress */}
          <div className="mb-4 rounded-[16px] p-3.5" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>
                Chapters Completed
              </span>
              <span className="font-serif text-xs font-bold" style={{ color: 'var(--teal)' }}>
                {completedCount} / {total} ({pct}%)
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--paper-2)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--teal)' }} />
            </div>
            <p className="text-[11px] mt-1.5" style={{ color: 'var(--ink-soft)' }}>
              {left === 0 ? '🎉 All chapters complete!' : `${left} chapter${left === 1 ? '' : 's'} left`}
            </p>
          </div>

          {/* Level filter pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {FILTERS.map(f => {
              const isActive = level === f;
              return (
                <button
                  key={f}
                  onClick={() => {
                    setLevel(f);
                    if (f !== 'All') {
                      setCollapsedList(prev => prev.filter(l => l !== (f as GrammarLevel)));
                    }
                  }}
                  className="whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 text-center cursor-pointer"
                  style={
                    isActive
                      ? FILTER_ACTIVE[f]
                      : { background: 'var(--card)', color: 'var(--ink-soft)', border: '1.5px solid var(--line)' }
                  }
                >
                  {f}
                </button>
              );
            })}
          </div>

          {/* Chapters grouped by level */}
          {LEVELS.map(lvl => {
            const chapters = grouped[lvl];
            if (chapters.length === 0) return null;
            const lc = levelCounts[lvl];
            const isCollapsed = collapsedLevels.has(lvl);
            return (
              <div key={lvl} className="mb-6">
                <button
                  type="button"
                  onClick={() => toggleLevelCollapse(lvl)}
                  className="w-full flex items-center justify-between mb-3 text-left focus:outline-none group cursor-pointer"
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-[16px] font-semibold transition-colors group-hover:opacity-80" style={{ color: LEVEL_HEADER[lvl] }}>
                      {lvl}
                    </h2>
                    <ToggleIndicator expanded={!isCollapsed} className="opacity-60 group-hover:opacity-100" style={{ color: LEVEL_HEADER[lvl] }} />
                  </div>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full transition-opacity group-hover:opacity-80"
                    style={{
                      background: 'var(--paper-2)',
                      color: lc.done === lc.total && lc.total > 0 ? 'var(--teal)' : 'var(--ink-soft)',
                    }}
                  >
                    {lc.done}/{lc.total}
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 transition-all duration-300">
                    {chapters.map(ch => (
                      <ChapterCard
                        key={ch.slug}
                        chapter={ch}
                        completed={completedSet.has(ch.slug)}
                        score={progress.grammarScores?.[ch.slug]}
                        onOpen={() => navigate(`/grammar/${ch.slug}`)}
                        onToggleComplete={() => toggleGrammarComplete(ch.slug)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && <ScrollToTop targetRef={scrollRef} />}
      <BottomNav active="grammar" />
    </div>
  );
}
