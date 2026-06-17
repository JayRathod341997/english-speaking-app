import type { Feedback } from '../types';

const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT_TEMPLATE = `You are {ai_role} in a real-life English conversation.
The user is a native Gujarati speaker who is learning English. Their current level is {level}.

Your TWO jobs:
1. Stay fully in character as {ai_role} and keep the conversation realistic and engaging.
2. After every user message, evaluate their English and give structured feedback.

Common mistakes Gujarati speakers make that you should watch for:
- Using continuous tense wrongly: "I am knowing" → should be "I know"
- Using "have" wrong: "He is having a car" → "He has a car"
- Missing articles: "I went to hospital" → "I went to the hospital"
- "Do the needful" → "Please take care of this"
- Literal Gujarati translations that sound unnatural in English

ALWAYS respond in this exact JSON format (no extra text, only JSON):
{
  "reply": "<your in-character response as {ai_role}>",
  "feedback": {
    "has_errors": true or false,
    "corrected": "<corrected version of exactly what the user said, or same if no errors>",
    "issues": ["<specific issue 1>", "<specific issue 2>"],
    "better_phrasing": "<a more natural, native-speaker way to say it>",
    "gujarati_note": "<brief helpful note in simple English or 1 Gujarati word if needed>",
    "score": <number 0 to 100>
  }
}

Scoring guide:
- 90-100: Near-perfect, natural English
- 70-89: Good with minor issues
- 50-69: Understood but noticeable errors
- 30-49: Many errors, hard to follow
- 0-29: Major communication breakdown

User's role in this scenario: {user_role}
`;

export function buildSystemPrompt(aiRole: string, userRole: string, level: string): string {
  return SYSTEM_PROMPT_TEMPLATE
    .replace(/\{ai_role\}/g, aiRole)
    .replace(/\{user_role\}/g, userRole)
    .replace(/\{level\}/g, level);
}

function parseAIResponse(raw: string): { reply: string; feedback: Feedback } {
  let text = raw.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  const parsed = JSON.parse(text);
  return {
    reply: parsed.reply,
    feedback: {
      has_errors: parsed.feedback.has_errors,
      corrected: parsed.feedback.corrected,
      issues: parsed.feedback.issues ?? [],
      better_phrasing: parsed.feedback.better_phrasing,
      gujarati_note: parsed.feedback.gujarati_note,
      score: Number(parsed.feedback.score),
    },
  };
}

export async function getAIResponse(
  systemPrompt: string,
  history: Array<{ role: 'user' | 'ai'; content: string }>,
  userMessage: string,
  exampleOpener: string,
): Promise<{ reply: string; feedback: Feedback }> {
  const openerJson = JSON.stringify({
    reply: exampleOpener,
    feedback: { has_errors: false, corrected: '', issues: [], better_phrasing: '', gujarati_note: '', score: 100 },
  });

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    { role: 'assistant', content: openerJson },
  ];

  let skipFirstAi = true;
  for (const msg of history) {
    if (skipFirstAi && msg.role === 'ai') {
      skipFirstAi = false;
      continue;
    }
    messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
  }
  messages.push({ role: 'user', content: userMessage });

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.7 }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return parseAIResponse(data.choices[0].message.content);
}
