import { useEffect, useMemo, useRef, useState } from 'react';
import BottomNav from '../components/BottomNav';
import IdiomCard from '../components/IdiomCard';
import PageHeader from '../components/PageHeader';
import ScrollToTop from '../components/ScrollToTop';
import { useLocalProgress } from '../hooks/useLocalProgress';
import { usePersistentState } from '../hooks/usePersistentState';
import { idiomsApi } from '../services/api';
import type { IdiomsLibrary } from '../types';

const PAGE = 12;
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];



export default function Idioms() {
  const [lib, setLib] = useState<IdiomsLibrary | null>(null);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = usePersistentState('idioms.cat', 'All');
  const [diff, setDiff] = usePersistentState('idioms.diff', 'All');
  const [limit, setLimit] = useState(PAGE);
  const [filter, setFilter] = usePersistentState<'all' | 'unread' | 'saved'>('idioms.filter', 'all');
  const [isCategoriesExpanded, setIsCategoriesExpanded] = usePersistentState('idioms.catExpanded', false);
  const { progress, toggleIdiomBookmark, toggleIdiomLearned } = useLocalProgress();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    idiomsApi.list().then(setLib).finally(() => setLoading(false));
  }, []);

  const totalIdioms = lib?.total_idioms ?? 0;
  const learnedSet = useMemo(() => new Set(progress.learnedIdioms ?? []), [progress.learnedIdioms]);
  const learnedCount = useMemo(() => lib?.idioms.filter(i => learnedSet.has(i.id)).length ?? 0, [lib, learnedSet]);
  const unreadCount = useMemo(() => lib?.idioms.filter(i => !learnedSet.has(i.id)).length ?? 0, [lib, learnedSet]);
  const pct = useMemo(() => totalIdioms ? Math.round((learnedCount / totalIdioms) * 100) : 0, [totalIdioms, learnedCount]);

  const displayedCategories = useMemo(() => {
    if (!lib) return [];
    if (isCategoriesExpanded) return lib.categories;
    const firstThree = lib.categories.slice(0, 3);
    if (cat !== 'All' && !firstThree.includes(cat)) {
      return [...firstThree, cat];
    }
    return firstThree;
  }, [lib, isCategoriesExpanded, cat]);

  const hiddenCount = useMemo(() => {
    if (!lib) return 0;
    return lib.categories.length - displayedCategories.length;
  }, [lib, displayedCategories]);

  const filtered = useMemo(() => {
    if (!lib) return [];
    const bookmarks = new Set(progress.idiomBookmarks);
    return lib.idioms.filter(
      i =>
        (filter === 'all' ||
         (filter === 'saved' && bookmarks.has(i.id)) ||
         (filter === 'unread' && !learnedSet.has(i.id))) &&
        (cat === 'All' || i.category === cat) &&
        (diff === 'All' || i.difficulty === diff)
    );
  }, [lib, cat, diff, filter, progress.idiomBookmarks, learnedSet]);

  // reset pagination whenever a filter changes
  const setCatFiltered = (c: string) => { setCat(c); setLimit(PAGE); };
  const setDiffFiltered = (d: string) => { setDiff(d); setLimit(PAGE); };
  const setFilterFiltered = (f: 'all' | 'unread' | 'saved') => { setFilter(f); setLimit(PAGE); };
  const visible = filtered.slice(0, limit);
  const bookmarks = new Set(progress.idiomBookmarks);

  return (
    <div className="relative flex flex-col h-[100dvh] overflow-x-hidden w-full" style={{ background: 'var(--paper)' }}>
      <PageHeader title="Idioms Library" subtitle="રૂઢિપ્રયોગો" back="/" />

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          Loading idioms…
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-4 pb-6">
          <p className="text-sm mb-3" style={{ color: 'var(--ink-soft)' }}>
            {lib?.total_idioms} idioms with meanings, examples & pronunciation. Tap 🔊 to hear, 🎙 to practise.
          </p>

          {/* Progress Bar */}
          <div className="mb-4 rounded-[16px] p-3.5" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>
                Idioms Mastered
              </span>
              <span className="font-serif text-xs font-bold" style={{ color: 'var(--teal)' }}>
                {learnedCount} / {totalIdioms} ({pct}%)
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--paper-2)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--teal)' }} />
            </div>
          </div>

          {/* Main Tab Switcher: All vs Unread vs Saved */}
          <div className="flex gap-2 mb-4 p-1 rounded-xl" style={{ background: 'var(--paper-2)' }}>
            <button
              onClick={() => setFilterFiltered('all')}
              className="flex-grow flex-shrink-0 flex-1 py-2 text-xs font-bold rounded-lg transition-all"
              style={
                filter === 'all'
                  ? { background: 'var(--card)', color: 'var(--teal)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer' }
                  : { color: 'var(--ink-soft)', border: 'none', cursor: 'pointer' }
              }
            >
              All Idioms
            </button>
            <button
              onClick={() => setFilterFiltered('unread')}
              className="flex-grow flex-shrink-0 flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1"
              style={
                filter === 'unread'
                  ? { background: 'var(--card)', color: 'var(--teal)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer' }
                  : { color: 'var(--ink-soft)', border: 'none', cursor: 'pointer' }
              }
            >
              📖 Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilterFiltered('saved')}
              className="flex-grow flex-shrink-0 flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
              style={
                filter === 'saved'
                  ? { background: 'var(--card)', color: 'var(--teal)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer' }
                  : { color: 'var(--ink-soft)', border: 'none', cursor: 'pointer' }
              }
            >
              🔖 Saved ({bookmarks.size})
            </button>
          </div>

          {/* Filters Panel */}
          <div className="rounded-[18px] p-4 mb-4 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
            {/* Difficulty Group */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="text-sm">📊</span>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)] opacity-70">
                  Difficulty Level
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DIFFICULTIES.map(d => {
                  const isActive = diff === d;
                  let activeStyle = { background: 'var(--teal)', color: '#fff', border: '1.5px solid var(--teal)' };
                  if (d === 'All') {
                    activeStyle = { background: 'var(--ink)', color: '#fff', border: '1.5px solid var(--ink)' };
                  } else if (d === 'Beginner') {
                    activeStyle = { background: 'var(--teal)', color: '#fff', border: '1.5px solid var(--teal)' };
                  } else if (d === 'Intermediate') {
                    activeStyle = { background: 'var(--amber)', color: '#fff', border: '1.5px solid var(--amber)' };
                  } else if (d === 'Advanced') {
                    activeStyle = { background: 'var(--rose)', color: '#fff', border: '1.5px solid var(--rose)' };
                  }

                  return (
                    <button
                      key={d}
                      onClick={() => setDiffFiltered(d)}
                      className="whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 text-center cursor-pointer"
                      style={
                        isActive
                          ? activeStyle
                          : { background: 'var(--paper)', color: 'var(--ink-soft)', border: '1.5px solid transparent' }
                      }
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider line */}
            <div style={{ borderTop: '1px solid var(--line)', opacity: 0.5 }} />

            {/* Topic Group */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="text-sm">🏷️</span>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)] opacity-70">
                  Topic / Category
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCatFiltered('All')}
                  className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  style={
                    cat === 'All'
                      ? { background: 'var(--teal)', color: '#fff', border: '1.5px solid var(--teal)' }
                      : { background: 'var(--paper)', color: 'var(--ink-soft)', border: '1.5px solid transparent' }
                  }
                >
                  All Topics
                </button>
                {displayedCategories.map(c => {
                  const isActive = cat === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setCatFiltered(c)}
                      className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer"
                      style={
                        isActive
                          ? { background: 'var(--teal)', color: '#fff', border: '1.5px solid var(--teal)' }
                          : { background: 'var(--paper)', color: 'var(--ink-soft)', border: '1.5px solid transparent' }
                      }
                    >
                      {c}
                    </button>
                  );
                })}
                {hiddenCount > 0 && (
                  <button
                    onClick={() => setIsCategoriesExpanded(true)}
                    className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    style={{ background: 'var(--paper-2)', color: 'var(--teal)', border: '1.5px solid transparent' }}
                  >
                    + {hiddenCount} More
                  </button>
                )}
                {isCategoriesExpanded && (
                  <button
                    onClick={() => setIsCategoriesExpanded(false)}
                    className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    style={{ background: 'var(--paper-2)', color: 'var(--teal)', border: '1.5px solid transparent' }}
                  >
                    Show Less
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visible.map(idiom => (
              <IdiomCard
                key={idiom.id}
                idiom={idiom}
                bookmarked={bookmarks.has(idiom.id)}
                learned={learnedSet.has(idiom.id)}
                onToggleBookmark={() => toggleIdiomBookmark(idiom.id)}
                onToggleLearned={() => toggleIdiomLearned(idiom.id)}
              />
            ))}
          </div>

          {visible.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="text-4xl mb-3">
                {filter === 'saved' ? '🔖' : filter === 'unread' ? '📖' : '🔍'}
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                {filter === 'saved'
                  ? "No saved idioms yet"
                  : filter === 'unread'
                  ? "All idioms completed!"
                  : "No idioms match these filters"}
              </p>
              <p className="text-xs mt-1 max-w-[240px] mx-auto" style={{ color: 'var(--ink-soft)' }}>
                {filter === 'saved'
                  ? "Tap the bookmark icon on any idiom card to save it here for quick practice."
                  : filter === 'unread'
                  ? "Great job! You have marked all idioms as learned."
                  : "Try clearing some filters to see more idioms."}
              </p>
            </div>
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

      {!loading && <ScrollToTop targetRef={scrollRef} />}
      <BottomNav active="idioms" />
    </div>
  );
}
