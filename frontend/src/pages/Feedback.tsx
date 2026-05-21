import { useLocation, useNavigate } from 'react-router-dom';
import type { EndSessionResponse, Message, Scenario } from '../types';

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[12.5px] mb-1">
        <span style={{ color: 'var(--ink-soft)' }}>{label}</span>
        <span className="font-semibold" style={{ color: 'var(--ink)' }}>{Math.round(score)}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--paper-2)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

function getMessage(score: number) {
  if (score >= 85) return { emoji: '🌟', text: 'Excellent! You spoke like a native!', guj: 'અદ્ભુત! તમે ખૂબ સારી રીતે બોલ્યા.' };
  if (score >= 70) return { emoji: '👏', text: 'Great job! Keep practicing.', guj: 'બહુ સારું! પ્રૅક્ટિસ ચાલુ રાખો.' };
  if (score >= 55) return { emoji: '💪', text: 'Good effort! Use the feedback to improve.', guj: 'સારો પ્રયત્ન! ફીડબૅક જોઈ સુધારો.' };
  return { emoji: '📚', text: 'Keep going — every conversation helps!', guj: 'મહેનત કરો — દરેક વાત મદદ કરે.' };
}

function TranscriptSection({ messages }: { messages: Message[] }) {
  if (!messages || messages.length === 0) return null;

  return (
    <div className="mt-5">
      <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--ink-soft)' }}>
        Conversation Transcript
      </p>
      <div
        className="rounded-[16px] p-3 space-y-3 overflow-y-auto"
        style={{ background: 'var(--paper-2)', maxHeight: '360px' }}
      >
        {messages.map(m => {
          const isUser = m.role === 'user';
          const fb = m.feedback;
          return (
            <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              {/* Bubble */}
              <div
                className="max-w-[85%] px-3 py-2 rounded-[14px] text-[12.5px] leading-relaxed"
                style={
                  isUser
                    ? {
                        background: 'linear-gradient(135deg, var(--saffron), var(--saffron-deep))',
                        color: '#fff',
                        borderBottomRightRadius: '4px',
                      }
                    : {
                        background: 'var(--card)',
                        color: 'var(--ink)',
                        border: '1px solid var(--line)',
                        borderBottomLeftRadius: '4px',
                      }
                }
              >
                {m.content}
              </div>

              {/* Inline feedback for user messages */}
              {isUser && fb && (
                <div
                  className="mt-1.5 max-w-[90%] rounded-[11px] p-2.5 text-[11.5px]"
                  style={
                    fb.has_errors
                      ? { background: 'var(--amber-soft)', border: '1px solid #ecd28a' }
                      : { background: 'var(--teal-soft)', border: '1px solid #a9d2c8' }
                  }
                >
                  <p className="font-bold text-[11px] mb-1 flex items-center gap-1"
                    style={{ color: fb.has_errors ? 'var(--saffron-deep)' : 'var(--teal)' }}>
                    {fb.has_errors ? '💡 Small fix' : '✓ Well said!'}
                  </p>

                  {fb.has_errors && (
                    <>
                      {fb.issues.length > 0 && (
                        <ul className="mb-1 space-y-0.5">
                          {fb.issues.map((issue, i) => (
                            <li key={i} className="text-[11px]" style={{ color: 'var(--ink)' }}>· {issue}</li>
                          ))}
                        </ul>
                      )}
                      {fb.corrected && (
                        <p className="text-[11px] mb-0.5" style={{ color: 'var(--ink)' }}>
                          ✓ <span style={{ color: 'var(--teal)', fontWeight: 700 }}>{fb.corrected}</span>
                        </p>
                      )}
                      {fb.better_phrasing && (
                        <p className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>
                          More natural: <em>"{fb.better_phrasing}"</em>
                        </p>
                      )}
                    </>
                  )}

                  {fb.gujarati_note && (
                    <p
                      className="font-guj text-[11px] pt-1 leading-relaxed"
                      style={{
                        color: 'var(--ink-soft)',
                        borderTop: fb.has_errors ? '1px dashed #ddc380' : '1px dashed #a9d2c8',
                        marginTop: '4px',
                      }}
                    >
                      {fb.gujarati_note}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Feedback() {
  const location = useLocation();
  const navigate = useNavigate();
  const result   = location.state?.result as EndSessionResponse | undefined;
  const scenario = location.state?.scenario as Scenario | undefined;
  const messages = (location.state?.messages ?? []) as Message[];

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
        <p style={{ color: 'var(--ink-soft)' }}>
          No session data.{' '}
          <a href="/" style={{ color: 'var(--teal)' }}>Go home</a>
        </p>
      </div>
    );
  }

  const { emoji, text, guj } = getMessage(result.overall_score);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-5"
      style={{ background: 'var(--paper)' }}>
      <div
        className="rounded-[24px] p-7 max-w-sm w-full"
        style={{ background: 'var(--card)', boxShadow: '0 8px 32px var(--shadow)' }}
      >
        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">{emoji}</div>
          <h1 className="font-serif text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>
            Session Complete!
          </h1>
          {scenario && (
            <p className="text-[12px] mb-1" style={{ color: 'var(--ink-soft)' }}>{scenario.title}</p>
          )}
          <p className="text-sm" style={{ color: 'var(--ink)' }}>{text}</p>
          <p className="font-guj text-[12px] mt-1" style={{ color: 'var(--ink-soft)' }}>{guj}</p>
        </div>

        {/* Overall score */}
        <div
          className="rounded-[16px] p-4 text-center mb-5"
          style={{ background: 'var(--teal-soft)', border: '1px solid #a9d2c8' }}
        >
          <p className="text-[10.5px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--teal)' }}>
            Overall Score
          </p>
          <p className="font-serif text-4xl font-semibold" style={{ color: 'var(--teal)' }}>
            {Math.round(result.overall_score)}
          </p>
          <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>/100</p>
        </div>

        {/* Score breakdown */}
        <div className="space-y-3 mb-5">
          <ScoreBar label="📝 Grammar"    score={result.grammar_score}    color="var(--teal)" />
          <ScoreBar label="📖 Vocabulary" score={result.vocabulary_score} color="var(--saffron)" />
          <ScoreBar label="💬 Fluency"    score={result.fluency_score}    color="var(--amber)" />
          <ScoreBar label="💪 Confidence" score={result.confidence_score} color="var(--rose)" />
        </div>

        {/* Stats */}
        <div
          className="flex justify-around rounded-[14px] py-4 mb-5 text-center"
          style={{ background: 'var(--paper-2)' }}
        >
          <div>
            <p className="font-serif text-xl font-semibold" style={{ color: 'var(--ink)' }}>
              {result.total_messages}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>Exchanges</p>
          </div>
          <div>
            <p className="font-serif text-xl font-semibold" style={{ color: 'var(--ink)' }}>
              {result.duration_minutes}m
            </p>
            <p className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>Duration</p>
          </div>
        </div>

        {/* Full conversation transcript with per-message error feedback */}
        <TranscriptSection messages={messages} />

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-5">
          {scenario && (
            <button
              onClick={() => navigate(`/practice/${scenario.id}`, { state: { scenario } })}
              className="w-full py-3.5 rounded-[14px] font-bold text-sm text-white transition-transform active:scale-[.98]"
              style={{ background: 'linear-gradient(135deg, var(--saffron), var(--saffron-deep))' }}
            >
              Try Again 🔄
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-[14px] font-semibold text-sm"
            style={{ border: '1.5px solid var(--line)', color: 'var(--ink-soft)', background: 'var(--paper)' }}
          >
            Choose New Scenario
          </button>
          <button
            onClick={() => navigate('/progress')}
            className="w-full py-2 text-sm font-semibold"
            style={{ color: 'var(--teal)', background: 'none', border: 'none' }}
          >
            📈 View My Progress
          </button>
        </div>
      </div>
    </div>
  );
}
