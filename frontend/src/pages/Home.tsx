import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { progressApi, scenariosApi } from '../services/api';
import type { DailyChallenge, Scenario, Progress } from '../types';
=======
import BottomNav from '../components/BottomNav';
import ChapterCard from '../components/ChapterCard';
import DailyItemCard from '../components/DailyItemCard';
import ScrollToTop from '../components/ScrollToTop';
import { ProgressIcon } from '../components/Icon';
import { useAutoHide } from '../hooks/useAutoHide';
import { useLocalProgress } from '../hooks/useLocalProgress';
import { useIsDesktop } from '../hooks/useIsDesktop';
import HomeDesktop from './HomeDesktop';
import {
  grammarApi,
  idiomsApi,
  progressApi,
  scenariosApi,
  vocabularyApi,
} from '../services/api';
import type {
  DailyChallenge,
  GrammarChapterSummary,
  Idiom,
  Scenario,
  VocabWord,
} from '../types';
import { getOrPickDaily, hashSeed, pickDaily, todayKey } from '../utils/daily';
>>>>>>> release1.0

const IDIOMS_PER_DAY = 5;
const WORDS_PER_DAY = 5;
const GRAMMAR_PER_DAY = 2;

function Sidebar({ active, streak, progress, navigate }: { active: 'home' | 'progress'; streak: number; progress: Progress | null; navigate: any }) {
  return (
    <aside className="hidden lg:flex flex-col w-[260px] border-r border-[var(--line)] bg-[var(--card)] p-6 flex-shrink-0 h-full justify-between">
      <div className="space-y-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[12px] grid place-items-center font-serif text-2xl font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(140deg, var(--saffron), var(--saffron-deep))' }}
          >
            બ
          </div>
          <div>
            <h1 className="font-serif text-[19px] font-bold leading-tight" style={{ color: 'var(--ink)' }}>
              Bolo English
            </h1>
            <p className="text-[11px] font-guj" style={{ color: 'var(--ink-soft)' }}>
              તમારે અંગ્રેજી બોલવાનો સાથ
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left w-full cursor-pointer"
            style={
              active === 'home'
                ? { background: 'var(--paper-2)', color: 'var(--saffron-deep)' }
                : { color: 'var(--ink-soft)' }
            }
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z"/>
            </svg>
            Home
          </button>
          <button
            onClick={() => navigate('/progress')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left w-full cursor-pointer"
            style={
              active === 'progress'
                ? { background: 'var(--paper-2)', color: 'var(--saffron-deep)' }
                : { color: 'var(--ink-soft)' }
            }
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <path d="M3 3v18h18"/><path d="M7 14l3-4 4 3 5-7"/>
            </svg>
            Progress
          </button>
        </nav>
      </div>

      {/* Footer / Streak info */}
      <div className="space-y-4 pt-4 border-t border-[var(--line)]">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold" style={{ color: 'var(--ink-soft)' }}>Daily Streak</span>
          <div
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black shadow-sm"
            style={{ background: 'var(--amber-soft)', color: 'var(--saffron-deep)' }}
          >
            🔥 <span>{streak} d</span>
          </div>
        </div>

        {progress && (
          <div className="bg-[var(--paper)] rounded-xl p-3 text-xs space-y-2">
            <div className="flex justify-between">
              <span style={{ color: 'var(--ink-soft)' }}>Sessions:</span>
              <span className="font-bold" style={{ color: 'var(--ink)' }}>{progress.total_sessions}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--ink-soft)' }}>Avg Score:</span>
              <span className="font-bold text-[var(--teal)]" style={{ color: 'var(--teal)' }}>
                {progress.avg_score > 0 ? `${Math.round(progress.avg_score)}/100` : '—'}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default function Home() {
<<<<<<< HEAD
  const [scenarios, setScenarios]   = useState<Scenario[]>([]);
  const [challenge, setChallenge]   = useState<DailyChallenge | null>(null);
  const [filter, setFilter]         = useState<Difficulty>('all');
  const [streak, setStreak]         = useState(0);
  const [progress, setProgress]     = useState<Progress | null>(null);
  const [loading, setLoading]       = useState(true);
=======
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [streak, setStreak] = useState(0);
  const [idioms, setIdioms] = useState<Idiom[]>([]);
  const [allWords, setAllWords] = useState<VocabWord[]>([]);
  const [catNameToId, setCatNameToId] = useState<Record<string, number>>({});
  const [grammarChapters, setGrammarChapters] = useState<GrammarChapterSummary[]>([]);
  const [loading, setLoading] = useState(true);

>>>>>>> release1.0
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { visible: uiVisible } = useAutoHide(scrollRef);
  const { progress, toggleIdiomLearned, setWord, toggleGrammarComplete } = useLocalProgress();

  useEffect(() => {
    let active = true;
    Promise.all([
      scenariosApi.list(),
      progressApi.dailyChallenge(),
      progressApi.get(),
<<<<<<< HEAD
    ]).then(([s, c, p]) => {
      setScenarios(s);
      setChallenge(c);
      setStreak(p.current_streak);
      setProgress(p);
    }).finally(() => setLoading(false));
=======
      idiomsApi.list(),
      grammarApi.index(),
      vocabularyApi.index().then(idx => {
        const map: Record<string, number> = {};
        for (const c of idx.category_summary) map[c.category] = c.id;
        return Promise.all(idx.category_summary.map(c => vocabularyApi.category(c.id)))
          .then(details => ({ map, words: details.flatMap(d => d.words) }));
      }),
    ])
      .then(([s, c, p, lib, gram, vocab]) => {
        if (!active) return;
        setScenarios(Array.isArray(s) ? s : []);
        setChallenge(c);
        setStreak(p.current_streak);
        setIdioms(lib.idioms ?? []);
        setGrammarChapters(gram.chapters ?? []);
        setCatNameToId(vocab.map);
        setAllWords(vocab.words);
      })
      .catch(err => console.error(err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
>>>>>>> release1.0
  }, []);

  const challengeScenario = challenge
    ? (scenarios.find(s => s.id === challenge.scenario_id) ?? null)
    : null;

  const seed = useMemo(() => hashSeed(todayKey()), []);
  const learnedIdiomSet = useMemo(() => new Set(progress.learnedIdioms ?? []), [progress.learnedIdioms]);
  const grammarCompletedSet = useMemo(() => new Set(progress.grammarCompleted ?? []), [progress.grammarCompleted]);

  const wordKey = (w: VocabWord) => `${catNameToId[w.category]}-${w.id}`;

  /**
   * The day's target sets are LOCKED once chosen and persisted (see getOrPickDaily).
   * They intentionally do NOT depend on live read-state, so marking an item read
   * keeps it in the list (shown as completed) instead of refilling with a new item.
   * Read-state is read from `progress` only at the moment of the first pick.
   */

  // Today's idioms — 5 ids chosen once from the then-unread pool, fixed for the day.
  const todaysIdioms = useMemo(() => {
    if (!idioms.length) return [];
    const learnedAtPick = new Set(progress.learnedIdioms ?? []);
    const ids = getOrPickDaily<number>('idioms', () =>
      pickDaily(idioms.filter(i => !learnedAtPick.has(i.id)).map(i => i.id), IDIOMS_PER_DAY, seed)
    );
    const byId = new Map(idioms.map(i => [i.id, i]));
    return ids.map(id => byId.get(id)).filter((i): i is Idiom => !!i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idioms, seed]);

  // Today's words — 5 word-keys chosen once from the then-unread pool, fixed for the day.
  const todaysWords = useMemo(() => {
    if (!allWords.length || !Object.keys(catNameToId).length) return [];
    const ids = getOrPickDaily<string>('words', () =>
      pickDaily(
        allWords.filter(w => !progress.vocab[wordKey(w)]?.learned).map(w => wordKey(w)),
        WORDS_PER_DAY,
        seed + 1
      )
    );
    const byKey = new Map(allWords.map(w => [wordKey(w), w]));
    return ids.map(k => byKey.get(k)).filter((w): w is VocabWord => !!w);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allWords, catNameToId, seed]);

  // Today's grammar — next un-completed chapters IN SEQUENCE, locked for the day.
  const todaysGrammar = useMemo(() => {
    if (!grammarChapters.length) return [];
    const completedAtPick = new Set(progress.grammarCompleted ?? []);
    const ids = getOrPickDaily<string>('grammar', () =>
      grammarChapters
        .filter(c => !completedAtPick.has(c.slug))
        .slice(0, GRAMMAR_PER_DAY)
        .map(c => c.slug)
    );
    const bySlug = new Map(grammarChapters.map(c => [c.slug, c]));
    return ids.map(s => bySlug.get(s)).filter((c): c is GrammarChapterSummary => !!c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grammarChapters, seed]);

  // Per-bucket "completed today" counts, for the target-complete message.
  const idiomsDone = todaysIdioms.filter(i => learnedIdiomSet.has(i.id)).length;
  const wordsDone = todaysWords.filter(w => !!progress.vocab[wordKey(w)]?.learned).length;
  const grammarDone = todaysGrammar.filter(c => grammarCompletedSet.has(c.slug)).length;
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <HomeDesktop
        challenge={challenge}
        streak={streak}
        todaysIdioms={todaysIdioms}
        todaysWords={todaysWords}
        todaysGrammar={todaysGrammar}
        loading={loading}
        progress={progress}
        toggleIdiomLearned={toggleIdiomLearned}
        toggleGrammarComplete={toggleGrammarComplete}
        setWord={setWord}
        wordKey={wordKey}
        challengeScenario={challengeScenario}
      />
    );
  }

  return (
<<<<<<< HEAD
    <div className="flex flex-col h-[100dvh] lg:flex-row lg:overflow-hidden" style={{ background: 'var(--paper)' }}>
      {/* Desktop Left Sidebar */}
      <Sidebar active="home" streak={streak} progress={progress} navigate={navigate} />

      {/* Main Application Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top bar (Mobile only) */}
        <header
          className="flex items-center justify-between px-5 py-3 flex-shrink-0 lg:hidden"
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
=======
    <div className="relative flex flex-col h-[100dvh] overflow-x-hidden w-full" style={{ background: 'var(--paper)' }}>
      {/* Header */}
      <div style={{ overflow: 'hidden', maxHeight: uiVisible ? '80px' : '0', transition: 'max-height 0.3s ease', flexShrink: 0 }}>
      <header
        className="flex items-center justify-between px-5 py-3"
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
      </div>

      {/* Scrollable body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-5 pb-2">
        {/* Greeting */}
        <div className="mb-5">
          <h2 className="font-serif text-2xl font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
            Today's lesson
          </h2>
          <p className="font-guj text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
            આજનો અભ્યાસ — થોડું થોડું, દરરોજ.
          </p>
        </div>

        {/* Daily Challenge */}
        {challenge && (
          <div
            className="rounded-[18px] p-5 mb-6 relative overflow-hidden"
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
>>>>>>> release1.0
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'var(--amber-soft)', color: 'var(--saffron-deep)' }}
          >
            🔥 <span>{streak}</span>
          </div>
        </header>

<<<<<<< HEAD
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-5 pb-16 lg:px-8 lg:py-8">
          <div className="max-w-5xl mx-auto w-full space-y-6">
            
            {/* Header Greeting Section */}
            <div>
              <h2 className="font-serif text-2xl lg:text-3xl font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
                Ready to speak?
              </h2>
              <p className="font-guj text-sm lg:text-[15px] mt-1" style={{ color: 'var(--ink-soft)' }}>
                આજે કઈ પરિસ્થિતિની પ્રૅક્ટિસ કરો?
              </p>
            </div>

            {/* Desktop Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
              
              {/* Left Column: Level selector + Scenarios (Col span 2 on desktop) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Level selector */}
                <div className="flex gap-2">
                  {(['all', 'beginner', 'intermediate', 'advanced'] as Difficulty[]).map(d => (
                    <button
                      key={d}
                      onClick={() => setFilter(d)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer hover:shadow-sm"
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

                {/* Scenarios Header */}
                <div className="flex items-baseline justify-between pt-2">
                  <h3 className="font-serif text-[17px] lg:text-[19px] font-semibold" style={{ color: 'var(--ink)' }}>
                    Practice Scenarios
                  </h3>
                  <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{filtered.length} scenarios</span>
                </div>

                {/* Scenarios list */}
                {loading ? (
                  <div className="text-center py-16 text-sm" style={{ color: 'var(--ink-soft)' }}>
                    Loading scenarios…
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3.5 pb-5">
                    {filtered.map(s => (
                      <button
                        key={s.id}
                        onClick={() => navigate(`/practice/${s.id}`, { state: { scenario: s } })}
                        className="text-left rounded-[15px] p-4 relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-sm active:scale-[.97] cursor-pointer"
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

              {/* Right Column: Daily Challenge + Performance Stats */}
              <div className="space-y-6">
                
                {/* Daily Challenge Card */}
                {challenge && (
                  <div
                    className="rounded-[18px] p-5 relative overflow-hidden shadow-sm"
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
                      className="relative z-10 text-sm font-bold px-4 py-2.5 rounded-xl transition-transform active:scale-95 cursor-pointer hover:bg-opacity-90 shadow-sm"
                      style={{ background: 'var(--card)', color: 'var(--teal)' }}
                    >
                      Start speaking →
                    </button>
                  </div>
                )}

                {/* Quick Performance Summary (Desktop only) */}
                {progress && (
                  <div className="hidden lg:block bg-[var(--card)] border border-[var(--line)] rounded-[18px] p-5 space-y-4">
                    <h3 className="font-serif text-base font-semibold" style={{ color: 'var(--ink)' }}>
                      Quick Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[var(--paper)] rounded-[14px] p-3 text-center">
                        <p className="text-[9.5px] uppercase font-bold tracking-wide" style={{ color: 'var(--ink-soft)' }}>Practice Time</p>
                        <p className="text-xl font-bold font-serif mt-1" style={{ color: 'var(--ink)' }}>{progress.total_minutes} <span className="text-[11px] font-sans font-normal text-[var(--ink-soft)]">m</span></p>
                      </div>
                      <div className="bg-[var(--paper)] rounded-[14px] p-3 text-center">
                        <p className="text-[9.5px] uppercase font-bold tracking-wide" style={{ color: 'var(--ink-soft)' }}>Vocabulary</p>
                        <p className="text-xl font-bold font-serif mt-1" style={{ color: 'var(--ink)' }}>{progress.vocabulary_count} <span className="text-[10px] font-sans font-normal text-[var(--ink-soft)]">words</span></p>
                      </div>
                    </div>
                    {/* Score gauge card */}
                    <div className="bg-[var(--paper-2)] rounded-[14px] p-3 text-center">
                      <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--ink-soft)' }}>Average Level Score</p>
                      <p className="text-2xl font-black font-serif my-1" style={{ color: 'var(--teal)' }}>
                        {progress.avg_score > 0 ? Math.round(progress.avg_score) : '—'}
                      </p>
                      <div className="w-full bg-[var(--paper)] h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div className="bg-[var(--teal)] h-full rounded-full transition-all" style={{ width: `${progress.avg_score || 0}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom nav (Mobile only) */}
        <nav
          className="flex flex-shrink-0 lg:hidden fixed bottom-0 left-0 right-0 z-40"
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
=======
        {loading ? (
          <div className="text-center py-16 text-sm" style={{ color: 'var(--ink-soft)' }}>
            Loading today's lesson…
          </div>
        ) : (
          <>
            {/* Today's Idioms */}
            <Section
              title="Today's Idioms"
              done={idiomsDone}
              total={todaysIdioms.length}
              onSeeAll={() => navigate('/idioms')}
            >
              {todaysIdioms.length === 0 ? (
                <AllDone label="idioms" onGo={() => navigate('/idioms')} />
              ) : (
                <div className="space-y-2.5">
                  {idiomsDone === todaysIdioms.length && (
                    <TargetComplete label="idioms" onSeeAll={() => navigate('/idioms')} />
                  )}
                  {todaysIdioms.map(i => (
                    <DailyItemCard
                      key={i.id}
                      emoji="💬"
                      accent="teal"
                      title={i.idiom}
                      subtitle={`${i.category} · ${i.difficulty}`}
                      meaningEn={i.english_meaning}
                      meaningGu={i.gujarati_meaning}
                      example={i.examples?.[0]}
                      read={learnedIdiomSet.has(i.id)}
                      onToggleRead={() => toggleIdiomLearned(i.id)}
                    />
                  ))}
                </div>
              )}
            </Section>

            {/* Today's Words */}
            <Section
              title="Today's Words"
              done={wordsDone}
              total={todaysWords.length}
              onSeeAll={() => navigate('/vocabulary')}
            >
              {todaysWords.length === 0 ? (
                <AllDone label="words" onGo={() => navigate('/vocabulary')} />
              ) : (
                <div className="space-y-2.5">
                  {wordsDone === todaysWords.length && (
                    <TargetComplete label="words" onSeeAll={() => navigate('/vocabulary')} />
                  )}
                  {todaysWords.map(w => {
                    const key = wordKey(w);
                    return (
                      <DailyItemCard
                        key={key}
                        emoji="📖"
                        accent="amber"
                        title={w.word}
                        subtitle={`${w.category} · ${w.part_of_speech}`}
                        meaningEn={w.english_meaning}
                        meaningGu={w.gujarati_meaning}
                        example={w.examples?.[0]}
                        read={!!progress.vocab[key]?.learned}
                        onToggleRead={() => setWord(key, { learned: !progress.vocab[key]?.learned })}
                      />
                    );
                  })}
                </div>
              )}
            </Section>

            {/* Today's Grammar */}
            <Section
              title="Today's Grammar"
              done={grammarDone}
              total={todaysGrammar.length}
              onSeeAll={() => navigate('/grammar')}
            >
              {todaysGrammar.length === 0 ? (
                <AllDone label="grammar chapters" onGo={() => navigate('/grammar')} />
              ) : (
                <div className="space-y-2.5">
                  {grammarDone === todaysGrammar.length && (
                    <TargetComplete label="grammar" onSeeAll={() => navigate('/grammar')} />
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {todaysGrammar.map(ch => (
                      <ChapterCard
                        key={ch.slug}
                        chapter={ch}
                        completed={grammarCompletedSet.has(ch.slug)}
                        score={progress.grammarScores?.[ch.slug]}
                        onOpen={() => navigate(`/grammar/${ch.slug}`)}
                        onToggleComplete={() => toggleGrammarComplete(ch.slug)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* Quick links */}
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
          </>
        )}
      </div>

      <ScrollToTop targetRef={scrollRef} />
      <BottomNav active="home" visible={uiVisible} />
>>>>>>> release1.0
    </div>
  );
}

/** Section header (title + done/total progress + "See all") wrapping its content. */
function Section({
  title,
  done,
  total,
  onSeeAll,
  children,
}: {
  title: string;
  done: number;
  total: number;
  onSeeAll: () => void;
  children: React.ReactNode;
}) {
  const allDone = total > 0 && done === total;
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <h3 className="font-serif text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>
            {title}
          </h3>
          {total > 0 && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--paper-2)',
                color: allDone ? 'var(--teal)' : 'var(--ink-soft)',
              }}
            >
              {done}/{total}
            </span>
          )}
        </div>
        <button
          onClick={onSeeAll}
          className="text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal)' }}
        >
          See all →
        </button>
      </div>
      {children}
    </div>
  );
}

/** Shown above the cards once every one of today's items in a bucket is read. */
function TargetComplete({ label, onSeeAll }: { label: string; onSeeAll: () => void }) {
  return (
    <div
      className="rounded-[15px] p-4 flex items-center gap-3"
      style={{ background: 'var(--teal-soft)', border: '1px solid var(--line)' }}
    >
      <span className="text-2xl flex-shrink-0">🎉</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold" style={{ color: 'var(--teal)' }}>
          Today's {label} target is completed!
        </p>
        <button
          onClick={onSeeAll}
          className="text-[12px] font-semibold mt-0.5 transition-opacity hover:opacity-70"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)', padding: 0 }}
        >
          See all {label} →
        </button>
      </div>
    </div>
  );
}

/** Friendly "all caught up" state when a daily pool is empty (nothing left to learn). */
function AllDone({ label, onGo }: { label: string; onGo: () => void }) {
  return (
    <button
      onClick={onGo}
      className="w-full text-left rounded-[15px] p-4 transition-all active:scale-[.98]"
      style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
    >
      <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
        🎉 You've read every one of the {label}!
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
        Explore the full library →
      </p>
    </button>
  );
}
