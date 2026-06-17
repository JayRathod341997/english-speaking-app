export interface Scenario {
  id: number;
  category: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  ai_role: string;
  user_role: string;
  example_opener: string;
  icon: string;
  estimated_minutes: number;
}

export interface Feedback {
  has_errors: boolean;
  corrected: string;
  issues: string[];
  better_phrasing: string;
  gujarati_note: string;
  score: number;
}

export interface Message {
  id: number;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  feedback?: Feedback;
}

export interface Session {
  id: string;
  scenario_id: number;
  difficulty: string;
  started_at: string;
  total_messages: number;
  overall_score?: number;
}

export interface SessionDetail extends Session {
  messages: Message[];
  ended_at?: string;
}

export interface SendMessageResponse {
  ai_reply: string;
  feedback: Feedback;
  message_id: number;
}

export interface EndSessionResponse {
  overall_score: number;
  grammar_score: number;
  vocabulary_score: number;
  fluency_score: number;
  confidence_score: number;
  total_messages: number;
  duration_minutes: number;
}

export interface Progress {
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  best_streak: number;
  vocabulary_count: number;
  avg_score: number;
  level: string;
  recent_sessions: Session[];
}

export interface DailyChallenge {
  scenario_id: number;
  prompt: string;
  target_phrases: string[];
  date: string;
}

// ── Idioms ────────────────────────────────────────────────────────────────
export interface Idiom {
  id: number;
  idiom: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  english_meaning: string;
  gujarati_meaning: string;
  examples: string[];
}

export interface IdiomsLibrary {
  title?: string;
  description?: string;
  total_idioms: number;
  categories: string[];
  difficulty_levels: string[];
  category_counts: Record<string, number>;
  difficulty_counts: Record<string, number>;
  idioms: Idiom[];
}

// ── Vocabulary ──────────────────────────────────────────────────────────────
export interface VocabWord {
  id: number;
  word: string;
  category: string;
  subcategory: string;
  part_of_speech: string;
  difficulty: string;
  frequency?: string;
  gujarati_pronunciation: string;
  english_meaning: string;
  gujarati_meaning: string;
  synonyms?: string[];
  antonyms?: string[];
  collocations?: string[];
  word_forms?: string[];
  usage_note?: string;
  memory_tip?: string;
  examples: string[];
}

export interface DialogueTurn {
  speaker: string;
  text: string;
}

export interface MiniDialogue {
  id: number;
  title: string;
  situation: string;
  turns: DialogueTurn[];
  words_used: string[];
}

export interface QuizQuestion {
  id: number;
  type: string;
  word_id: number;
  question: string;
  options: string[];
  answer: string;
}

export interface Quiz {
  title: string;
  category: string;
  level: string;
  instructions: string;
  total_questions: number;
  questions: QuizQuestion[];
}

export interface VocabCategorySummary {
  id: number;
  category: string;
  total_words: number;
  subcategories?: number;
}

export interface VocabIndex {
  title?: string;
  description?: string;
  language_pair?: string;
  level?: string;
  total_categories?: number;
  total_words?: number;
  category_summary: VocabCategorySummary[];
}

export interface VocabCategoryDetail {
  id: number;
  category: string;
  level: string;
  total_words: number;
  subcategories: string[];
  words: VocabWord[];
  mini_dialogues: MiniDialogue[];
  quiz: Quiz;
}

// ── Conversations (scripted dialogues) ──────────────────────────────────────
export interface ConversationTurn {
  order: number;
  speaker: string;
  text: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  speakers: string[];
  turn_count: number;
}

export interface ConversationDetail extends ConversationSummary {
  turns: ConversationTurn[];
}

// ── Flashcards ──────────────────────────────────────────────────────────────
export interface Flashcard {
  id: number;
  category: string;
  front: string;
  back: string;
  pronunciation: string;
  part_of_speech: string;
  difficulty: string;
  example: string;
  tags: string[];
}

export interface FlashcardDeck {
  category: string;
  total: number;
  cards: Flashcard[];
}

// ── Grammar ──────────────────────────────────────────────────────────────
export type GrammarLevel = 'Beginner' | 'Intermediate' | 'Advanced';

/** Bilingual text node. `gu` may be machine-translated (guMT). */
export interface GrammarT {
  en: string;
  gu: string;
  guMT?: boolean;
}

// Explanation blocks — discriminated on `block`.
export interface ProseBlock {
  block: 'prose';
  id?: string;
  text: GrammarT;
}
export interface RuleItem {
  text: GrammarT;
  examples?: GrammarT[];
}
export interface RulesBlock {
  block: 'rules';
  id?: string;
  title: GrammarT;
  items: RuleItem[];
}
export interface ExamplesBlock {
  block: 'examples';
  id?: string;
  items: GrammarT[];
}
export interface TableHeader {
  key: string;
  label: GrammarT;
}
export interface TableBlock {
  block: 'table';
  id?: string;
  caption: GrammarT;
  headers: TableHeader[];
  rows: Record<string, string>[];
}
export type ExplanationBlock = ProseBlock | RulesBlock | ExamplesBlock | TableBlock;

// Practice items — discriminated on `type`.
export interface McqOption {
  id: string;
  text: GrammarT;
}
export interface McqItem {
  id: string;
  type: 'mcq';
  prompt: GrammarT;
  options: McqOption[];
  answer: string; // references an option id
  solution?: GrammarT;
}
export interface FillBlankItem {
  id: string;
  type: 'fill_blank';
  prompt: GrammarT; // contains the literal "____"
  options?: GrammarT[]; // optional word-bank
  answer: GrammarT;
  hint?: GrammarT;
}
export interface TranslationItem {
  id: string;
  type: 'translation';
  direction: 'en_to_gu' | 'gu_to_en';
  prompt: GrammarT;
  answer: GrammarT;
}
export interface TransformationItem {
  id: string;
  type: 'transformation';
  transform: string; // voice | speech | degrees_of_comparison | ...
  given: string;
  ask: string;
  forms: Record<string, GrammarT>;
  answer: GrammarT;
  solution?: GrammarT;
}
export type PracticeItem =
  | McqItem
  | FillBlankItem
  | TranslationItem
  | TransformationItem;

export interface GrammarSource {
  id: string;
  title: string;
  pages: number;
}
export interface GrammarCollection {
  id: string;
  title: GrammarT;
  languages: string[];
  sources: GrammarSource[];
}
export interface GrammarChapterSummary {
  id: string;
  slug: string;
  order: number;
  title: GrammarT;
  summary?: GrammarT;
  level: GrammarLevel;
  explanation_count: number;
  practice_count: number;
}
export interface GrammarIndex {
  collection: GrammarCollection;
  total_chapters: number;
  chapters: GrammarChapterSummary[];
}
export interface GrammarChapter {
  id: string;
  slug: string;
  order: number;
  title: GrammarT;
  summary: GrammarT;
  sources: string[];
  explanations: ExplanationBlock[];
  practice: PracticeItem[];
}
