import { useState } from 'react';
import { CheckIcon } from './Icon';

interface Props {
  emoji?: string;
  title: string;          // idiom text / word
  subtitle?: string;      // "category · difficulty" or "category · part_of_speech"
  meaningEn: string;
  meaningGu: string;
  example?: string;
  read: boolean;
  onToggleRead: () => void;
  accent?: 'teal' | 'amber';
}

/**
 * One expandable "today's" idiom/word card. Collapsed it's a compact row;
 * tapping reveals the meaning(s)/example and a mark-as-read action so the
 * daily item can be completed without leaving Home.
 */
export default function DailyItemCard({
  emoji,
  title,
  subtitle,
  meaningEn,
  meaningGu,
  example,
  read,
  onToggleRead,
  accent = 'teal',
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const accentColor = accent === 'amber' ? 'var(--saffron-deep)' : 'var(--teal)';
  const accentSoft = accent === 'amber' ? 'var(--amber-soft)' : 'var(--teal-soft)';

  return (
    <div
      className="rounded-[15px] overflow-hidden transition-all"
      style={{
        background: 'var(--card)',
        border: read ? '1.5px solid var(--teal)' : '1px solid var(--line)',
        opacity: read ? 0.7 : 1,
      }}
    >
      {/* Collapsed row — tap to expand */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-3.5 text-left transition-all active:scale-[.99]"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span
          className="w-9 h-9 rounded-[11px] grid place-items-center text-lg flex-shrink-0"
          style={{ background: accentSoft }}
        >
          {read ? <CheckIcon className="w-4 h-4" /> : emoji ?? '✨'}
        </span>
        <span className="flex-1 min-w-0">
          <span
            className="block font-serif text-[15px] font-semibold leading-tight truncate"
            style={{ color: 'var(--ink)' }}
          >
            {title}
          </span>
          {subtitle && (
            <span className="block text-[11px] leading-snug truncate" style={{ color: 'var(--ink-soft)' }}>
              {subtitle}
            </span>
          )}
        </span>
        {/* chevron */}
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round"
          className="w-4 h-4 flex-shrink-0 transition-transform"
          style={{ color: 'var(--ink-soft)', transform: expanded ? 'rotate(180deg)' : 'none' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-3.5 pb-3.5 -mt-1">
          <div
            className="rounded-xl px-3 py-2.5 mb-3"
            style={{ background: 'var(--paper-2)' }}
          >
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ink)' }}>
              {meaningEn}
            </p>
            {meaningGu && (
              <p className="text-[12.5px] font-guj mt-1 leading-relaxed" style={{ color: accentColor }}>
                {meaningGu}
              </p>
            )}
            {example && (
              <p className="text-[12px] italic mt-2 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                “{example}”
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onToggleRead}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-95"
            style={
              read
                ? { background: 'var(--teal-soft)', color: 'var(--teal)', border: 'none', cursor: 'pointer' }
                : { background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer' }
            }
          >
            <CheckIcon className="w-4 h-4" />
            {read ? 'Read' : 'Mark as read'}
          </button>
        </div>
      )}
    </div>
  );
}
