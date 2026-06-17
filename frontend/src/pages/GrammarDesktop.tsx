import DesktopLayout from '../components/DesktopLayout';
import ChapterCard from '../components/ChapterCard';
import type { GrammarChapterSummary, GrammarIndex, GrammarLevel } from '../types';

interface GrammarDesktopProps {
  index: GrammarIndex | null;
  loading: boolean;
  level: string;
  setLevel: (lvl: 'All' | GrammarLevel) => void;
  grammarCompletedSet: Set<string>;
  progress: any;
  toggleGrammarComplete: (slug: string) => void;
  navigate: (path: string) => void;
  groupedChapters: Record<GrammarLevel, GrammarChapterSummary[]>;
  levelCounts: Record<GrammarLevel, { done: number; total: number }>;
}

const LEVEL_COLORS: Record<GrammarLevel, { bg: string; text: string; header: string }> = {
  Beginner: { bg: 'bg-primary-fixed/30', text: 'text-primary', header: 'text-primary' },
  Intermediate: { bg: 'bg-secondary-fixed/30', text: 'text-secondary', header: 'text-secondary' },
  Advanced: { bg: 'bg-tertiary-fixed/30', text: 'text-tertiary', header: 'text-tertiary' },
};

export default function GrammarDesktop({
  index,
  loading,
  level,
  setLevel,
  grammarCompletedSet,
  progress,
  toggleGrammarComplete,
  navigate,
  groupedChapters,
  levelCounts,
}: GrammarDesktopProps) {
  if (loading) {
    return (
      <DesktopLayout activeTab="grammar">
        <div className="flex-grow flex items-center justify-center min-h-[300px] text-sm text-on-surface-variant font-bold font-serif">
          Loading grammar chapters…
        </div>
      </DesktopLayout>
    );
  }

  const total = index?.total_chapters ?? 0;
  const completedCount = (index?.chapters ?? []).filter(c => grammarCompletedSet.has(c.slug)).length;
  const pct = total ? Math.round((completedCount / total) * 100) : 0;
  const left = total - completedCount;

  return (
    <DesktopLayout activeTab="grammar">
      <div className="max-w-container-max mx-auto p-margin-desktop w-full flex flex-col gap-stack-lg">
        {/* Header Strip */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md pb-4 border-b border-outline-variant/10">
            <div>
              <h1 className="font-display-lg text-display-lg text-on-background mb-2 font-serif">Grammar Chapters</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Bilingual lessons with grammar explanations, examples, and practice exercises.
              </p>
            </div>
            <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/10 flex items-center gap-4 shadow-sm w-full md:w-80 select-none">
              <div className="flex-1">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-bold text-on-surface">Overall Progress</span>
                  <span className="text-xs font-bold text-primary">{completedCount}/{total} ({pct}%)</span>
                </div>
                <div className="h-1.5 w-full progress-track rounded-full overflow-hidden bg-primary/10">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                </div>
                <p className="text-[10px] mt-1 text-on-surface-variant leading-none">
                  {left === 0 ? '🎉 All chapters complete!' : `${left} chapter${left === 1 ? '' : 's'} left`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Level Filters */}
        <div className="flex border-b border-outline-variant/20 mb-2">
          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => {
            const isActive = level === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`px-6 py-4 font-title-md text-title-md cursor-pointer transition-all border-b-2 font-serif ${
                  isActive
                    ? 'text-primary border-primary font-bold'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        {/* Chapters Lists grouped by Level */}
        <div className="flex flex-col gap-stack-lg">
          {(['Beginner', 'Intermediate', 'Advanced'] as GrammarLevel[]).map((lvl) => {
            const chapters = groupedChapters[lvl];
            if (!chapters || chapters.length === 0) return null;
            const lc = levelCounts[lvl];

            return (
              <div key={lvl} className="flex flex-col gap-stack-sm">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                  <h2 className={`font-headline-lg text-headline-lg font-serif font-bold ${LEVEL_COLORS[lvl].header}`}>
                    {lvl}
                  </h2>
                  <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
                    {lc.done}/{lc.total} Completed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
                  {chapters.map((ch) => (
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
            );
          })}
        </div>
      </div>
    </DesktopLayout>
  );
}
