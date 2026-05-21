import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { progressApi, scenariosApi } from '../services/api';
import type { DailyChallenge, Scenario } from '../types';

type Difficulty = 'all' | 'beginner' | 'intermediate' | 'advanced';

const DIFF_BADGE: Record<string, string> = {
  beginner:     'bg-[var(--teal-soft)] text-[var(--teal)]',
  intermediate: 'bg-[var(--amber-soft)] text-[var(--amber)]',
  advanced:     'bg-[var(--rose-soft)] text-[var(--rose)]',
};

const DIFF_SHORT: Record<string, string> = {
  beginner: 'Beg', intermediate: 'Int', advanced: 'Adv',
};

export default function Home() {
  const [scenarios, setScenarios]   = useState<Scenario[]>([]);
  const [challenge, setChallenge]   = useState<DailyChallenge | null>(null);
  const [filter, setFilter]         = useState<Difficulty>('all');
  const [streak, setStreak]         = useState(0);
  const [loading, setLoading]       = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      scenariosApi.list(),
      progressApi.dailyChallenge(),
      progressApi.get(),
    ]).then(([s, c, p]) => {
      setScenarios(s);
      setChallenge(c);
      setStreak(p.current_streak);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = scenarios.filter(s => filter === 'all' || s.difficulty === filter);

  const challengeScenario = challenge
    ? scenarios.find(s => s.id === challenge.scenario_id)
    : null;

  return (
    <div className="flex flex-col h-[100dvh]" style={{ background: 'var(--paper)' }}>
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ background: 'var(--card)', borderBottom: '1px solid var(--line)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-[11px] grid place-items-center font-serif text-xl font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(140deg, var(--saffron), var(--saffron-deep))' }}
          >
            બ
          </div>
          <div>
            <h1 className="font-serif text-[17px] font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
              Bolo English
            </h1>
            <p className="text-[11px] font-guj" style={{ color: 'var(--ink-soft)' }}>
              તમારે અંગ્રેજી બોલવાનો સાથ
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ background: 'var(--amber-soft)', color: 'var(--saffron-deep)' }}
        >
          🔥 <span>{streak}</span>
        </div>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-5 pb-2">
        {/* Greeting */}
        <div className="mb-5">
          <h2 className="font-serif text-2xl font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
            Ready to speak?
          </h2>
          <p className="font-guj text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
            આજે કઈ પરિસ્થિતિની પ્રૅક્ટિસ કરો?
          </p>
        </div>

        {/* Level selector */}
        <div className="flex gap-2 mb-5">
          {(['all', 'beginner', 'intermediate', 'advanced'] as Difficulty[]).map(d => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
              style={
                filter === d
                  ? { background: 'var(--teal)', color: '#fff', border: '1.5px solid var(--teal)' }
                  : { background: 'var(--card)', color: 'var(--ink-soft)', border: '1.5px solid var(--line)' }
              }
            >
              {d === 'all' ? 'All' : d === 'beginner' ? 'Beginner' : d === 'intermediate' ? 'Medium' : 'Advanced'}
            </button>
          ))}
        </div>

        {/* Daily Challenge */}
        {challenge && (
          <div
            className="rounded-[18px] p-5 mb-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--teal) 0%, #155f53 100%)' }}
          >
            <p className="text-[10.5px] font-bold uppercase tracking-widest mb-1 opacity-80 text-white">
              Today's Challenge
            </p>
            <h3 className="font-serif text-xl font-semibold text-white mt-1 mb-1 leading-snug">
              {challengeScenario?.title ?? 'Daily Practice'}
            </h3>
            <p className="text-[13px] text-white opacity-90 leading-relaxed mb-3">
              {challenge.prompt}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {challenge.target_phrases.map(p => (
                <span key={p} className="text-[11px] px-2.5 py-1 rounded-full font-medium text-white"
                  style={{ background: 'rgba(255,255,255,0.18)' }}>
                  "{p}"
                </span>
              ))}
            </div>
            <button
              onClick={() => challengeScenario && navigate(`/practice/${challengeScenario.id}`, { state: { scenario: challengeScenario } })}
              className="relative z-10 text-sm font-bold px-4 py-2.5 rounded-xl transition-transform active:scale-95"
              style={{ background: 'var(--card)', color: 'var(--teal)' }}
            >
              Start speaking →
            </button>
          </div>
        )}

        {/* Scenarios */}
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-serif text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>
            Practice Scenarios
          </h3>
          <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{filtered.length} scenarios</span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm" style={{ color: 'var(--ink-soft)' }}>
            Loading scenarios…
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-5">
            {filtered.map(s => (
              <button
                key={s.id}
                onClick={() => navigate(`/practice/${s.id}`, { state: { scenario: s } })}
                className="text-left rounded-[15px] p-4 relative overflow-hidden transition-all active:scale-[.97]"
                style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
              >
                <span
                  className={`absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${DIFF_BADGE[s.difficulty]}`}
                >
                  {DIFF_SHORT[s.difficulty]}
                </span>
                <div className="text-2xl mb-2">{s.icon}</div>
                <h4 className="text-[13px] font-bold leading-tight mb-1 pr-6" style={{ color: 'var(--ink)' }}>
                  {s.title}
                </h4>
                <p className="text-[11px] leading-snug" style={{ color: 'var(--ink-soft)' }}>
                  {s.category} · ~{s.estimated_minutes}m
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav
        className="flex flex-shrink-0"
        style={{ borderTop: '1px solid var(--line)', background: 'var(--card)' }}
      >
        <button
          className="flex-1 flex flex-col items-center gap-1 pt-2.5 pb-4 text-[10.5px] font-semibold"
          style={{ color: 'var(--saffron-deep)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z"/>
          </svg>
          Home
        </button>
        <button
          onClick={() => navigate('/progress')}
          className="flex-1 flex flex-col items-center gap-1 pt-2.5 pb-4 text-[10.5px] font-semibold"
          style={{ color: 'var(--ink-soft)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M3 3v18h18"/><path d="M7 14l3-4 4 3 5-7"/>
          </svg>
          Progress
        </button>
      </nav>
    </div>
  );
}
