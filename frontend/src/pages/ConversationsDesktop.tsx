import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../components/DesktopLayout';
import type { Scenario } from '../types';

interface DialogueCardData {
  key: string;
  title: string;
  category: string;
}

interface ConversationsDesktopProps {
  scenarios: Scenario[];
  dialogues: DialogueCardData[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  filteredScenarios: Scenario[];
  filteredDialogues: DialogueCardData[];
}

const DIFFICULTY_LABELS = {
  All: 'All Levels',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
} as const;

const DIFF_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  beginner: { bg: 'bg-primary-fixed/20', text: 'text-primary', border: 'border-primary/10' },
  intermediate: { bg: 'bg-secondary-fixed/20', text: 'text-secondary', border: 'border-secondary/10' },
  advanced: { bg: 'bg-tertiary-fixed/20', text: 'text-tertiary', border: 'border-tertiary/10' },
};

export default function ConversationsDesktop({
  loading,
  search,
  setSearch,
  filteredScenarios,
  filteredDialogues,
}: ConversationsDesktopProps) {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<'All' | 'beginner' | 'intermediate' | 'advanced'>('All');

  // Filter scenarios based on both search and selected difficulty level
  const displayedScenarios = useMemo(() => {
    return filteredScenarios.filter(
      (s) => difficulty === 'All' || s.difficulty === difficulty
    );
  }, [filteredScenarios, difficulty]);

  if (loading) {
    return (
      <DesktopLayout activeTab="conversations">
        <div className="flex-grow flex items-center justify-center min-h-[300px] text-sm text-on-surface-variant font-bold font-serif">
          Loading scenarios…
        </div>
      </DesktopLayout>
    );
  }

  return (
    <DesktopLayout activeTab="conversations">
      <div className="max-w-container-max mx-auto p-margin-desktop w-full flex flex-col gap-stack-lg">
        {/* Header / Search Strip */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md pb-4 border-b border-outline-variant/10">
            <div>
              <h1 className="font-display-lg text-display-lg text-on-background mb-2 font-serif">Ready to Speak?</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                આજે કઈ પરિસ્થિતિની પ્રેક્ટિસ કરો? (Which situation will you practice today?)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-surface-container-high rounded-full px-4 py-2.5 border border-outline-variant/20 focus-within:border-primary/50 transition-all w-80">
                <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[20px]">search</span>
                <input
                  className="bg-transparent border-none focus:ring-0 text-body-md font-body-md text-on-surface w-full placeholder-on-surface-variant/50 outline-none"
                  placeholder="Search scenarios..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="flex flex-wrap gap-2">
          {(['All', 'beginner', 'intermediate', 'advanced'] as const).map((lvl) => {
            const isActive = difficulty === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setDifficulty(lvl)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high'
                }`}
              >
                {DIFFICULTY_LABELS[lvl]}
              </button>
            );
          })}
        </section>

        {/* Content Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          
          {/* Left Main Area: AI Scenarios & Dialogues */}
          <div className="lg:col-span-8 flex flex-col gap-stack-lg">
            
            {/* Scenarios Grid */}
            <section className="flex flex-col gap-stack-sm">
              <div className="flex justify-between items-baseline pb-2 border-b border-outline-variant/20">
                <h3 className="font-headline-lg text-headline-lg text-on-background font-serif font-bold">
                  AI Practice Scenarios
                </h3>
                <span className="text-xs font-bold text-on-surface-variant">
                  {displayedScenarios.length} scenarios available
                </span>
              </div>

              {displayedScenarios.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
                  {displayedScenarios.map((s) => {
                    const colors = DIFF_COLORS[s.difficulty] ?? DIFF_COLORS.beginner;
                    return (
                      <div
                        key={s.id}
                        onClick={() => navigate(`/practice/${s.id}`, { state: { scenario: s } })}
                        className="group relative bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm hover:bg-surface-container transition-all cursor-pointer flex flex-col justify-between min-h-[180px] hover:-translate-y-0.5 duration-200"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-2xl">
                              {s.icon || '🗣️'}
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text} border ${colors.border}`}>
                              {s.difficulty.slice(0, 3)}
                            </span>
                          </div>
                          <h4 className="font-title-md text-title-md text-on-surface font-serif font-bold mb-1 leading-snug group-hover:text-primary transition-colors">
                            {s.title}
                          </h4>
                          <p className="text-xs text-on-surface-variant">
                            {s.category} · ~{s.estimated_minutes}m
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-outline-variant/10 flex justify-between items-center text-xs font-bold text-primary">
                          <span>Start practice</span>
                          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                            arrow_forward
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 px-4 bg-surface-container rounded-xl border border-outline-variant/10">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-3">
                    chat_bubble_outline
                  </span>
                  <p className="text-sm font-semibold text-on-background font-bold">No scenarios match</p>
                  <p className="text-xs mt-1 text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
                    Try modifying your search or changing the difficulty filter pill.
                  </p>
                </div>
              )}
            </section>

            {/* Read-Aloud Dialogues Section */}
            <section className="flex flex-col gap-stack-sm">
              <div className="flex justify-between items-baseline pb-2 border-b border-outline-variant/20">
                <h3 className="font-headline-lg text-headline-lg text-on-background font-serif font-bold">
                  Read-Aloud Dialogues
                </h3>
                <span className="text-xs font-bold text-on-surface-variant">
                  {filteredDialogues.length} dialogues available
                </span>
              </div>

              {filteredDialogues.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredDialogues.map((d) => (
                    <div
                      key={d.key}
                      onClick={() => navigate(`/conversations/dialogue/${d.key}`)}
                      className="group bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/10 rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all hover:-translate-y-0.5 duration-200"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-fixed/20 flex items-center justify-center text-lg shrink-0 text-primary">
                        💬
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-title-md text-title-md text-on-surface font-serif font-bold truncate leading-tight group-hover:text-primary transition-colors">
                          {d.title}
                        </h4>
                        <p className="text-[11px] text-on-surface-variant">{d.category}</p>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant shrink-0 group-hover:translate-x-1 transition-transform">
                        chevron_right
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4 bg-surface-container rounded-xl border border-outline-variant/10">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-3">
                    menu_book
                  </span>
                  <p className="text-sm font-semibold text-on-background font-bold">No dialogues match</p>
                  <p className="text-xs mt-1 text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
                    Try typing something else in the search field above.
                  </p>
                </div>
              )}
            </section>

          </div>

          {/* Right Sidebar Area: Challenge & Learning Tips */}
          <div className="lg:col-span-4 flex flex-col gap-stack-lg select-none">
            
            {/* Today's Challenge */}
            <div className="bg-primary text-on-primary p-6 rounded-2xl relative overflow-hidden shadow-sm">
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-white/10 border border-white/10 rounded-full font-label-sm text-[10px] uppercase tracking-widest text-primary-fixed-dim mb-4 font-bold">
                    Today's Challenge
                  </span>
                  <h3 className="font-headline-lg text-headline-lg font-serif mb-2 leading-snug">
                    Introduce Yourself
                  </h3>
                  <p className="font-body-md text-body-md text-primary-fixed-dim leading-relaxed">
                    Practice introducing yourself to a new colleague at work in under 60 seconds with our interactive AI scenario.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/practice/1')}
                  className="w-full bg-secondary text-on-secondary font-label-md text-label-md py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-secondary-container transition-all active:scale-95 cursor-pointer font-bold mt-2"
                >
                  Start Challenge
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
              {/* Decorative radial overlay */}
              <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom_right,_var(--color-primary-container),_transparent)] opacity-40 pointer-events-none"></div>
            </div>

            {/* Daily stats summary */}
            <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col gap-4">
              <h3 className="font-title-md text-title-md text-on-surface font-serif font-bold">Daily Progress</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-lowest p-4 rounded-xl text-center border border-outline-variant/5">
                  <span className="text-[10px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">Practice Time</span>
                  <span className="font-serif text-2xl font-bold text-secondary">24m</span>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl text-center border border-outline-variant/5">
                  <span className="text-[10px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">Vocabulary</span>
                  <span className="font-serif text-2xl font-bold text-primary">12</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex justify-between text-xs font-bold text-on-surface">
                  <span>Weekly Goal</span>
                  <span className="text-primary">85% Completed</span>
                </div>
                <div className="h-2 w-full progress-track rounded-full overflow-hidden bg-primary/10">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>

            {/* Learn Tip Card */}
            <div className="border-2 border-dashed border-outline-variant/40 p-5 rounded-2xl flex gap-4">
              <span className="material-symbols-outlined text-secondary text-[28px] shrink-0">
                lightbulb
              </span>
              <div>
                <h4 className="font-label-md text-label-md text-secondary font-bold mb-1">Bolo Fluent Tip</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Try mimicking the tone, pitch, and speed of the AI speaker during live practice to build natural-sounding pronunciation and flow.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </DesktopLayout>
  );
}
