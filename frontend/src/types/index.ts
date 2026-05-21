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
