import type { Idiom } from '../types';
import { BookmarkIcon } from './Icon';
import PronounceButton from './PronounceButton';

interface Props {
  idiom: Idiom;
  bookmarked: boolean;
  onToggleBookmark: () => void;
}

const DIFF_STYLE: Record<string, React.CSSProperties> = {
  Beginner:     { background: 'var(--teal-soft)', color: 'var(--teal)' },
  Intermediate: { background: 'var(--amber-soft)', color: 'var(--amber)' },
  Advanced:     { background: 'var(--rose-soft)', color: 'var(--rose)' },
};

/** Bold the idiom phrase within an example sentence. */
function highlight(example: string, idiom: string) {
  const idx = example.toLowerCase().indexOf(idiom.toLowerCase());
  if (idx === -1) return example;
  return (
    <>
      {example.slice(0, idx)}
      <strong style={{ color: 'var(--ink)' }}>{example.slice(idx, idx + idiom.length)}</strong>
      {example.slice(idx + idiom.length)}
    </>
  );
}

export default function IdiomCard({ idiom, bookmarked, onToggleBookmark }: Props) {
  return (
    <div
      className="rounded-[15px] p-4 flex flex-col"
      style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
    >
      <div className="flex items-start justify-between mb-2">
        <span
          className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md"
          style={DIFF_STYLE[idiom.difficulty] ?? DIFF_STYLE.Intermediate}
        >
          {idiom.difficulty}
        </span>
        <button
          type="button"
          onClick={onToggleBookmark}
          aria-label="Bookmark"
          className="transition-transform active:scale-90"
          style={{ color: bookmarked ? 'var(--saffron-deep)' : 'var(--ink-soft)' }}
        >
          <BookmarkIcon className="w-5 h-5" filled={bookmarked} />
        </button>
      </div>

      <h3 className="font-serif text-lg font-semibold leading-snug" style={{ color: 'var(--ink)' }}>
        {idiom.idiom}
      </h3>
      <p className="text-[13px] font-guj font-medium mt-0.5" style={{ color: 'var(--teal)' }}>
        {idiom.gujarati_meaning}
      </p>

      <div
        className="text-[12px] leading-relaxed rounded-lg px-3 py-2 mt-2"
        style={{ background: 'var(--paper-2)', color: 'var(--ink-soft)' }}
      >
        {idiom.english_meaning}
      </div>

      {idiom.examples?.[0] && (
        <p className="text-[12px] italic mt-2" style={{ color: 'var(--ink-soft)' }}>
          {highlight(idiom.examples[0], idiom.idiom)}
        </p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
        <span className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>{idiom.category}</span>
        <PronounceButton target={idiom.idiom} size="sm" />
      </div>
    </div>
  );
}
