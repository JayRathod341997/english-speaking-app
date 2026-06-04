import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { ProgressIcon } from '../components/Icon';
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
      setScenarios(Array.isArray(s) ? s : []);
      setChallenge(c);
      setStreak(p.current_streak);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = scenarios.filter(s => filter === 'all' || s.difficulty === filter);

  const challengeScenario = challenge
    ? scenarios.find(s => s.id === challenge.scenario_id)
    : null;

  return (
    <div className="flex flex-col h-[100dvh] overflow-x-hidden w-full" style={{ background: 'var(--paper)' }}>
      {/* ... header ... */}
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/progress')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--teal-soft)] text-[var(--teal)] transition-all active:scale-95 hover:opacity-90"
            style={{ border: 'none', cursor: 'pointer' }}
          >
            <ProgressIcon className="w-3.5 h-3.5" />
            <span>Progress</span>
          </button>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'var(--amber-soft)', color: 'var(--saffron-deep)' }}
          >
            🔥 <span>{streak}</span>
          </div>
        </div>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-5 pb-2">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {(['all', 'beginner', 'intermediate', 'advanced'] as Difficulty[]).map(d => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className="w-full py-2 rounded-xl text-xs font-semibold capitalize transition-all text-center"
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

        {/* Explore */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate('/dialogues')}
            className="text-left rounded-[15px] p-4 transition-all active:scale-[.97]"
            style={{ background: 'var(--teal-soft)', border: '1px solid var(--line)' }}
          >
            <div className="text-2xl mb-2">💬</div>
            <h4 className="text-[14px] font-bold leading-tight" style={{ color: 'var(--teal)' }}>
              Dialogues
            </h4>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>
              Read real conversations aloud
            </p>
          </button>
          <button
            onClick={() => navigate('/flashcards')}
            className="text-left rounded-[15px] p-4 transition-all active:scale-[.97]"
            style={{ background: 'var(--amber-soft)', border: '1px solid var(--line)' }}
          >
            <div className="text-2xl mb-2">🃏</div>
            <h4 className="text-[14px] font-bold leading-tight" style={{ color: 'var(--saffron-deep)' }}>
              Flashcards
            </h4>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>
              Learn words with quick cards
            </p>
          </button>
        </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-5">
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

      <BottomNav active="home" />
    </div>
  );
}
