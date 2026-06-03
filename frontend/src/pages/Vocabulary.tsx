import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import PageHeader from '../components/PageHeader';
import { useLocalProgress } from '../hooks/useLocalProgress';
import { vocabularyApi } from '../services/api';
import type { VocabIndex } from '../types';

const ICONS = ['🗣️', '🏙️', '🧺', '🍽️'];

export default function Vocabulary() {
  const [index, setIndex] = useState<VocabIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const { progress } = useLocalProgress();
  const navigate = useNavigate();

  useEffect(() => {
    vocabularyApi.index().then(setIndex).finally(() => setLoading(false));
  }, []);

  /** Words learned within a category = progress keys prefixed `${categoryId}-`. */
  const learnedIn = (categoryId: number) =>
    Object.entries(progress.vocab).filter(
      ([key, v]) => key.startsWith(`${categoryId}-`) && v.learned
    ).length;

  return (
    <div className="flex flex-col h-[100dvh]" style={{ background: 'var(--paper)' }}>
      <PageHeader title="Vocabulary" subtitle="શબ્દભંડોળ" back="/" />

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          Loading…
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-6">
          <div className="mb-4">
            <h2 className="font-serif text-2xl font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
              {index?.total_words} words to master
            </h2>
            <p className="font-guj text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
              એક દિવસમાં એક બેચ — ફ્લેશકાર્ડ, ઉચ્ચારણ અને ક્વિઝ સાથે.
            </p>
          </div>

          <div className="space-y-3">
            {index?.category_summary.map((c, i) => {
              const learned = learnedIn(c.id);
              const pct = c.total_words ? Math.round((learned / c.total_words) * 100) : 0;
              const best = progress.quizScores[c.id];
              return (
                <button
                  key={c.id}
                  onClick={() => navigate(`/vocabulary/${c.id}`)}
                  className="w-full text-left rounded-[16px] p-4 transition-all active:scale-[.98]"
                  style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-[13px] grid place-items-center text-2xl flex-shrink-0"
                      style={{ background: 'var(--paper-2)' }}
                    >
                      {ICONS[i % ICONS.length]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-[16px] font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
                        {c.category}
                      </h3>
                      <p className="text-[12px]" style={{ color: 'var(--ink-soft)' }}>
                        {c.total_words} words · {c.subcategories} batches
                        {best != null && ` · quiz best ${best}%`}
                      </p>
                    </div>
                    <span className="font-serif text-sm font-semibold" style={{ color: 'var(--teal)' }}>
                      {learned}/{c.total_words}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ background: 'var(--paper-2)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--teal)' }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <BottomNav active="vocabulary" />
    </div>
  );
}
