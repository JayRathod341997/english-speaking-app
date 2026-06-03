import { useState } from 'react';
import type { VocabWord } from '../types';
import { CheckIcon, FlipIcon } from './Icon';
import PronounceButton from './PronounceButton';

interface Props {
  word: VocabWord;
  learned?: boolean;
  spoken?: boolean;
  onToggleLearned?: () => void;
  onSpoken?: () => void;
}

export default function Flashcard({ word, learned, spoken, onToggleLearned, onSpoken }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="rounded-[15px] p-4 relative"
      style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
    >
      {/* difficulty + learned tick */}
      <div className="flex items-start justify-between mb-2">
        <span
          className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md"
          style={
            word.difficulty === 'Advanced'
              ? { background: 'var(--rose-soft)', color: 'var(--rose)' }
              : { background: 'var(--amber-soft)', color: 'var(--amber)' }
          }
        >
          {word.difficulty}
        </span>
        <button
          type="button"
          onClick={onToggleLearned}
          aria-label="Mark learned"
          className="w-7 h-7 rounded-full grid place-items-center transition-transform active:scale-90"
          style={
            learned
              ? { background: 'var(--teal)', color: '#fff' }
              : { background: 'var(--paper-2)', color: 'var(--ink-soft)' }
          }
        >
          <CheckIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Front: word */}
      <button type="button" onClick={() => setFlipped(f => !f)} className="text-left w-full">
        <h4 className="font-serif text-xl font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
          {word.word}
        </h4>
        <p className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>
          {word.part_of_speech} · <span className="font-guj">{word.gujarati_pronunciation}</span>
        </p>
      </button>

      {/* Back: meaning + details (revealed on flip) */}
      {flipped && (
        <div className="mt-3 space-y-2 bubble-pop">
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ink)' }}>
            {word.english_meaning}
          </p>
          <p className="text-[13px] font-guj leading-relaxed" style={{ color: 'var(--teal)' }}>
            {word.gujarati_meaning}
          </p>
          {word.collocations && word.collocations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {word.collocations.map(c => (
                <span
                  key={c}
                  className="text-[11px] px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--paper-2)', color: 'var(--ink-soft)' }}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
          {word.examples?.[0] && (
            <p className="text-[12px] italic" style={{ color: 'var(--ink-soft)' }}>
              “{word.examples[0]}”
            </p>
          )}
          {word.usage_note && (
            <p className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>
              💡 {word.usage_note}
            </p>
          )}
        </div>
      )}

      {/* Footer: flip + pronounce */}
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
        <button
          type="button"
          onClick={() => setFlipped(f => !f)}
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: 'var(--ink-soft)' }}
        >
          <FlipIcon className="w-4 h-4" />
          {flipped ? 'Hide' : 'Reveal'}
        </button>
        <PronounceButton
          target={word.word}
          size="sm"
          onResult={(ok) => { if (ok) onSpoken?.(); }}
        />
      </div>

      {spoken && (
        <span className="absolute bottom-2 right-3 text-[10px] font-semibold" style={{ color: 'var(--teal)' }}>
          ✓ spoken
        </span>
      )}
    </div>
  );
}
