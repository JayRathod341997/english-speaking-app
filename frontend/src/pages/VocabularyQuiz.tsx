import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import PageHeader from '../components/PageHeader';
import { useLocalProgress } from '../hooks/useLocalProgress';
import { vocabularyApi } from '../services/api';
import type { Quiz } from '../types';

export default function VocabularyQuiz() {
  const { categoryId } = useParams();
  const id = Number(categoryId);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const { setQuizScore } = useLocalProgress();
  const navigate = useNavigate();

  useEffect(() => {
    vocabularyApi.category(id).then(c => setQuiz(c.quiz)).finally(() => setLoading(false));
  }, [id]);

  if (loading || !quiz) {
    return (
      <div className="flex flex-col h-[100dvh]" style={{ background: 'var(--paper)' }}>
        <PageHeader title="Quiz" back={`/vocabulary/${id}`} />
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          Loading…
        </div>
        <BottomNav active="vocabulary" />
      </div>
    );
  }

  const q = quiz.questions[current];
  const total = quiz.questions.length;
  const pct = Math.round((correct / total) * 100);

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    if (opt === q.answer) setCorrect(c => c + 1);
  };

  const next = () => {
    if (current + 1 >= total) {
      setQuizScore(id, pct);
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setPicked(null);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] overflow-x-hidden w-full" style={{ background: 'var(--paper)' }}>
      <PageHeader title={quiz.category} subtitle="ક્વિઝ" back={`/vocabulary/${id}`} />

      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-4 pb-6">
        {done ? (
          <div className="rounded-[18px] p-6 text-center mt-6" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
            <div className="text-5xl mb-3">{pct >= 90 ? '🎉' : pct >= 60 ? '👍' : '💪'}</div>
            <h2 className="font-serif text-3xl font-semibold" style={{ color: 'var(--ink)' }}>{pct}%</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
              {correct} / {total} correct
            </p>
            <p className="text-[13px] mt-3" style={{ color: pct >= 90 ? 'var(--teal)' : 'var(--ink-soft)' }}>
              {pct >= 90
                ? 'Excellent — this category is done! Hold its dialogues out loud without looking.'
                : 'Aim for ≥ 90% — re-test the words you missed tomorrow.'}
            </p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => { setCurrent(0); setPicked(null); setCorrect(0); setDone(false); }}
                className="flex-1 py-3 rounded-[14px] font-semibold text-sm"
                style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }}
              >
                Retry
              </button>
              <button
                onClick={() => navigate(`/vocabulary/${id}`)}
                className="flex-1 py-3 rounded-[14px] font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, var(--saffron), var(--saffron-deep))' }}
              >
                Back to words
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* progress bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--paper-2)' }}>
                <div className="h-full rounded-full" style={{ width: `${((current) / total) * 100}%`, background: 'var(--teal)' }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>
                {current + 1}/{total}
              </span>
            </div>

            <div className="rounded-[16px] p-5 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <h2 className="font-serif text-lg font-semibold leading-snug font-guj" style={{ color: 'var(--ink)' }}>
                {q.question}
              </h2>
            </div>

            <div className="space-y-2.5">
              {q.options.map(opt => {
                const isAnswer = opt === q.answer;
                const isPicked = opt === picked;
                let style: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' };
                if (picked) {
                  if (isAnswer) style = { background: 'var(--teal-soft)', border: '1.5px solid var(--teal)', color: 'var(--teal)' };
                  else if (isPicked) style = { background: 'var(--rose-soft)', border: '1.5px solid var(--rose)', color: 'var(--rose)' };
                }
                return (
                  <button
                    key={opt}
                    onClick={() => choose(opt)}
                    disabled={!!picked}
                    className="w-full text-left px-4 py-3 rounded-[13px] text-[14px] font-medium font-guj transition-all"
                    style={style}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {picked && (
              <button
                onClick={next}
                className="w-full mt-5 py-3.5 rounded-[14px] font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, var(--saffron), var(--saffron-deep))' }}
              >
                {current + 1 >= total ? 'See results' : 'Next →'}
              </button>
            )}
          </>
        )}
      </div>

      <BottomNav active="vocabulary" />
    </div>
  );
}
