import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../components/DesktopLayout';
import Flashcard from '../components/Flashcard';
import IdiomCard from '../components/IdiomCard';
import type { LocalProgress } from '../hooks/useLocalProgress';
import type { GrammarChapterSummary, Idiom, VocabWord } from '../types';

interface HomeDesktopProps {
  streak: number;
  todaysIdioms: Idiom[];
  todaysWords: VocabWord[];
  todaysGrammar: GrammarChapterSummary[];
  loading: boolean;
  progress: LocalProgress;
  toggleIdiomLearned: (id: number) => void;
  toggleIdiomBookmark: (id: number) => void;
  toggleGrammarComplete: (slug: string) => void;
  setWord: (key: string, data: Partial<{ learned: boolean; spoken: boolean; bookmarked: boolean }>) => void;
  wordKey: (w: VocabWord) => string;
}

export default function HomeDesktop({
  streak,
  todaysIdioms,
  todaysWords,
  todaysGrammar,
  loading,
  progress,
  toggleIdiomLearned,
  toggleIdiomBookmark,
  toggleGrammarComplete,
  setWord,
  wordKey,
}: HomeDesktopProps) {
  const navigate = useNavigate();
  const idiomBookmarkSet = new Set<number>(progress.idiomBookmarks ?? []);

  if (loading) {
    return (
      <DesktopLayout activeTab="home" streak={streak}>
        <div className="flex-grow flex items-center justify-center min-h-[300px] text-sm text-on-surface-variant font-bold font-serif">
          Loading today's lesson…
        </div>
      </DesktopLayout>
    );
  }

  return (
    <DesktopLayout activeTab="home" streak={streak}>
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        {/* Bento/Grid Layout for Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Main 8-column layout (Idioms and Words) */}
          <div className="lg:col-span-8 flex flex-col gap-stack-lg">
            {/* Today's Idioms Section */}
            <section>
              <div className="flex items-center justify-between mb-stack-md border-b border-outline-variant/20 pb-2">
                <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-3 font-serif">
                  <span className="material-symbols-outlined text-3xl">auto_stories</span>
                  Today's Idioms
                </h2>
                <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
                  {todaysIdioms.length} Phrases
                </span>
              </div>

              {todaysIdioms.length === 0 ? (
                <div className="bg-surface-container-low rounded-xl p-6 text-center border border-outline-variant/10">
                  <p className="font-body-md text-on-surface-variant">All idioms for today completed!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack-sm">
                  {todaysIdioms.map((idiom) => (
                    <IdiomCard
                      key={idiom.id}
                      idiom={idiom}
                      bookmarked={idiomBookmarkSet.has(idiom.id)}
                      learned={(progress.learnedIdioms ?? []).includes(idiom.id)}
                      onToggleBookmark={() => toggleIdiomBookmark(idiom.id)}
                      onToggleLearned={() => toggleIdiomLearned(idiom.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Today's Words Section */}
            <section>
              <div className="flex items-center justify-between mb-stack-md border-b border-outline-variant/20 pb-2">
                <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-3 font-serif">
                  <span className="material-symbols-outlined text-3xl">menu_book</span>
                  Today's Words
                </h2>
                <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
                  {todaysWords.length} Words
                </span>
              </div>

              {todaysWords.length === 0 ? (
                <div className="bg-surface-container-low rounded-xl p-6 text-center border border-outline-variant/10">
                  <p className="font-body-md text-on-surface-variant">All words for today completed!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack-sm">
                  {todaysWords.map((word) => {
                    const key = wordKey(word);
                    const wp = progress.vocab[key] ?? {};
                    return (
                      <Flashcard
                        key={key}
                        word={word}
                        learned={wp.learned}
                        spoken={wp.spoken}
                        bookmarked={wp.bookmarked}
                        onToggleLearned={() => setWord(key, { learned: !wp.learned })}
                        onSpoken={() => setWord(key, { spoken: true })}
                        onToggleBookmark={() => setWord(key, { bookmarked: !wp.bookmarked })}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar 4-column layout (Grammar, Info graphic) */}
          <div className="lg:col-span-4 flex flex-col gap-stack-lg">
            {/* Today's Grammar Section */}
            <section className="bg-surface-container p-stack-md rounded-xl border border-outline-variant/10">
              <div className="flex items-center justify-between mb-stack-sm pb-2 border-b border-outline-variant/20">
                <h3 className="font-title-md text-title-md text-primary font-bold font-serif flex items-center gap-2">
                  <span className="material-symbols-outlined">architecture</span>
                  Today's Grammar
                </h3>
                <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded-full">
                  {todaysGrammar.length} Chapters
                </span>
              </div>

              {todaysGrammar.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-sm text-on-surface-variant">All grammar for today completed!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {todaysGrammar.map((chapter) => {
                    const isCompleted = (progress.grammarCompleted ?? []).includes(chapter.slug);
                    return (
                      <div 
                        key={chapter.slug}
                        className="bg-surface-container-lowest rounded-lg border border-primary/10 p-4 hover:border-primary/30 transition-colors flex justify-between items-center"
                      >
                        <div 
                          onClick={() => navigate(`/grammar/${chapter.slug}`)}
                          className="cursor-pointer flex-1 min-w-0"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                              {chapter.level}
                            </span>
                            <span className="text-[11px] text-on-surface-variant">
                              · Chapter {chapter.order}
                            </span>
                          </div>
                          <h4 className={`font-serif text-sm font-semibold truncate leading-snug text-on-surface ${
                            isCompleted ? 'line-through opacity-70' : ''
                          }`}>
                            {chapter.title.en}
                          </h4>
                          {chapter.title.gu && (
                            <p className="text-[11px] text-primary truncate font-guj mt-0.5">
                              {chapter.title.gu}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => toggleGrammarComplete(chapter.slug)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all cursor-pointer ml-3 shrink-0 ${
                            isCompleted 
                              ? 'bg-primary border-primary text-white' 
                              : 'bg-surface border-outline-variant/50 text-outline hover:text-primary hover:border-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Contextual Side Graphic */}
            <div className="bg-surface-container p-stack-md rounded-xl border border-outline-variant/10">
              <h3 className="font-title-md text-title-md text-primary mb-3 font-serif">Why learn idioms?</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-stack-sm leading-relaxed">
                Idioms add color and nuance to the English language. Mastering them transforms your speech from technically correct to naturally fluent, helping you sound more like a native speaker in both social and professional contexts.
              </p>
              <div className="w-full h-32 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-center mb-4 relative overflow-hidden group">
                <div 
                  className="absolute inset-0 bg-primary/10 transition-transform duration-700 group-hover:scale-105" 
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,70,53,0.05) 10px, rgba(0,70,53,0.05) 20px)' }}
                ></div>
                <span className="material-symbols-outlined text-5xl text-primary opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                  forum
                </span>
              </div>
              <button 
                onClick={() => navigate('/idioms')}
                className="font-label-sm text-label-sm text-primary uppercase tracking-wide hover:underline flex items-center gap-1 w-fit cursor-pointer font-bold"
              >
                View all 150+ idioms 
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DesktopLayout>
  );
}
