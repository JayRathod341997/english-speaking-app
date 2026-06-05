import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { PlusIcon, MinusIcon } from '../components/Icon';
import Flashcard from '../components/Flashcard';
import PageHeader from '../components/PageHeader';
import PronounceButton from '../components/PronounceButton';
import ScrollToTop from '../components/ScrollToTop';
import { useLocalProgress } from '../hooks/useLocalProgress';
import { usePersistentState } from '../hooks/usePersistentState';
import { vocabularyApi } from '../services/api';
import type { MiniDialogue, VocabCategoryDetail, VocabWord } from '../types';

export default function VocabularyCategory() {
  const { categoryId } = useParams();
  const id = Number(categoryId);
  const [cat, setCat] = useState<VocabCategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = usePersistentState<'words' | 'dialogues'>('vocabCat.tab', 'words');
  const [showUnreadOnly, setShowUnreadOnly] = usePersistentState('vocabCat.unreadOnly', false);
  const [collapsedMap, setCollapsedMap] = usePersistentState<Record<string, boolean>>(
    'vocabCat.collapsedBatches',
    {}
  );
  const { progress, setWord } = useLocalProgress();
  const navigate = useNavigate();

  const toggleBatchCollapse = (subcat: string) => {
    setCollapsedMap(prev => ({
      ...prev,
      [`${id}-${subcat}`]: !prev[`${id}-${subcat}`],
    }));
  };
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    vocabularyApi.category(id).then(c => { if (active) { setCat(c); setLoading(false); } });
    return () => { active = false; };
  }, [id]);

  const key = useCallback((wordId: number) => `${id}-${wordId}`, [id]);

  // group words by subcategory (= "batch") preserving order
  const batches = useMemo(() => {
    if (!cat) return [];
    const map = new Map<string, VocabWord[]>();
    for (const w of cat.words) {
      const isLearned = progress.vocab[key(w.id)]?.learned;
      if (showUnreadOnly && isLearned) continue;

      if (!map.has(w.subcategory)) map.set(w.subcategory, []);
      map.get(w.subcategory)!.push(w);
    }
    return Array.from(map.entries());
  }, [cat, showUnreadOnly, progress.vocab, key]);

  const learnedCount = cat
    ? cat.words.filter(w => progress.vocab[key(w.id)]?.learned).length
    : 0;

  return (
    <div className="relative flex flex-col h-[100dvh] overflow-x-hidden w-full" style={{ background: 'var(--paper)' }}>
      <PageHeader title={cat?.category ?? 'Vocabulary'} subtitle={cat?.level} back="/vocabulary" />

      {loading || !cat ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          Loading…
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-4 pb-6">
          {/* progress bar */}
          <div className="w-full h-2 rounded-full overflow-hidden mb-4" style={{ background: 'var(--paper-2)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${cat.total_words > 0 ? (learnedCount / cat.total_words) * 100 : 0}%`,
                background: 'var(--teal)',
              }}
            />
          </div>

          {/* progress + quiz CTA */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
              {learnedCount}/{cat.total_words} learned
            </p>
            <button
              onClick={() => navigate(`/vocabulary/${id}/quiz`)}
              className="text-sm font-bold px-4 py-2 rounded-xl text-white transition-transform active:scale-95"
              style={{ background: 'linear-gradient(135deg, var(--saffron), var(--saffron-deep))' }}
            >
              Take Quiz →
            </button>
          </div>

          {/* tabs */}
          <div className="flex gap-2 mb-4">
            {(['words', 'dialogues'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                style={
                  tab === t
                    ? { background: 'var(--teal)', color: '#fff', border: '1.5px solid var(--teal)' }
                    : { background: 'var(--card)', color: 'var(--ink-soft)', border: '1.5px solid var(--line)' }
                }
              >
                {t === 'words' ? 'Flashcards' : `Dialogues (${cat.mini_dialogues.length})`}
              </button>
            ))}
          </div>

          {tab === 'words' && (
            <div className="flex justify-end mb-3">
              <button
                type="button"
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className="text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5"
                style={
                  showUnreadOnly
                    ? { background: 'var(--teal-soft)', color: 'var(--teal)', border: '1.5px solid var(--teal)' }
                    : { background: 'var(--card)', color: 'var(--ink-soft)', border: '1.5px solid var(--line)' }
                }
              >
                📖 Unread Only
              </button>
            </div>
          )}

          {tab === 'words' ? (
            <div className="space-y-6">
              {batches.length > 0 ? (
                batches.map(([subcat, words], i) => {
                  const isCollapsed = !!collapsedMap[`${id}-${subcat}`];
                  const allBatchWords = cat.words.filter(w => w.subcategory === subcat);
                  const totalCount = allBatchWords.length;
                  const unreadCount = allBatchWords.filter(w => !progress.vocab[key(w.id)]?.learned).length;
                  const pctRemaining = totalCount > 0 ? Math.round((unreadCount / totalCount) * 100) : 0;

                  return (
                    <div key={subcat}>
                      <button
                        type="button"
                        onClick={() => toggleBatchCollapse(subcat)}
                        className="w-full flex items-center justify-between py-2 text-left focus:outline-none group cursor-pointer mb-2"
                        style={{ background: 'none', border: 'none', padding: 0 }}
                      >
                        <h3 className="font-serif text-[15px] font-semibold flex flex-wrap items-center gap-x-2 gap-y-0.5" style={{ color: 'var(--ink)' }}>
                          <span>Batch {i + 1} · {subcat}</span>
                          <span className="text-[11px] font-sans font-normal" style={{ color: 'var(--ink-soft)' }}>
                            ({unreadCount}/{totalCount} · {pctRemaining}% remaining)
                          </span>
                        </h3>
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                          style={{ background: 'var(--paper-2)', color: 'var(--ink-soft)' }}
                        >
                          {isCollapsed ? (
                            <PlusIcon className="w-3.5 h-3.5" />
                          ) : (
                            <MinusIcon className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </button>
                      {!isCollapsed && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {words.map(w => {
                            const wp = progress.vocab[key(w.id)] ?? {};
                            return (
                              <Flashcard
                                key={w.id}
                                word={w}
                                learned={wp.learned}
                                spoken={wp.spoken}
                                bookmarked={wp.bookmarked}
                                onToggleLearned={() => setWord(key(w.id), { learned: !wp.learned })}
                                onSpoken={() => setWord(key(w.id), { spoken: true })}
                                onToggleBookmark={() => setWord(key(w.id), { bookmarked: !wp.bookmarked })}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 px-4">
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                    All words completed!
                  </p>
                  <p className="text-xs mt-1 max-w-[240px] mx-auto" style={{ color: 'var(--ink-soft)' }}>
                    {showUnreadOnly
                      ? "Turn off the 'Unread Only' filter to review all words."
                      : "Great job! You have learned every word in this category."}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {cat.mini_dialogues.map(d => <DialogueCard key={d.id} dialogue={d} />)}
            </div>
          )}
        </div>
      )}

      {!loading && cat && <ScrollToTop targetRef={scrollRef} />}
      <BottomNav active="vocabulary" />
    </div>
  );
}

function DialogueCard({ dialogue }: { dialogue: MiniDialogue }) {
  return (
    <div className="rounded-[16px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
      <h4 className="font-serif text-[15px] font-semibold" style={{ color: 'var(--ink)' }}>
        {dialogue.title}
      </h4>
      <p className="text-[12px] mb-3" style={{ color: 'var(--ink-soft)' }}>{dialogue.situation}</p>
      <div className="space-y-2.5">
        {dialogue.turns.map((turn, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--ink-soft)' }}>
                {turn.speaker}
              </p>
              <p className="text-[13px] leading-snug" style={{ color: 'var(--ink)' }}>{turn.text}</p>
            </div>
            <PronounceButton target={turn.text} size="sm" hideResult />
          </div>
        ))}
      </div>
    </div>
  );
}
