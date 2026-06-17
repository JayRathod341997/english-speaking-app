import type {
  ConversationDetail,
  ConversationSummary,
  DailyChallenge,
  EndSessionResponse,
  FlashcardDeck,
  GrammarChapter,
  GrammarChapterSummary,
  GrammarIndex,
  GrammarLevel,
  IdiomsLibrary,
  Progress,
  Scenario,
  SendMessageResponse,
  Session,
  SessionDetail,
  VocabCategoryDetail,
  VocabIndex,
} from '../types';

import { SCENARIOS } from '../data/scenarios';
import idiomsRaw from '../data/idioms.json';
import vocabRaw from '../data/vocabulary_index.json';
import conversationsRaw from '../data/conversations.json';
import flashcardsRaw from '../data/flashcards.json';
import grammarIndexRaw from '../data/grammar/index.json';

import { buildSystemPrompt, getAIResponse } from './groq';
import { addSession, read as readProgress } from '../hooks/useLocalProgress';
import {
  createSession,
  getSession,
  addUserMessage,
  addAiMessage,
  endSession,
} from './sessionStore';

// ── Scenarios ─────────────────────────────────────────────────────────────────

export const scenariosApi = {
  list: (): Promise<Scenario[]> =>
    Promise.resolve([...SCENARIOS].sort((a, b) =>
      a.category.localeCompare(b.category) || a.id - b.id,
    )),
  get: (id: number): Promise<Scenario | null> =>
    Promise.resolve(SCENARIOS.find(s => s.id === id) ?? null),
};

// ── Sessions (AI via Groq) ────────────────────────────────────────────────────

export const sessionsApi = {
  start: async (scenario_id: number, difficulty: string): Promise<Session> => {
    const scenario = SCENARIOS.find(s => s.id === scenario_id);
    if (!scenario) throw new Error(`Scenario ${scenario_id} not found`);
    return createSession(scenario_id, difficulty, scenario.example_opener);
  },

  sendMessage: async (session_id: string, content: string): Promise<SendMessageResponse> => {
    const detail = getSession(session_id);
    if (!detail) throw new Error(`Session ${session_id} not found`);
    const scenario = SCENARIOS.find(s => s.id === detail.scenario_id);
    if (!scenario) throw new Error(`Scenario not found`);

    const history = detail.messages.map(m => ({ role: m.role, content: m.content }));
    const systemPrompt = buildSystemPrompt(scenario.ai_role, scenario.user_role, detail.difficulty);
    const { reply, feedback } = await getAIResponse(systemPrompt, history, content, scenario.example_opener);

    addUserMessage(session_id, content);
    const messageId = addAiMessage(session_id, reply, feedback);

    return { ai_reply: reply, feedback, message_id: messageId };
  },

  get: (session_id: string): Promise<SessionDetail | null> =>
    Promise.resolve(getSession(session_id)),

  end: (session_id: string): Promise<EndSessionResponse> => {
    const result = endSession(session_id);
    addSession(
      {
        id: session_id,
        scenario_id: result.scenario_id,
        difficulty: result.difficulty,
        started_at: result.started_at,
        total_messages: result.total_messages,
        overall_score: result.overall_score,
      },
      result.duration_minutes,
    );
    return Promise.resolve(result);
  },
};

// ── Progress (localStorage) ───────────────────────────────────────────────────

export const progressApi = {
  get: (): Promise<Progress> => {
    const p = readProgress();
    const sessions = p.sessions ?? [];
    const totalSessions = sessions.length;
    const avgScore =
      totalSessions > 0
        ? Math.round((sessions.reduce((s, r) => s + r.overall_score, 0) / totalSessions) * 10) / 10
        : 0;
    const level =
      avgScore >= 85 && totalSessions >= 10
        ? 'advanced'
        : avgScore >= 80 && totalSessions >= 3
        ? 'intermediate'
        : 'beginner';
    const vocabCount = Object.values(p.vocab).filter(w => w.learned).length;
    const recent = sessions.slice(-10).reverse();

    return Promise.resolve({
      total_sessions: totalSessions,
      total_minutes: p.totalMinutes ?? 0,
      current_streak: p.streak,
      best_streak: p.bestStreak ?? 0,
      vocabulary_count: vocabCount,
      avg_score: avgScore,
      level,
      recent_sessions: recent.map(r => ({
        id: r.id,
        scenario_id: r.scenario_id,
        difficulty: r.difficulty,
        started_at: r.started_at,
        total_messages: r.total_messages,
        overall_score: r.overall_score,
      })),
    });
  },

  dailyChallenge: (): Promise<DailyChallenge> =>
    Promise.resolve({
      scenario_id: 1,
      prompt:
        'Introduce yourself to a new colleague at work. ' +
        'Tell them your name, your role, and one thing you enjoy about your job.',
      target_phrases: ['Nice to meet you', "I'm responsible for", 'I really enjoy'],
      date: new Date().toISOString().slice(0, 10),
    }),
};

// ── Idioms ────────────────────────────────────────────────────────────────────

const idiomsData = idiomsRaw as unknown as IdiomsLibrary;

export const idiomsApi = {
  list: (): Promise<IdiomsLibrary> => Promise.resolve(idiomsData),
};

// ── Vocabulary ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vocabData = vocabRaw as any;

export const vocabularyApi = {
  index: (): Promise<VocabIndex> =>
    Promise.resolve({
      title: vocabData.title,
      description: vocabData.description,
      language_pair: vocabData.language_pair,
      level: vocabData.level,
      total_categories: vocabData.total_categories,
      total_words: vocabData.total_words,
      category_summary: vocabData.category_summary,
    }),

  category: (id: number): Promise<VocabCategoryDetail> => {
    const cat = (vocabData.categories as VocabCategoryDetail[]).find(c => c.id === id);
    if (!cat) return Promise.reject(new Error(`Category ${id} not found`));
    return Promise.resolve(cat);
  },
};

// ── Conversations ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convoData = conversationsRaw as any[];

export const conversationsApi = {
  list: (): Promise<ConversationSummary[]> =>
    Promise.resolve(
      convoData.map(c => ({
        id: String(c.id),
        title: c.title,
        speakers: c.speakers,
        turn_count: c.turn_count,
      })),
    ),

  get: (id: string): Promise<ConversationDetail> => {
    const c = convoData.find(x => String(x.id) === id);
    if (!c) return Promise.reject(new Error(`Conversation ${id} not found`));
    return Promise.resolve({
      id: String(c.id),
      title: c.title,
      speakers: c.speakers,
      turn_count: c.turn_count,
      turns: c.turns,
    });
  },
};

// ── Flashcards ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const flashData = flashcardsRaw as any[];

export const flashcardsApi = {
  decks: (): Promise<FlashcardDeck[]> => {
    const byCategory = new Map<string, FlashcardDeck>();
    for (const card of flashData) {
      if (!byCategory.has(card.category)) {
        byCategory.set(card.category, { category: card.category, total: 0, cards: [] });
      }
      const deck = byCategory.get(card.category)!;
      deck.cards.push({
        id: card.id,
        category: card.category,
        front: card.frontside,
        back: card.backside,
        pronunciation: card.pronunciation,
        part_of_speech: card.part_of_speech,
        difficulty: card.difficulty,
        example: card.example,
        tags: card.tags,
      });
      deck.total += 1;
    }
    return Promise.resolve([...byCategory.values()]);
  },
};

// ── Grammar ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const grammarIndexData = grammarIndexRaw as any;

// Eagerly load all chapter files so the index can include explanation/practice counts.
const chapterModules = import.meta.glob('../data/grammar/chapters/*.json', { eager: true }) as Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { default: any }
>;

// Key each chapter by its own `slug` field. Filenames carry a numeric prefix
// (e.g. `01-parts-of-speech.json`, `11b-relative-adverbs.json`) that does not
// match the slug, so we map on the in-file slug rather than parsing the path.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chaptersBySlug = new Map<string, any>();
for (const mod of Object.values(chapterModules)) {
  const body = mod.default;
  if (body?.slug) chaptersBySlug.set(body.slug, body);
}

function grammarLevel(order: number): GrammarLevel {
  if (order <= 7) return 'Beginner';
  if (order <= 14) return 'Intermediate';
  return 'Advanced';
}

function chapterBySlug(slug: string) {
  return chaptersBySlug.get(slug);
}

export const grammarApi = {
  index: (): Promise<GrammarIndex> => {
    const chapters: GrammarChapterSummary[] = grammarIndexData.chapters
      .map((ch: { id: string; slug: string; order: number; title: unknown }) => {
        const body = chapterBySlug(ch.slug) ?? {};
        return {
          id: ch.id,
          slug: ch.slug,
          order: ch.order,
          title: ch.title,
          summary: body.summary,
          level: grammarLevel(ch.order),
          explanation_count: (body.explanations ?? []).length,
          practice_count: (body.practice ?? []).length,
        };
      })
      .sort((a: GrammarChapterSummary, b: GrammarChapterSummary) => a.order - b.order);

    return Promise.resolve({
      collection: grammarIndexData.collection,
      total_chapters: chapters.length,
      chapters,
    });
  },

  chapter: (slug: string): Promise<GrammarChapter> => {
    const body = chapterBySlug(slug);
    if (!body) return Promise.reject(new Error(`Grammar chapter '${slug}' not found`));
    return Promise.resolve(body as GrammarChapter);
  },
};
