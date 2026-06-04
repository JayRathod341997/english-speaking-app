import type { GrammarChapterSummary, GrammarLevel } from '../types';
import Bi from './Bi';
import { CheckIcon } from './Icon';

interface Props {
  chapter: GrammarChapterSummary;
  completed: boolean;
  score?: number; // best practice percent, if any
  onOpen: () => void;
  onToggleComplete: () => void;
}

export const LEVEL_STYLE: Record<GrammarLevel, React.CSSProperties> = {
  Beginner: { background: 'var(--teal-soft)', color: 'var(--teal)' },
  Intermediate: { background: 'var(--amber-soft)', color: 'var(--amber)' },
  Advanced: { background: 'var(--rose-soft)', color: 'var(--rose)' },
};

export default function ChapterCard({
  chapter,
  completed,
  score,
  onOpen,
  onToggleComplete,
}: Props) {
  return (
    <div
      className="rounded-[15px] p-4 flex flex-col text-left transition-all"
      style={{
        background: 'var(--card)',
        border: completed ? '1.5px solid var(--teal)' : '1px solid var(--line)',
      }}
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-7 h-7 rounded-full grid place-items-center text-[12px] font-bold flex-shrink-0 font-serif"
            style={{ background: 'var(--paper-2)', color: 'var(--ink-soft)' }}
          >
            {chapter.order}
          </span>
          <span
            className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md"
            style={LEVEL_STYLE[chapter.level]}
          >
            {chapter.level}
          </span>
        </div>
        {/* Quick mark-done toggle (no need to open the chapter) */}
        <button
          type="button"
          onClick={onToggleComplete}
          aria-label={completed ? 'Mark not complete' : 'Mark complete'}
          className="w-7 h-7 rounded-full grid place-items-center transition-transform active:scale-90 flex-shrink-0"
          style={
            completed
              ? { background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer' }
              : { background: 'var(--paper-2)', color: 'var(--ink-soft)', border: 'none', cursor: 'pointer' }
          }
        >
          <CheckIcon className="w-4 h-4" />
        </button>
      </div>

      <button type="button" onClick={onOpen} className="text-left" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <h3 className="font-serif text-[16px] font-semibold leading-snug" style={{ color: 'var(--ink)' }}>
          {chapter.title.en}
        </h3>
        {chapter.title.gu && (
          <p className="text-[12.5px] font-guj font-medium mt-0.5" style={{ color: 'var(--teal)' }}>
            {chapter.title.gu}
          </p>
        )}
        {chapter.summary && (
          <div
            className="text-[12px] leading-relaxed rounded-lg px-3 py-2 mt-2"
            style={{ background: 'var(--paper-2)', color: 'var(--ink-soft)' }}
          >
            <Bi
              t={chapter.summary}
              enClass="text-[12px] leading-relaxed"
              guClass="text-[11.5px] font-guj mt-1 leading-relaxed"
            />
          </div>
        )}
      </button>

      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
        <span className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>
          {chapter.explanation_count} lessons · {chapter.practice_count} exercises
        </span>
        {completed ? (
          <span className="text-[11px] font-bold flex items-center gap-1" style={{ color: 'var(--teal)' }}>
            <CheckIcon className="w-3.5 h-3.5" /> Completed
          </span>
        ) : score !== undefined ? (
          <span className="text-[11px] font-semibold" style={{ color: 'var(--amber)' }}>
            {score}% best
          </span>
        ) : (
          <span className="text-[11px]" style={{ color: 'var(--ink-soft)', opacity: 0.7 }}>
            Not started
          </span>
        )}
      </div>
    </div>
  );
}
