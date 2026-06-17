import DesktopLayout from '../components/DesktopLayout';
import IdiomCard from '../components/IdiomCard';
import type { Idiom } from '../types';

interface IdiomsDesktopProps {
  loading: boolean;
  cat: string;
  diff: string;
  filter: 'all' | 'unread' | 'saved';
  isCategoriesExpanded: boolean;
  learnedSet: Set<number>;
  learnedCount: number;
  unreadCount: number;
  pct: number;
  displayedCategories: string[];
  hiddenCount: number;
  visible: Idiom[];
  bookmarks: Set<number>;
  limit: number;
  totalIdioms: number;
  setCatFiltered: (c: string) => void;
  setDiffFiltered: (d: string) => void;
  setFilterFiltered: (f: 'all' | 'unread' | 'saved') => void;
  setIsCategoriesExpanded: (exp: boolean) => void;
  toggleIdiomBookmark: (id: number) => void;
  toggleIdiomLearned: (id: number) => void;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  filteredCount: number;
}

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const DIFF_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  All: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  Beginner: { bg: 'bg-primary-fixed/20', text: 'text-primary', border: 'border-primary/10' },
  Intermediate: { bg: 'bg-secondary-fixed/20', text: 'text-secondary', border: 'border-secondary/10' },
  Advanced: { bg: 'bg-tertiary-fixed/20', text: 'text-tertiary', border: 'border-tertiary/10' },
};

export default function IdiomsDesktop({
  loading,
  cat,
  diff,
  filter,
  isCategoriesExpanded,
  learnedSet,
  learnedCount,
  unreadCount,
  pct,
  displayedCategories,
  hiddenCount,
  visible,
  bookmarks,
  limit,
  totalIdioms,
  setCatFiltered,
  setDiffFiltered,
  setFilterFiltered,
  setIsCategoriesExpanded,
  toggleIdiomBookmark,
  toggleIdiomLearned,
  setLimit,
  filteredCount,
}: IdiomsDesktopProps) {
  if (loading) {
    return (
      <DesktopLayout activeTab="idioms">
        <div className="flex-grow flex items-center justify-center min-h-[300px] text-sm text-on-surface-variant font-bold">
          Loading idioms…
        </div>
      </DesktopLayout>
    );
  }

  return (
    <DesktopLayout activeTab="idioms">
      <div className="max-w-container-max mx-auto p-margin-desktop w-full flex flex-col gap-stack-lg">
        {/* Header Strip */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md pb-4 border-b border-outline-variant/10">
            <div>
              <h1 className="font-display-lg text-display-lg text-on-background mb-2 font-serif">Idioms Library</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Master idioms with meanings, bilingual Gujarati examples, and pronunciation.
              </p>
            </div>
            <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/10 flex items-center gap-4 shadow-sm w-full md:w-80 select-none">
              <div className="flex-1">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-bold text-on-surface">Idioms Mastered</span>
                  <span className="text-xs font-bold text-primary">{learnedCount}/{totalIdioms} ({pct}%)</span>
                </div>
                <div className="h-1.5 w-full progress-track rounded-full overflow-hidden bg-primary/10">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Status Tab Filters */}
        <div className="flex border-b border-outline-variant/20 mb-2">
          <button
            onClick={() => setFilterFiltered('all')}
            className={`px-6 py-4 font-title-md text-title-md cursor-pointer transition-all border-b-2 font-serif ${
              filter === 'all'
                ? 'text-primary border-primary font-bold'
                : 'text-on-surface-variant border-transparent hover:text-primary'
            }`}
          >
            All Idioms
          </button>
          <button
            onClick={() => setFilterFiltered('unread')}
            className={`px-6 py-4 font-title-md text-title-md cursor-pointer transition-all border-b-2 font-serif ${
              filter === 'unread'
                ? 'text-primary border-primary font-bold'
                : 'text-on-surface-variant border-transparent hover:text-primary'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilterFiltered('saved')}
            className={`px-6 py-4 font-title-md text-title-md cursor-pointer transition-all border-b-2 font-serif ${
              filter === 'saved'
                ? 'text-primary border-primary font-bold'
                : 'text-on-surface-variant border-transparent hover:text-primary'
            }`}
          >
            Saved ({bookmarks.size})
          </button>
        </div>

        {/* Filter Configuration Bento Panel */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-stretch">
          {/* Left Panel: Filters */}
          <div className="md:col-span-4 bg-surface-container rounded-xl p-stack-md border border-outline-variant/10 shadow-sm flex flex-col gap-6 select-none">
            {/* Difficulty Filter */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-sm">📊</span>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Difficulty Level
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DIFFICULTIES.map((d) => {
                  const isActive = diff === d;
                  const colors = DIFF_COLORS[d];
                  return (
                    <button
                      key={d}
                      onClick={() => setDiffFiltered(d)}
                      className={`whitespace-nowrap px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                        isActive
                          ? `${colors.bg} ${colors.text} ${colors.border}`
                          : 'bg-surface text-on-surface-variant border-transparent hover:bg-surface-container-high'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-outline-variant/20"></div>

            {/* Topic Filter */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-sm">🏷️</span>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Topic / Category
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCatFiltered('All')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    cat === 'All'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-surface text-on-surface-variant border-transparent hover:bg-surface-container-high'
                  }`}
                >
                  All Topics
                </button>
                {displayedCategories.map((c) => {
                  const isActive = cat === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setCatFiltered(c)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-surface text-on-surface-variant border-transparent hover:bg-surface-container-high'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
                {hiddenCount > 0 && (
                  <button
                    onClick={() => setIsCategoriesExpanded(true)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary-fixed/20 text-primary border border-transparent hover:bg-primary-fixed/30 cursor-pointer"
                  >
                    + {hiddenCount} More
                  </button>
                )}
                {isCategoriesExpanded && (
                  <button
                    onClick={() => setIsCategoriesExpanded(false)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary-fixed/20 text-primary border border-transparent hover:bg-primary-fixed/30 cursor-pointer"
                  >
                    Show Less
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Idioms Grid */}
          <div className="md:col-span-8 flex flex-col gap-stack-sm">
            {visible.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visible.map((idiom) => (
                  <IdiomCard
                    key={idiom.id}
                    idiom={idiom}
                    bookmarked={bookmarks.has(idiom.id)}
                    learned={learnedSet.has(idiom.id)}
                    onToggleBookmark={() => toggleIdiomBookmark(idiom.id)}
                    onToggleLearned={() => toggleIdiomLearned(idiom.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-surface-container rounded-xl border border-outline-variant/10 flex-1 flex flex-col justify-center items-center">
                <div className="text-4xl mb-3">
                  {filter === 'saved' ? '🔖' : filter === 'unread' ? '📖' : '🔍'}
                </div>
                <p className="text-sm font-semibold text-on-background font-bold">
                  {filter === 'saved'
                    ? 'No saved idioms yet'
                    : filter === 'unread'
                    ? 'All idioms completed!'
                    : 'No idioms match these filters'}
                </p>
                <p className="text-xs mt-1 text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
                  {filter === 'saved'
                    ? 'Tap the bookmark icon on any idiom card to save it here for quick practice.'
                    : filter === 'unread'
                    ? 'Great job! You have marked all idioms as learned.'
                    : 'Try clearing some filters to see more idioms.'}
                </p>
              </div>
            )}

            {limit < filteredCount && (
              <button
                onClick={() => setLimit((l) => l + 12)}
                className="w-full mt-4 py-3 bg-surface-container-lowest border border-outline-variant/10 text-on-surface hover:bg-surface-container-low transition-all rounded-xl font-semibold text-sm cursor-pointer shadow-sm"
              >
                Load more ({filteredCount - limit} left)
              </button>
            )}
          </div>
        </section>
      </div>
    </DesktopLayout>
  );
}
