import type { ExplanationBlock as Block, GrammarT } from '../types';
import Bi from './Bi';
import PronounceButton from './PronounceButton';

const CARD: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--line)' };

/** A single example sentence: en + gu + a tap-to-hear / practise control. */
function ExampleRow({ ex }: { ex: GrammarT }) {
  return (
    <div
      className="flex items-start justify-between gap-3 rounded-lg px-3 py-2"
      style={{ background: 'var(--paper-2)' }}
    >
      <Bi
        t={ex}
        enClass="text-[13px] font-medium leading-relaxed"
        guClass="text-[12px] font-guj mt-0.5 leading-relaxed"
      />
      {ex.en && (
        <div className="flex-shrink-0">
          <PronounceButton target={ex.en} size="sm" hideResult hideMic />
        </div>
      )}
    </div>
  );
}

export default function ExplanationBlock({ block }: { block: Block }) {
  switch (block.block) {
    case 'prose':
      return (
        <div className="rounded-[15px] p-4" style={CARD}>
          <Bi t={block.text} />
        </div>
      );

    case 'rules':
      return (
        <div className="rounded-[15px] p-4" style={CARD}>
          <Bi
            t={block.title}
            enClass="font-serif text-[15px] font-semibold"
            guClass="text-[12px] font-guj mt-0.5"
          />
          <div className="mt-3 space-y-3">
            {block.items.map((item, i) => (
              <div key={i} className="pl-3" style={{ borderLeft: '2px solid var(--line)' }}>
                <Bi t={item.text} enClass="text-[13.5px] leading-relaxed" />
                {item.examples && item.examples.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {item.examples.map((ex, j) => (
                      <ExampleRow key={j} ex={ex} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'examples':
      return (
        <div className="rounded-[15px] p-4" style={CARD}>
          <h3 className="font-serif text-[15px] font-semibold mb-3" style={{ color: 'var(--ink)' }}>
            Examples
          </h3>
          <div className="space-y-1.5">
            {block.items.map((ex, i) => (
              <ExampleRow key={i} ex={ex} />
            ))}
          </div>
        </div>
      );

    case 'table':
      return (
        <div className="rounded-[15px] p-4" style={CARD}>
          {block.caption && (
            <Bi
              t={block.caption}
              enClass="font-serif text-[15px] font-semibold"
              guClass="text-[12px] font-guj mt-0.5 mb-1"
            />
          )}
          <div className="overflow-x-auto mt-2 -mx-1 px-1">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr>
                  {block.headers.map(h => (
                    <th
                      key={h.key}
                      className="px-3 py-2 font-semibold align-bottom"
                      style={{ color: 'var(--ink)', borderBottom: '2px solid var(--line)' }}
                    >
                      <span>{h.label.en}</span>
                      {h.label.gu && (
                        <span className="block text-[11px] font-guj font-normal" style={{ color: 'var(--teal)' }}>
                          {h.label.gu}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i}>
                    {block.headers.map(h => (
                      <td
                        key={h.key}
                        className="px-3 py-2 align-top"
                        style={{ color: 'var(--ink-soft)', borderBottom: '1px solid var(--line)' }}
                      >
                        {row[h.key] ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    default:
      return null;
  }
}
