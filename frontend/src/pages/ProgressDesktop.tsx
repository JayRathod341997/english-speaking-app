import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../components/DesktopLayout';
import type { Progress } from '../types';

const LEVEL_STYLE: Record<string, { bg: string; color: string }> = {
  beginner:     { bg: 'var(--teal-soft)',  color: 'var(--teal)' },
  intermediate: { bg: 'var(--amber-soft)', color: 'var(--amber)' },
  advanced:     { bg: 'var(--rose-soft)',  color: 'var(--rose)' },
};

function MetricCard({ label, value, bar, barColor }: {
  label: string; value: string | number; bar?: number; barColor?: string;
}) {
  return (
    <div className="rounded-[14px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
      <p className="text-[11.5px] font-semibold mb-1" style={{ color: 'var(--ink-soft)' }}>{label}</p>
      <p className="font-serif text-2xl font-semibold" style={{ color: 'var(--ink)' }}>{value}</p>
      {bar !== undefined && (
        <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: 'var(--paper-2)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${bar}%`, background: barColor }} />
        </div>
      )}
    </div>
  );
}

interface ProgressDesktopProps {
  loading: boolean;
  stats: Progress | { total_sessions: number; total_minutes: number; current_streak: number; best_streak: number; vocabulary_count: number; avg_score: number; level: string; recent_sessions: any[] };
  wordsLearned: number;
  idiomsLearned: number;
  idiomsSaved: number;
  grammarDone: number;
  bestQuiz: number;
}

const GRAMMAR_TOTAL = 20;

export default function ProgressDesktop({
  loading,
  stats,
  wordsLearned,
  idiomsLearned,
  idiomsSaved,
  grammarDone,
  bestQuiz,
}: ProgressDesktopProps) {
  const navigate = useNavigate();
  const lvlStyle = LEVEL_STYLE[stats.level] ?? LEVEL_STYLE.beginner;

  if (loading) {
    return (
      <DesktopLayout>
        <div className="flex items-center justify-center min-h-[300px] text-sm" style={{ color: 'var(--ink-soft)' }}>
          Loading…
        </div>
      </DesktopLayout>
    );
  }

  return (
    <DesktopLayout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-semibold" style={{ color: 'var(--ink)' }}>Your Progress</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink-soft)' }}>Track your English learning journey</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Score hero */}
            <div className="rounded-[18px] p-6 flex items-center gap-8" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg width="112" height="112" className="rotate-[-90deg]">
                  <circle cx="56" cy="56" r="48" fill="none" stroke="var(--paper-2)" strokeWidth="9"/>
                  <circle
                    cx="56" cy="56" r="48" fill="none"
                    stroke="var(--teal)" strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray="301"
                    strokeDashoffset={301 - (301 * Math.min(stats.avg_score, 100)) / 100}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-serif text-3xl font-semibold" style={{ color: 'var(--ink)' }}>
                    {stats.avg_score > 0 ? Math.round(stats.avg_score) : '—'}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--ink-soft)' }}>
                    Avg score
                  </span>
                </div>
              </div>
              <div>
                <span
                  className="inline-block px-4 py-1 rounded-full text-sm font-bold capitalize mb-2"
                  style={{ background: lvlStyle.bg, color: lvlStyle.color }}
                >
                  {stats.level}
                </span>
                <p className="text-[13px]" style={{ color: 'var(--ink-soft)' }}>
                  {stats.avg_score >= 80 ? 'Upper-intermediate · improving steadily'
                   : stats.avg_score >= 60 ? "Keep practicing · you're getting better"
                   : 'Just getting started · every session counts'}
                </p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-3">
              <MetricCard label="Sessions"   value={stats.total_sessions} />
              <MetricCard label="Minutes"    value={stats.total_minutes} />
              <MetricCard label="🔥 Streak" value={`${stats.current_streak}d`} />
              <MetricCard label="🏆 Best"   value={`${stats.best_streak}d`} />
            </div>

            {/* Recent sessions */}
            {stats.recent_sessions.length > 0 && (
              <div className="rounded-[18px] p-6" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
                <h2 className="font-serif text-[16px] font-semibold mb-4" style={{ color: 'var(--ink)' }}>
                  Recent Sessions
                </h2>
                <div className="space-y-3">
                  {stats.recent_sessions.map((s: any, i: number) => (
                    <div
                      key={s.id ?? i}
                      className="flex items-center justify-between py-2"
                      style={{ borderBottom: i < stats.recent_sessions.length - 1 ? '1px solid var(--line)' : 'none' }}
                    >
                      <div>
                        <p className="text-sm font-semibold capitalize" style={{ color: 'var(--ink)' }}>
                          {s.difficulty} session
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>
                          {new Date(s.started_at).toLocaleDateString()} · {s.total_messages} messages
                        </p>
                      </div>
                      {s.overall_score != null && (
                        <span
                          className="text-sm font-bold font-serif"
                          style={{
                            color: s.overall_score >= 80 ? 'var(--teal)'
                              : s.overall_score >= 60 ? 'var(--amber)' : 'var(--rose)',
                          }}
                        >
                          {Math.round(s.overall_score)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full py-3.5 rounded-[14px] font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, var(--saffron), var(--saffron-deep))' }}
            >
              Practice Now 🗣️
            </button>
          </div>

          {/* Sidebar column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="rounded-[18px] p-6" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <h2 className="font-serif text-[16px] font-semibold mb-4" style={{ color: 'var(--ink)' }}>
                Learning
              </h2>
              <div className="flex flex-col gap-3">
                <MetricCard label="Words learned"    value={wordsLearned}  bar={Math.min((wordsLearned / 160) * 100, 100)} barColor="var(--teal)" />
                <MetricCard label="Idioms learned"   value={idiomsLearned} bar={Math.min((idiomsLearned / 156) * 100, 100)} barColor="var(--teal)" />
                <MetricCard label="Grammar chapters" value={`${grammarDone}/${GRAMMAR_TOTAL}`} bar={Math.min((grammarDone / GRAMMAR_TOTAL) * 100, 100)} barColor="var(--teal)" />
                <MetricCard label="Best quiz"        value={`${bestQuiz}%`} bar={bestQuiz} barColor="var(--saffron)" />
                <MetricCard label="Idioms saved"     value={idiomsSaved} />
              </div>
              <div className="grid grid-cols-1 gap-2 mt-4">
                <button
                  onClick={() => navigate('/vocabulary')}
                  className="py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}
                >
                  Study words
                </button>
                <button
                  onClick={() => navigate('/idioms')}
                  className="py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: 'var(--amber-soft)', color: 'var(--saffron-deep)' }}
                >
                  Browse idioms
                </button>
                <button
                  onClick={() => navigate('/grammar')}
                  className="py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: 'var(--rose-soft)', color: 'var(--rose)' }}
                >
                  Study grammar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopLayout>
  );
}
