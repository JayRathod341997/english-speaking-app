import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useLocalProgress } from '../hooks/useLocalProgress';
import { progressApi } from '../services/api';
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

export default function ProgressPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();
  const { progress: local } = useLocalProgress();

  const wordsLearned = Object.values(local.vocab).filter(v => v.learned).length;
  const idiomsSaved  = local.idiomBookmarks.length;
  const quizTaken    = Object.keys(local.quizScores).length;
  const bestQuiz     = quizTaken ? Math.max(...Object.values(local.quizScores)) : 0;

  useEffect(() => {
    progressApi.get().then(setProgress).finally(() => setLoading(false));
  }, []);

  const stats = progress ?? {
    total_sessions: 0, total_minutes: 0, current_streak: 0,
    best_streak: 0, vocabulary_count: 0, avg_score: 0,
    level: 'beginner', recent_sessions: [],
  };

  const lvlStyle = LEVEL_STYLE[stats.level] ?? LEVEL_STYLE.beginner;

  return (
    <div className="flex flex-col h-[100dvh] overflow-x-hidden w-full" style={{ background: 'var(--paper)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0"
        style={{ background: 'var(--card)', borderBottom: '1px solid var(--line)' }}
      >
        <button
          onClick={() => navigate('/')}
          className="text-2xl leading-none p-1"
          style={{ background: 'none', border: 'none', color: 'var(--ink)', cursor: 'pointer' }}
        >
          ‹
        </button>
        <div>
          <h1 className="font-serif text-[18px] font-semibold" style={{ color: 'var(--ink)' }}>
            Your Progress
          </h1>
          <p className="text-[11px] font-guj" style={{ color: 'var(--ink-soft)' }}>તમારી પ્રગતિ</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--ink-soft)' }}>
          Loading…
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-5 pb-6 space-y-4">
          {/* Score hero */}
          <div
            className="rounded-[18px] p-5 text-center"
            style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
          >
            {/* Ring */}
            <div className="relative w-28 h-28 mx-auto mb-3">
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
            <span
              className="inline-block px-4 py-1 rounded-full text-sm font-bold capitalize"
              style={{ background: lvlStyle.bg, color: lvlStyle.color }}
            >
              {stats.level}
            </span>
            <p className="text-[12px] mt-2" style={{ color: 'var(--ink-soft)' }}>
              {stats.avg_score >= 80 ? 'Upper-intermediate · improving steadily'
               : stats.avg_score >= 60 ? 'Keep practicing · you\'re getting better'
               : 'Just getting started · every session counts'}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Sessions"    value={stats.total_sessions} />
            <MetricCard label="Minutes"     value={stats.total_minutes} />
            <MetricCard label="🔥 Streak"  value={`${stats.current_streak}d`} />
            <MetricCard label="🏆 Best"    value={`${stats.best_streak}d`} />
          </div>

          {/* Recent sessions */}
          {stats.recent_sessions.length > 0 && (
            <div className="rounded-[18px] p-5" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <h2 className="font-serif text-[16px] font-semibold mb-4" style={{ color: 'var(--ink)' }}>
                Recent Sessions
              </h2>
              <div className="space-y-3">
                {stats.recent_sessions.map((s, i) => (
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

          {/* Learning stats (localStorage) */}
          <div className="rounded-[18px] p-5" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
            <h2 className="font-serif text-[16px] font-semibold mb-4" style={{ color: 'var(--ink)' }}>
              Learning
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Words learned" value={wordsLearned} bar={Math.min((wordsLearned / 160) * 100, 100)} barColor="var(--teal)" />
              <MetricCard label="Idioms saved"  value={idiomsSaved} />
              <MetricCard label="Quizzes taken" value={quizTaken} />
              <MetricCard label="Best quiz"     value={`${bestQuiz}%`} bar={bestQuiz} barColor="var(--saffron)" />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => navigate('/vocabulary')}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}
              >
                Study words
              </button>
              <button
                onClick={() => navigate('/idioms')}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--amber-soft)', color: 'var(--saffron-deep)' }}
              >
                Browse idioms
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 rounded-[14px] font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, var(--saffron), var(--saffron-deep))' }}
          >
            Practice Now 🗣️
          </button>
        </div>
      )}

      <BottomNav active="progress" />
    </div>
  );
}
