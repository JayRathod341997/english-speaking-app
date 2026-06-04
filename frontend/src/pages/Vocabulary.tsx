import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Flashcard from '../components/Flashcard';
import PageHeader from '../components/PageHeader';
import ScrollToTop from '../components/ScrollToTop';
import { useLocalProgress } from '../hooks/useLocalProgress';
import { usePersistentState } from '../hooks/usePersistentState';
import { vocabularyApi } from '../services/api';
import type { VocabIndex, VocabWord } from '../types';

const ICONS = ['🗣️', '🏙️', '🧺', '🍽️'];

export default function Vocabulary() {
  const [index, setIndex] = useState<VocabIndex | null>(null);
  const [allWords, setAllWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = usePersistentState<'categories' | 'unread' | 'saved'>('vocab.tab', 'categories');
  const { progress, setWord } = useLocalProgress();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    vocabularyApi.index()
      .then(idx => {
        if (!active) return;
        setIndex(idx);
        const categoryIds = idx.category_summary.map(c => c.id);
        return Promise.all(categoryIds.map(id => vocabularyApi.category(id)));
      })
      .then(details => {
        if (!active || !details) return;
        const wordsList: VocabWord[] = [];
        for (const detail of details) {
          wordsList.push(...detail.words);
        }
        setAllWords(wordsList);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const catNameToId = useMemo(() => {
    const map: Record<string, number> = {};
    if (index) {
      for (const c of index.category_summary) {
        map[c.category] = c.id;
      }
    }
    return map;
  }, [index]);

  const savedWords = useMemo(() => {
    return allWords.filter(w => {
      const catId = catNameToId[w.category];
      if (!catId) return false;
      const wordKey = `${catId}-${w.id}`;
      return progress.vocab[wordKey]?.bookmarked;
    });
  }, [allWords, catNameToId, progress.vocab]);

  const unreadWords = useMemo(() => {
    return allWords.filter(w => {
      const catId = catNameToId[w.category];
      if (!catId) return false;
      const wordKey = `${catId}-${w.id}`;
      return !progress.vocab[wordKey]?.learned;
    });
  }, [allWords, catNameToId, progress.vocab]);

  /** Words learned within a category = progress keys prefixed `${categoryId}-`. */
  const learnedIn = (categoryId: number) =>
    Object.entries(progress.vocab).filter(
      ([key, v]) => key.startsWith(`${categoryId}-`) && v.learned
    ).length;

  return (
    <div className="relative flex flex-col h-[100dvh] overflow-x-hidden w-full" style={{ background: 'var(--paper)' }}>
      <PageHeader title="Vocabulary" subtitle="શબ્દભંડોળ" back="/" />

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          Loading…
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-4 pb-6">
          <div className="mb-4">
            <h2 className="font-serif text-2xl font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
              {index?.total_words} words to master
            </h2>
            <p className="font-guj text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
              એક દિવસમાં એક બેચ — ફ્લેશકાર્ડ, ઉચ્ચારણ અને ક્વિઝ સાથે.
            </p>
          </div>

          {/* Main Tab Switcher: Categories vs Unread vs Saved */}
          <div className="flex gap-2 mb-4 p-1 rounded-xl" style={{ background: 'var(--paper-2)' }}>
            <button
              onClick={() => setTab('categories')}
              className="flex-grow flex-shrink-0 flex-1 py-2 text-xs font-bold rounded-lg transition-all"
              style={
                tab === 'categories'
                  ? { background: 'var(--card)', color: 'var(--teal)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer' }
                  : { color: 'var(--ink-soft)', border: 'none', cursor: 'pointer' }
              }
            >
              Categories
            </button>
            <button
              onClick={() => setTab('unread')}
              className="flex-grow flex-shrink-0 flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1"
              style={
                tab === 'unread'
                  ? { background: 'var(--card)', color: 'var(--teal)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer' }
                  : { color: 'var(--ink-soft)', border: 'none', cursor: 'pointer' }
              }
            >
              📖 Unread ({unreadWords.length})
            </button>
            <button
              onClick={() => setTab('saved')}
              className="flex-grow flex-shrink-0 flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1"
              style={
                tab === 'saved'
                  ? { background: 'var(--card)', color: 'var(--teal)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer' }
                  : { color: 'var(--ink-soft)', border: 'none', cursor: 'pointer' }
              }
            >
              🔖 Saved ({savedWords.length})
            </button>
          </div>

          {tab === 'categories' ? (
            <div className="space-y-3">
              {index?.category_summary.map((c, i) => {
                const learned = learnedIn(c.id);
                const pct = c.total_words ? Math.round((learned / c.total_words) * 100) : 0;
                const best = progress.quizScores[c.id];
                return (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/vocabulary/${c.id}`)}
                    className="w-full text-left rounded-[16px] p-4 transition-all active:scale-[.98]"
                    style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-[13px] grid place-items-center text-2xl flex-shrink-0"
                        style={{ background: 'var(--paper-2)' }}
                      >
                        {ICONS[i % ICONS.length]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-[16px] font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
                          {c.category}
                        </h3>
                        <p className="text-[12px]" style={{ color: 'var(--ink-soft)' }}>
                          {c.total_words} words · {c.subcategories} batches
                          {best != null && ` · quiz best ${best}%`}
                        </p>
                      </div>
                      <span className="font-serif text-sm font-semibold" style={{ color: 'var(--teal)' }}>
                        {learned}/{c.total_words}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ background: 'var(--paper-2)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--teal)' }} />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : tab === 'unread' ? (
            <div className="space-y-4">
              {unreadWords.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {unreadWords.map(w => {
                    const catId = catNameToId[w.category];
                    const wordKey = `${catId}-${w.id}`;
                    const wp = progress.vocab[wordKey] ?? {};
                    return (
                      <Flashcard
                        key={w.id}
                        word={w}
                        learned={wp.learned}
                        spoken={wp.spoken}
                        bookmarked={wp.bookmarked}
                        onToggleLearned={() => setWord(wordKey, { learned: !wp.learned })}
                        onSpoken={() => setWord(wordKey, { spoken: true })}
                        onToggleBookmark={() => setWord(wordKey, { bookmarked: !wp.bookmarked })}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 px-4">
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                    All words completed!
                  </p>
                  <p className="text-xs mt-1 max-w-[240px] mx-auto" style={{ color: 'var(--ink-soft)' }}>
                    Great job! You have marked all words in the library as learned.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {savedWords.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedWords.map(w => {
                    const catId = catNameToId[w.category];
                    const wordKey = `${catId}-${w.id}`;
                    const wp = progress.vocab[wordKey] ?? {};
                    return (
                      <Flashcard
                        key={w.id}
                        word={w}
                        learned={wp.learned}
                        spoken={wp.spoken}
                        bookmarked={wp.bookmarked}
                        onToggleLearned={() => setWord(wordKey, { learned: !wp.learned })}
                        onSpoken={() => setWord(wordKey, { spoken: true })}
                        onToggleBookmark={() => setWord(wordKey, { bookmarked: !wp.bookmarked })}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 px-4">
                  <div className="text-4xl mb-3">🔖</div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                    No saved words yet
                  </p>
                  <p className="text-xs mt-1 max-w-[240px] mx-auto" style={{ color: 'var(--ink-soft)' }}>
                    Tap the bookmark icon on any flashcard inside a category to save it here for quick practice.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!loading && <ScrollToTop targetRef={scrollRef} />}
      <BottomNav active="vocabulary" />
    </div>
  );
}
