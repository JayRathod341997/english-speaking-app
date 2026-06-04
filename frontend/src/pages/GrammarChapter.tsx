import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Bi from '../components/Bi';
import ExplanationBlock from '../components/ExplanationBlock';
import { LEVEL_STYLE } from '../components/ChapterCard';
import { CheckIcon } from '../components/Icon';
import PageHeader from '../components/PageHeader';
import PracticeItem from '../components/PracticeItem';
import ScrollToTop from '../components/ScrollToTop';
import { useLocalProgress } from '../hooks/useLocalProgress';
import { grammarApi } from '../services/api';
import type { GrammarChapter as Chapter, GrammarChapterSummary, GrammarLevel } from '../types';

function levelOf(order: number): GrammarLevel {
  if (order <= 7) return 'Beginner';
  if (order <= 14) return 'Intermediate';
  return 'Advanced';
}

export default function GrammarChapter() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapterList, setChapterList] = useState<GrammarChapterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'learn' | 'practice'>('learn');
  const { progress, toggleGrammarComplete, setGrammarScore } = useLocalProgress();

  // Track auto-graded answers (mcq + fill_blank) for the live score.
  const [answered, setAnswered] = useState<Record<number, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setTab('learn');
    setAnswered({});
    grammarApi.chapter(slug).then(setChapter).finally(() => setLoading(false));
  }, [slug]);

  // Always start a newly-opened chapter from the top. The scroll container is
  // only mounted once `chapter` is loaded (loading shows a different tree), so
  // reset here rather than in the fetch effect to guarantee the ref exists.
  useEffect(() => {
    if (chapter) scrollRef.current?.scrollTo({ top: 0 });
  }, [chapter]);

  // Lightweight index (cached by the browser) to resolve prev/next neighbours.
  useEffect(() => {
    grammarApi.index().then(idx => setChapterList(idx.chapters)).catch(() => {});
  }, []);

  const curIdx = chapterList.findIndex(c => c.slug === slug);
  const prevChapter = curIdx > 0 ? chapterList[curIdx - 1] : null;
  const nextChapter = curIdx >= 0 && curIdx < chapterList.length - 1 ? chapterList[curIdx + 1] : null;

  const completed = (progress.grammarCompleted ?? []).includes(slug);

  const gradedTotal = useMemo(
    () => (chapter?.practice ?? []).filter(p => p.type === 'mcq' || p.type === 'fill_blank').length,
    [chapter]
  );
  const correctCount = useMemo(() => Object.values(answered).filter(Boolean).length, [answered]);
  const scorePct = gradedTotal ? Math.round((correctCount / gradedTotal) * 100) : 0;

  const handleAnswered = useCallback((idx: number, correct: boolean) => {
    setAnswered(prev => (idx in prev ? prev : { ...prev, [idx]: correct }));
  }, []);

  const markComplete = () => {
    if (!completed && gradedTotal > 0) setGrammarScore(slug, scorePct);
    toggleGrammarComplete(slug);
  };

  if (loading || !chapter) {
    return (
      <div className="flex flex-col h-[100dvh]" style={{ background: 'var(--paper)' }}>
        <PageHeader title="Grammar" back="/grammar" />
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          {loading ? 'Loading chapter…' : 'Chapter not found.'}
        </div>
        <BottomNav active="grammar" />
      </div>
    );
  }

  const level = levelOf(chapter.order);

  return (
    <div className="relative flex flex-col h-[100dvh] overflow-x-hidden w-full" style={{ background: 'var(--paper)' }}>
      <PageHeader title={chapter.title.en} subtitle={chapter.title.gu} back="/grammar" />

      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-4 pb-6">
        {/* Header strip */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="w-7 h-7 rounded-full grid place-items-center text-[12px] font-bold font-serif"
            style={{ background: 'var(--paper-2)', color: 'var(--ink-soft)' }}
          >
            {chapter.order}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md" style={LEVEL_STYLE[level]}>
            {level}
          </span>
          {completed && (
            <span className="text-[11px] font-bold flex items-center gap-1" style={{ color: 'var(--teal)' }}>
              <CheckIcon className="w-3.5 h-3.5" /> Completed
            </span>
          )}
        </div>

        {chapter.summary && (
          <div className="rounded-[15px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
            <Bi t={chapter.summary} />
          </div>
        )}

        {/* Learn / Practice switcher */}
        <div className="flex gap-2 mb-4 p-1 rounded-xl" style={{ background: 'var(--paper-2)' }}>
          <button
            onClick={() => setTab('learn')}
            className="flex-1 py-2 text-xs font-bold rounded-lg transition-all"
            style={
              tab === 'learn'
                ? { background: 'var(--card)', color: 'var(--teal)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer' }
                : { color: 'var(--ink-soft)', border: 'none', cursor: 'pointer' }
            }
          >
            📖 Learn ({chapter.explanations.length})
          </button>
          <button
            onClick={() => setTab('practice')}
            className="flex-1 py-2 text-xs font-bold rounded-lg transition-all"
            style={
              tab === 'practice'
                ? { background: 'var(--card)', color: 'var(--teal)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer' }
                : { color: 'var(--ink-soft)', border: 'none', cursor: 'pointer' }
            }
          >
            ✏️ Practice ({chapter.practice.length})
          </button>
        </div>

        {tab === 'learn' ? (
          <div className="space-y-3">
            {chapter.explanations.map((block, i) => (
              <ExplanationBlock key={block.id ?? i} block={block} />
            ))}
            <button
              onClick={() => setTab('practice')}
              className="w-full mt-2 py-3 rounded-[14px] font-bold text-sm text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, var(--saffron), var(--saffron-deep))' }}
            >
              Practice this chapter ✏️
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {gradedTotal > 0 && (
              <div className="flex items-center justify-between rounded-[12px] px-4 py-2.5" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
                <span className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>Live score</span>
                <span className="font-serif text-sm font-bold" style={{ color: 'var(--teal)' }}>
                  {correctCount} / {gradedTotal} ({scorePct}%)
                </span>
              </div>
            )}

            {chapter.practice.map((item, i) => (
              <PracticeItem
                key={item.id ?? i}
                item={item}
                index={i}
                onAnswered={(correct) => handleAnswered(i, correct)}
              />
            ))}

            {/* Mark complete */}
            <button
              onClick={markComplete}
              className="w-full mt-2 py-3.5 rounded-[14px] font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              style={
                completed
                  ? { background: 'var(--teal-soft)', color: 'var(--teal)', border: '1.5px solid var(--teal)' }
                  : { background: 'linear-gradient(135deg, var(--teal), #155f53)', color: '#fff', border: 'none' }
              }
            >
              <CheckIcon className="w-4 h-4" />
              {completed ? '✓ Completed — tap to undo' : 'Mark chapter complete'}
            </button>
          </div>
        )}

        {/* Prev / Next chapter navigation */}
        {(prevChapter || nextChapter) && (
          <div className="flex items-stretch gap-2 mt-4">
            <button
              onClick={() => prevChapter && navigate(`/grammar/${prevChapter.slug}`)}
              disabled={!prevChapter}
              className="flex-1 py-3 px-3 rounded-[14px] text-left transition-all active:scale-[.97] disabled:opacity-40 disabled:active:scale-100"
              style={{ background: 'var(--card)', border: '1px solid var(--line)', cursor: prevChapter ? 'pointer' : 'default' }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--ink-soft)' }}>
                ‹ Previous
              </span>
              {prevChapter && (
                <span className="block text-[12.5px] font-semibold leading-tight truncate" style={{ color: 'var(--ink)' }}>
                  {prevChapter.title.en}
                </span>
              )}
            </button>
            <button
              onClick={() => nextChapter && navigate(`/grammar/${nextChapter.slug}`)}
              disabled={!nextChapter}
              className="flex-1 py-3 px-3 rounded-[14px] text-right transition-all active:scale-[.97] disabled:opacity-40 disabled:active:scale-100"
              style={{
                background: nextChapter ? 'var(--teal-soft)' : 'var(--card)',
                border: nextChapter ? '1px solid var(--teal)' : '1px solid var(--line)',
                cursor: nextChapter ? 'pointer' : 'default',
              }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: nextChapter ? 'var(--teal)' : 'var(--ink-soft)' }}
              >
                Next chapter ›
              </span>
              {nextChapter && (
                <span className="block text-[12.5px] font-bold leading-tight truncate" style={{ color: 'var(--teal)' }}>
                  {nextChapter.title.en}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      <ScrollToTop targetRef={scrollRef} />
      <BottomNav active="grammar" />
    </div>
  );
}
