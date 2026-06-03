import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Flashcard from '../components/Flashcard';
import PageHeader from '../components/PageHeader';
import PronounceButton from '../components/PronounceButton';
import { useLocalProgress } from '../hooks/useLocalProgress';
import { vocabularyApi } from '../services/api';
import type { MiniDialogue, VocabCategoryDetail, VocabWord } from '../types';

export default function VocabularyCategory() {
  const { categoryId } = useParams();
  const id = Number(categoryId);
  const [cat, setCat] = useState<VocabCategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'words' | 'dialogues'>('words');
  const { progress, setWord } = useLocalProgress();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    vocabularyApi.category(id).then(setCat).finally(() => setLoading(false));
  }, [id]);

  // group words by subcategory (= "batch") preserving order
  const batches = useMemo(() => {
    if (!cat) return [];
    const map = new Map<string, VocabWord[]>();
    for (const w of cat.words) {
      if (!map.has(w.subcategory)) map.set(w.subcategory, []);
      map.get(w.subcategory)!.push(w);
    }
    return Array.from(map.entries());
  }, [cat]);

  const key = (wordId: number) => `${id}-${wordId}`;
  const learnedCount = cat
    ? cat.words.filter(w => progress.vocab[key(w.id)]?.learned).length
    : 0;

  return (
    <div className="flex flex-col h-[100dvh]" style={{ background: 'var(--paper)' }}>
      <PageHeader title={cat?.category ?? 'Vocabulary'} subtitle={cat?.level} back="/vocabulary" />

      {loading || !cat ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          Loading…
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-6">
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

          {tab === 'words' ? (
            <div className="space-y-6">
              {batches.map(([subcat, words], i) => (
                <div key={subcat}>
                  <h3 className="font-serif text-[15px] font-semibold mb-2" style={{ color: 'var(--ink)' }}>
                    Batch {i + 1} · {subcat}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {words.map(w => {
                      const wp = progress.vocab[key(w.id)] ?? {};
                      return (
                        <Flashcard
                          key={w.id}
                          word={w}
                          learned={wp.learned}
                          spoken={wp.spoken}
                          onToggleLearned={() => setWord(key(w.id), { learned: !wp.learned })}
                          onSpoken={() => setWord(key(w.id), { spoken: true })}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {cat.mini_dialogues.map(d => <DialogueCard key={d.id} dialogue={d} />)}
            </div>
          )}
        </div>
      )}

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
