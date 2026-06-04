import { useState } from 'react';
import type { PracticeItem as Item } from '../types';
import Bi from './Bi';
import { CheckIcon, XIcon } from './Icon';
import PronounceButton from './PronounceButton';

interface Props {
  item: Item;
  index: number;
  /** Called once, when an auto-graded item is first answered. */
  onAnswered?: (correct: boolean) => void;
}

const CARD: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--line)' };

/** Lowercase, strip punctuation, collapse whitespace — for forgiving free-text compare. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function QuestionNumber({ index }: { index: number }) {
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ background: 'var(--paper-2)', color: 'var(--ink-soft)' }}
    >
      Q{index + 1}
    </span>
  );
}

/** Coloured "answer revealed" / solution box. */
function ResultBox({ correct, children }: { correct?: boolean; children: React.ReactNode }) {
  const style: React.CSSProperties =
    correct === undefined
      ? { background: 'var(--paper-2)', color: 'var(--ink)' }
      : correct
      ? { background: 'var(--teal-soft)', color: 'var(--teal)' }
      : { background: 'var(--rose-soft)', color: 'var(--rose)' };
  return (
    <div className="mt-3 rounded-lg px-3 py-2.5 text-[13px]" style={style}>
      {children}
    </div>
  );
}

function Mcq({ item, index, onAnswered }: { item: Extract<Item, { type: 'mcq' }> } & Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const choose = (optId: string) => {
    if (picked) return;
    setPicked(optId);
    onAnswered?.(optId === item.answer);
  };
  return (
    <div className="rounded-[15px] p-4" style={CARD}>
      <div className="flex items-center gap-2 mb-2">
        <QuestionNumber index={index} />
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-soft)' }}>
          Choose one
        </span>
      </div>
      <Bi t={item.prompt} enClass="text-[14px] font-medium leading-relaxed" />
      <div className="space-y-2 mt-3">
        {item.options.map(opt => {
          const isAnswer = opt.id === item.answer;
          const isPicked = opt.id === picked;
          let style: React.CSSProperties = { background: 'var(--paper)', border: '1px solid var(--line)', color: 'var(--ink)' };
          if (picked) {
            if (isAnswer) style = { background: 'var(--teal-soft)', border: '1.5px solid var(--teal)', color: 'var(--teal)' };
            else if (isPicked) style = { background: 'var(--rose-soft)', border: '1.5px solid var(--rose)', color: 'var(--rose)' };
          }
          return (
            <button
              key={opt.id}
              onClick={() => choose(opt.id)}
              disabled={!!picked}
              className="w-full text-left px-3.5 py-2.5 rounded-[12px] transition-all flex items-center justify-between gap-2"
              style={style}
            >
              <span>
                <span className="text-[14px]">{opt.text.en}</span>
                {opt.text.gu && <span className="block text-[12px] font-guj">{opt.text.gu}</span>}
              </span>
              {picked && isAnswer && <CheckIcon className="w-4 h-4 flex-shrink-0" />}
              {picked && isPicked && !isAnswer && <XIcon className="w-4 h-4 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
      {picked && item.solution && (
        <ResultBox correct={picked === item.answer}>
          <Bi t={item.solution} enClass="text-[13px] leading-relaxed" guClass="text-[12px] font-guj mt-0.5" />
        </ResultBox>
      )}
    </div>
  );
}

function FillBlank({ item, index, onAnswered }: { item: Extract<Item, { type: 'fill_blank' }> } & Props) {
  const hasBank = !!item.options && item.options.length > 0;
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [checked, setChecked] = useState(false);

  const correct = hasBank
    ? selected !== null && normalize(selected) === normalize(item.answer.en)
    : normalize(text) === normalize(item.answer.en) ||
      (!!item.answer.gu && normalize(text) === normalize(item.answer.gu));

  const check = () => {
    if (checked) return;
    if (hasBank && selected === null) return;
    if (!hasBank && !text.trim()) return;
    setChecked(true);
    onAnswered?.(correct);
  };

  // Render the prompt with the "____" blank highlighted.
  const parts = item.prompt.en.split('____');

  return (
    <div className="rounded-[15px] p-4" style={CARD}>
      <div className="flex items-center gap-2 mb-2">
        <QuestionNumber index={index} />
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-soft)' }}>
          Fill in the blank
        </span>
      </div>
      <p className="text-[14px] font-medium leading-relaxed" style={{ color: 'var(--ink)' }}>
        {parts.map((p, i) => (
          <span key={i}>
            {p}
            {i < parts.length - 1 && (
              <span className="font-bold mx-0.5" style={{ color: 'var(--saffron-deep)' }}>
                {hasBank && selected ? selected : '____'}
              </span>
            )}
          </span>
        ))}
      </p>
      {item.prompt.gu && (
        <p className="text-[12px] font-guj mt-1" style={{ color: 'var(--teal)' }}>{item.prompt.gu}</p>
      )}

      {item.hint && !checked && (
        <p className="text-[11.5px] italic mt-2" style={{ color: 'var(--ink-soft)' }}>
          💡 {item.hint.en}
        </p>
      )}

      {hasBank ? (
        <div className="flex flex-wrap gap-2 mt-3">
          {item.options!.map((opt, i) => {
            const isSel = selected === opt.en;
            let style: React.CSSProperties = { background: 'var(--paper)', border: '1.5px solid var(--line)', color: 'var(--ink)' };
            if (checked) {
              if (normalize(opt.en) === normalize(item.answer.en)) style = { background: 'var(--teal-soft)', border: '1.5px solid var(--teal)', color: 'var(--teal)' };
              else if (isSel) style = { background: 'var(--rose-soft)', border: '1.5px solid var(--rose)', color: 'var(--rose)' };
            } else if (isSel) {
              style = { background: 'var(--ink)', border: '1.5px solid var(--ink)', color: '#fff' };
            }
            return (
              <button
                key={i}
                disabled={checked}
                onClick={() => setSelected(opt.en)}
                className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all active:scale-95"
                style={style}
              >
                {opt.en}
              </button>
            );
          })}
        </div>
      ) : (
        <input
          value={text}
          disabled={checked}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && check()}
          placeholder="Type your answer…"
          className="w-full mt-3 px-3.5 py-2.5 rounded-[12px] text-[14px] outline-none"
          style={{ background: 'var(--paper)', border: '1.5px solid var(--line)', color: 'var(--ink)' }}
        />
      )}

      {!checked ? (
        <button
          onClick={check}
          disabled={hasBank ? selected === null : !text.trim()}
          className="mt-3 px-4 py-2 rounded-[12px] text-[13px] font-bold text-white transition-all active:scale-95 disabled:opacity-40"
          style={{ background: 'var(--teal)' }}
        >
          Check
        </button>
      ) : (
        <ResultBox correct={correct}>
          <span className="flex items-center gap-1.5 font-semibold">
            {correct ? <CheckIcon className="w-4 h-4" /> : <XIcon className="w-4 h-4" />}
            {correct ? 'Correct!' : `Answer: ${item.answer.en}`}
          </span>
          {item.answer.gu && <span className="block text-[12px] font-guj mt-0.5">{item.answer.gu}</span>}
        </ResultBox>
      )}
    </div>
  );
}

function Reveal({ item, index }: { item: Extract<Item, { type: 'translation' | 'transformation' }> } & Props) {
  const [shown, setShown] = useState(false);
  const isTranslation = item.type === 'translation';

  // Prompt: for transformation, show the given form. For translation, the prompt node.
  const promptNode = isTranslation
    ? item.prompt
    : (item as Extract<Item, { type: 'transformation' }>).forms[
        (item as Extract<Item, { type: 'transformation' }>).given
      ];
  const label = isTranslation
    ? `Translate (${(item as Extract<Item, { type: 'translation' }>).direction === 'en_to_gu' ? 'EN → ગુ' : 'ગુ → EN'})`
    : `Convert to ${(item as Extract<Item, { type: 'transformation' }>).ask}`;

  return (
    <div className="rounded-[15px] p-4" style={CARD}>
      <div className="flex items-center gap-2 mb-2">
        <QuestionNumber index={index} />
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-soft)' }}>
          {label}
        </span>
      </div>
      <Bi t={promptNode} enClass="text-[14px] font-medium leading-relaxed" />

      {!shown ? (
        <button
          onClick={() => setShown(true)}
          className="mt-3 px-4 py-2 rounded-[12px] text-[13px] font-bold transition-all active:scale-95"
          style={{ background: 'var(--amber-soft)', color: 'var(--saffron-deep)' }}
        >
          Show answer
        </button>
      ) : (
        <ResultBox>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--teal)' }}>
                Answer
              </p>
              <Bi t={item.answer} enClass="text-[13.5px] font-medium leading-relaxed" guClass="text-[12px] font-guj mt-0.5" />
            </div>
            {item.answer.en && (
              <div className="flex-shrink-0">
                <PronounceButton target={item.answer.en} size="sm" hideResult />
              </div>
            )}
          </div>
          {!isTranslation && (item as Extract<Item, { type: 'transformation' }>).solution && (
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--line)' }}>
              <Bi
                t={(item as Extract<Item, { type: 'transformation' }>).solution}
                enClass="text-[12.5px] leading-relaxed"
                guClass="text-[12px] font-guj mt-0.5"
              />
            </div>
          )}
        </ResultBox>
      )}
    </div>
  );
}

export default function PracticeItem({ item, index, onAnswered }: Props) {
  switch (item.type) {
    case 'mcq':
      return <Mcq item={item} index={index} onAnswered={onAnswered} />;
    case 'fill_blank':
      return <FillBlank item={item} index={index} onAnswered={onAnswered} />;
    case 'translation':
    case 'transformation':
      return <Reveal item={item} index={index} onAnswered={onAnswered} />;
    default:
      return null;
  }
}
