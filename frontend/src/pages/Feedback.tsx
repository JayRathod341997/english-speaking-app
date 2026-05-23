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
    <div className="mt-2 lg:mt-0 flex flex-col flex-1">
      <p className="text-[11px] font-bold uppercase tracking-widest mb-2 lg:mb-3" style={{ color: 'var(--ink-soft)' }}>
        Conversation Transcript
      </p>
      <div
        className="rounded-[16px] p-3 space-y-3 overflow-y-auto max-h-[340px] lg:max-h-[460px] flex-1"
        style={{ background: 'var(--paper-2)' }}
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

  const ActionButtons = ({ className }: { className?: string }) => (
    <div className={`flex flex-col gap-2 ${className}`}>
      {scenario && (
        <button
          onClick={() => navigate(`/practice/${scenario.id}`, { state: { scenario } })}
          className="w-full py-3.5 rounded-[14px] font-bold text-sm text-white transition-transform active:scale-[.98] cursor-pointer shadow-sm"
          style={{ background: 'linear-gradient(135deg, var(--saffron), var(--saffron-deep))' }}
        >
          Try Again 🔄
        </button>
      )}
      <button
        onClick={() => navigate('/')}
        className="w-full py-3 rounded-[14px] font-semibold text-sm cursor-pointer border border-[var(--line)]"
        style={{ color: 'var(--ink-soft)', background: 'var(--paper)' }}
      >
        Choose New Scenario
      </button>
      <button
        onClick={() => navigate('/progress')}
        className="w-full py-2 text-sm font-semibold cursor-pointer"
        style={{ color: 'var(--teal)', background: 'none', border: 'none' }}
      >
        📈 View My Progress
      </button>
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 lg:p-8"
      style={{ background: 'var(--paper)' }}>
      <div
        className="rounded-[24px] p-5 md:p-7 max-w-sm lg:max-w-4xl w-full shadow-md transition-all"
        style={{ background: 'var(--card)', boxShadow: '0 8px 32px var(--shadow)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          
          {/* Left Column: Overall score + breakdown */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">{emoji}</div>
                <h1 className="font-serif text-xl font-bold mb-1" style={{ color: 'var(--ink)' }}>
                  Session Complete!
                </h1>
                {scenario && (
                  <p className="text-[12px] font-semibold" style={{ color: 'var(--ink-soft)' }}>{scenario.title}</p>
                )}
                <p className="text-sm mt-1" style={{ color: 'var(--ink)' }}>{text}</p>
                <p className="font-guj text-[12px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>{guj}</p>
              </div>

              {/* Overall score */}
              <div
                className="rounded-[16px] p-3 text-center mb-4"
                style={{ background: 'var(--teal-soft)', border: '1px solid #a9d2c8' }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--teal)' }}>
                  Overall Score
                </p>
                <p className="font-serif text-4xl font-extrabold leading-none my-1" style={{ color: 'var(--teal)' }}>
                  {Math.round(result.overall_score)}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--ink-soft)' }}>/100</p>
              </div>

              {/* Score breakdown */}
              <div className="space-y-2.5 mb-4">
                <ScoreBar label="📝 Grammar"    score={result.grammar_score}    color="var(--teal)" />
                <ScoreBar label="📖 Vocabulary" score={result.vocabulary_score} color="var(--saffron)" />
                <ScoreBar label="💬 Fluency"    score={result.fluency_score}    color="var(--amber)" />
                <ScoreBar label="💪 Confidence" score={result.confidence_score} color="var(--rose)" />
              </div>

              {/* Stats block */}
              <div
                className="flex justify-around rounded-[14px] py-2.5 text-center"
                style={{ background: 'var(--paper-2)' }}
              >
                <div>
                  <p className="font-serif text-lg font-bold" style={{ color: 'var(--ink)' }}>
                    {result.total_messages}
                  </p>
                  <p className="text-[10px] font-medium" style={{ color: 'var(--ink-soft)' }}>Exchanges</p>
                </div>
                <div>
                  <p className="font-serif text-lg font-bold" style={{ color: 'var(--ink)' }}>
                    {result.duration_minutes}m
                  </p>
                  <p className="text-[10px] font-medium" style={{ color: 'var(--ink-soft)' }}>Duration</p>
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <ActionButtons className="hidden lg:flex" />
          </div>

          {/* Right Column: Transcript (and mobile actions at bottom) */}
          <div className="flex flex-col justify-between">
            <TranscriptSection messages={messages} />
            
            {/* Mobile Actions */}
            <ActionButtons className="flex lg:hidden mt-5" />
          </div>

        </div>
      </div>
    </div>
  );
}
