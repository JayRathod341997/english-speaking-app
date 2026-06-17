import type { EndSessionResponse, Feedback, Session, SessionDetail } from '../types';

interface StoredMessage {
  id: number;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  feedback?: Feedback;
  score: number | null;
}

interface StoredSession {
  id: string;
  scenario_id: number;
  difficulty: string;
  started_at: string;
  ended_at: string | null;
  total_messages: number;
  overall_score: number | null;
  messages: StoredMessage[];
}

const sessions = new Map<string, StoredSession>();

export function createSession(scenarioId: number, difficulty: string, openingMessage: string): Session {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const session: StoredSession = {
    id,
    scenario_id: scenarioId,
    difficulty,
    started_at: now,
    ended_at: null,
    total_messages: 0,
    overall_score: null,
    messages: [
      { id: 1, role: 'ai', content: openingMessage, timestamp: now, score: null },
    ],
  };
  sessions.set(id, session);
  return {
    id,
    scenario_id: scenarioId,
    difficulty,
    started_at: now,
    total_messages: 0,
  };
}

export function getSession(sessionId: string): SessionDetail | null {
  const s = sessions.get(sessionId);
  if (!s) return null;
  return {
    id: s.id,
    scenario_id: s.scenario_id,
    difficulty: s.difficulty,
    started_at: s.started_at,
    ended_at: s.ended_at ?? undefined,
    total_messages: s.total_messages,
    overall_score: s.overall_score ?? undefined,
    messages: s.messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
      feedback: m.feedback,
    })),
  };
}

export function addUserMessage(sessionId: string, content: string): number {
  const s = sessions.get(sessionId);
  if (!s) throw new Error(`Session ${sessionId} not found`);
  const id = s.messages.length + 1;
  s.messages.push({ id, role: 'user', content, timestamp: new Date().toISOString(), score: null });
  s.total_messages += 1;
  return id;
}

export function addAiMessage(
  sessionId: string,
  content: string,
  feedback: Feedback,
): number {
  const s = sessions.get(sessionId);
  if (!s) throw new Error(`Session ${sessionId} not found`);
  const id = s.messages.length + 1;
  s.messages.push({ id, role: 'ai', content, timestamp: new Date().toISOString(), feedback, score: feedback.score });
  return id;
}

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export interface EndSessionResult extends EndSessionResponse {
  started_at: string;
  scenario_id: number;
  difficulty: string;
}

export function endSession(sessionId: string): EndSessionResult {
  const session = sessions.get(sessionId);
  if (!session) throw new Error(`Session ${sessionId} not found`);

  const scored = session.messages.filter(m => m.score !== null && m.role === 'ai');
  let scores: { overall: number; grammar: number; vocabulary: number; fluency: number; confidence: number };

  if (!scored.length) {
    scores = { overall: 0, grammar: 0, vocabulary: 0, fluency: 0, confidence: 0 };
  } else {
    const raw = scored.map(m => m.score as number);
    const msgCount = session.messages.length;
    const grammarScores    = raw.map(v => Math.min(v > 60 ? v + 5 : v - 5, 100));
    const vocabScores      = raw.map(v => Math.min(v > 50 ? v + 3 : v, 100));
    const fluencyScores    = raw;
    const confidenceScores = raw.map(v => Math.min(msgCount > 4 ? v + 10 : v, 100));
    scores = {
      overall:    Math.round(avg(raw) * 10) / 10,
      grammar:    Math.round(avg(grammarScores) * 10) / 10,
      vocabulary: Math.round(avg(vocabScores) * 10) / 10,
      fluency:    Math.round(avg(fluencyScores) * 10) / 10,
      confidence: Math.round(avg(confidenceScores) * 10) / 10,
    };
  }

  const now = new Date();
  const durationMinutes = Math.floor((now.getTime() - new Date(session.started_at).getTime()) / 60000);

  session.ended_at = now.toISOString();
  session.overall_score = scores.overall;

  return {
    overall_score: scores.overall,
    grammar_score: scores.grammar,
    vocabulary_score: scores.vocabulary,
    fluency_score: scores.fluency,
    confidence_score: scores.confidence,
    total_messages: session.total_messages,
    duration_minutes: durationMinutes,
    started_at: session.started_at,
    scenario_id: session.scenario_id,
    difficulty: session.difficulty,
  };
}
