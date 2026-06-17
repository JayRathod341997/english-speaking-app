import type { GrammarT } from '../types';

interface Props {
  t?: GrammarT;
  /** Classes for the English line. */
  enClass?: string;
  /** Classes for the Gujarati line. */
  guClass?: string;
  /** Hide the Gujarati line (e.g. when English is the answer to reveal). */
  showGu?: boolean;
}

/**
 * Renders a bilingual {en, gu} node consistently across grammar blocks:
 * English primary (ink), Gujarati secondary in the Gujarati font (teal).
 */
export default function Bi({
  t,
  enClass = 'text-[14px] leading-relaxed',
  guClass = 'text-[12.5px] font-guj mt-0.5 leading-relaxed',
  showGu = true,
}: Props) {
  if (!t) return null;
  return (
    <div>
      {t.en && (
        <p className={enClass} style={{ color: 'var(--ink)' }}>
          {t.en}
        </p>
      )}
      {showGu && t.gu && (
        <p className={guClass} style={{ color: 'var(--teal)' }}>
          {t.gu}
        </p>
      )}
    </div>
  );
}
