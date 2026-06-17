import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../components/DesktopLayout';
import ExplanationBlockComponent from '../components/ExplanationBlock';
import PracticeItemComponent from '../components/PracticeItem';
import Bi from '../components/Bi';
import { CheckIcon } from '../components/Icon';
import type { GrammarChapter as Chapter, GrammarChapterSummary, GrammarLevel } from '../types';

interface GrammarChapterDesktopProps {
  chapter: Chapter;
  chapterList: GrammarChapterSummary[];
  slug: string;
  loading: boolean;
  tab: 'learn' | 'practice';
  setTab: (tab: 'learn' | 'practice') => void;
  completed: boolean;
  gradedTotal: number;
  correctCount: number;
  scorePct: number;
  handleAnswered: (idx: number, correct: boolean) => void;
  markComplete: () => void;
  prevChapter: GrammarChapterSummary | null;
  nextChapter: GrammarChapterSummary | null;
  level: GrammarLevel;
}

export default function GrammarChapterDesktop({
  chapter,
  tab,
  setTab,
  completed,
  gradedTotal,
  correctCount,
  scorePct,
  handleAnswered,
  markComplete,
  prevChapter,
  nextChapter,
  level,
}: GrammarChapterDesktopProps) {
  const navigate = useNavigate();

  return (
    <DesktopLayout activeTab="grammar">
      <div className="max-w-container-max mx-auto p-margin-desktop flex flex-col gap-stack-lg w-full">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
          <button 
            onClick={() => navigate('/grammar')} 
            className="hover:text-primary transition-colors cursor-pointer font-bold"
          >
            Grammar
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-background">{chapter.title.en}</span>
        </nav>

        {/* Lesson Header (Mastery Block) */}
        <header className="bg-primary rounded-xl overflow-hidden shadow-sm relative isolate flex flex-col lg:flex-row items-center">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-container via-primary to-primary opacity-80 -z-10"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl -z-10"></div>
          <div className="flex-1 p-stack-lg z-10 flex flex-col gap-stack-sm">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-on-primary border border-white/30 px-3 py-1 rounded-full font-label-sm text-label-sm w-fit uppercase tracking-wider backdrop-blur-sm font-bold">
                Chapter {chapter.order}
              </span>
              <span className="bg-secondary text-on-secondary px-3 py-1 rounded-full font-label-sm text-label-sm w-fit uppercase tracking-wider font-bold">
                {level}
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-primary font-serif leading-none">
              {chapter.title.en}
            </h1>
            {chapter.title.gu && (
              <h2 className="font-headline-lg text-headline-lg text-primary-fixed font-light mt-2 font-guj">
                {chapter.title.gu}
              </h2>
            )}
            {chapter.summary && (
              <div className="mt-4 max-w-2xl text-on-primary/95">
                <Bi 
                  t={chapter.summary} 
                  enClass="text-body-lg font-body-lg leading-relaxed text-on-primary"
                  guClass="text-primary-fixed-dim italic mt-2 font-guj block leading-relaxed"
                />
              </div>
            )}
          </div>
          <div className="w-full lg:w-1/3 min-h-[300px] bg-primary-container relative shrink-0">
            <img 
              alt="Decorative graphic related to grammar learning" 
              className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-overlay" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhdkZ0mp7EDh7d05_AUvtcK5ycvBjdJp_1H4juVUtd7e2esi0KVeZcxcmIEv6JqPRD-PjkqMzuvFZ-CjLRs7T5WkGtHM2gBW-HaFS-9YFW-k3Z8tbOI6wEP4ToEA0a-JJ2Rd04L-tokD9ogZpwEexQ2sZgMsBJ0iqwUwhjiqoeECU0iehB1a0Gq_cQ8LOw86-JVB9YnpuqRKfPC98CyxoLmEOAx7A-HCbYtVMNHt59wKgj5ZH9a-ddXUx6pXOdVrsMCPD_-Q6CT-k"
            />
          </div>
        </header>

        {/* Learn / Practice Switcher Tabs */}
        <div className="flex border-b border-outline-variant/20 mb-2">
          <button
            onClick={() => setTab('learn')}
            className={`px-6 py-4 font-title-md text-title-md cursor-pointer transition-all border-b-2 font-serif ${
              tab === 'learn'
                ? 'text-primary border-primary font-bold'
                : 'text-on-surface-variant border-transparent hover:text-primary'
            }`}
          >
            Learn ({chapter.explanations.length})
          </button>
          <button
            onClick={() => setTab('practice')}
            className={`px-6 py-4 font-title-md text-title-md cursor-pointer transition-all border-b-2 font-serif ${
              tab === 'practice'
                ? 'text-primary border-primary font-bold'
                : 'text-on-surface-variant border-transparent hover:text-primary'
            }`}
          >
            Practice ({chapter.practice.length})
          </button>
        </div>

        {tab === 'learn' ? (
          <div className="flex flex-col gap-stack-lg">
            {/* Bento-Style Grid for Explanation Blocks */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-stretch">
              {chapter.explanations.map((block, idx) => (
                <div 
                  key={block.id ?? idx}
                  className="transition-all duration-300 hover:-translate-y-0.5"
                >
                  <ExplanationBlockComponent block={block} />
                </div>
              ))}
            </section>

            {/* Practice Action Area CTA */}
            <section className="bg-surface-container border border-outline-variant/20 rounded-xl p-stack-lg flex flex-col items-center justify-center text-center gap-stack-sm shadow-sm relative overflow-hidden mt-4">
              <div className="absolute inset-0 bg-white/40 pointer-events-none rounded-xl" style={{ backgroundImage: 'radial-gradient(#aef0d7 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.3 }}></div>
              <div className="z-10 flex flex-col items-center max-w-lg">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center shadow-sm mb-4 border border-outline-variant/10 text-primary">
                  <span className="material-symbols-outlined text-3xl">edit_document</span>
                </div>
                <h3 className="font-title-md text-title-md text-on-background mb-2 font-serif font-bold">
                  Ready to test your knowledge?
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Take a short quiz to reinforce what you've learned in this chapter.
                </p>
                <button 
                  onClick={() => setTab('practice')}
                  className="bg-secondary text-on-secondary px-8 py-4 rounded-full font-title-md text-title-md shadow-md hover:bg-secondary/90 hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 group cursor-pointer font-bold"
                >
                  Practice this chapter
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto w-full">
            {/* Live Score Block */}
            {gradedTotal > 0 && (
              <div className="flex items-center justify-between rounded-xl p-4 bg-surface border border-outline-variant/20 shadow-sm">
                <span className="text-sm font-bold text-on-surface">Practice Score</span>
                <span className="font-serif text-lg font-bold text-primary">
                  {correctCount} / {gradedTotal} ({scorePct}%)
                </span>
              </div>
            )}

            {/* Exercises List */}
            <div className="space-y-4">
              {chapter.practice.map((item, idx) => (
                <div key={item.id ?? idx} className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-stack-md shadow-sm">
                  <PracticeItemComponent
                    item={item}
                    index={idx}
                    onAnswered={(correct) => handleAnswered(idx, correct)}
                  />
                </div>
              ))}
            </div>

            {/* Mark complete */}
            <button
              onClick={markComplete}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                completed
                  ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                  : 'bg-primary text-on-primary hover:bg-primary-container'
              }`}
            >
              <CheckIcon className="w-5 h-5" />
              {completed ? '✓ Chapter Completed — Click to undo' : 'Mark Chapter as Completed'}
            </button>
          </div>
        )}

        {/* Footer Navigation */}
        <footer className="mt-stack-lg border-t border-outline-variant/10 pt-stack-md flex justify-between items-center pb-stack-lg select-none">
          {prevChapter ? (
            <button
              onClick={() => navigate(`/grammar/${prevChapter.slug}`)}
              className="flex flex-col gap-1 text-left text-on-surface-variant hover:text-primary transition-all group cursor-pointer"
            >
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline group-hover:text-primary/70 font-bold">
                Previous Chapter
              </span>
              <div className="flex items-center gap-2 font-title-md text-title-md font-serif font-bold">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                {prevChapter.title.en}
              </div>
            </button>
          ) : (
            <div className="flex-1"></div>
          )}

          {nextChapter ? (
            <button
              onClick={() => navigate(`/grammar/${nextChapter.slug}`)}
              className="flex flex-col items-end gap-1 text-right text-on-surface-variant hover:text-primary transition-all group cursor-pointer"
            >
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline group-hover:text-primary/70 font-bold">
                Next Chapter
              </span>
              <div className="flex items-center gap-2 font-title-md text-title-md font-serif font-bold">
                {nextChapter.title.en}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </button>
          ) : (
            <div className="flex-1"></div>
          )}
        </footer>
      </div>
    </DesktopLayout>
  );
}
