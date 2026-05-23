import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { sessionsApi } from '../services/api';
import type { Message, Scenario, Session } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

function ThinkingDots() {
  return (
    <div className="flex justify-start mb-3 bubble-pop max-w-2xl mx-auto w-full">
      <div
        className="flex gap-1.5 px-4 py-3 rounded-[17px] rounded-bl-[5px]"
        style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
      >
        <span className="w-2 h-2 rounded-full dot-bounce" style={{ background: 'var(--ink-soft)' }} />
        <span className="w-2 h-2 rounded-full dot-bounce" style={{ background: 'var(--ink-soft)' }} />
        <span className="w-2 h-2 rounded-full dot-bounce" style={{ background: 'var(--ink-soft)' }} />
      </div>
    </div>
  );
}

export default function Conversation() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const location        = useLocation();
  const navigate        = useNavigate();
  const scenario        = location.state?.scenario as Scenario | undefined;

  const [session, setSession]         = useState<Session | null>(null);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [interimText, setInterimText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [difficulty, setDifficulty]   = useState<string>('beginner');
  const [started, setStarted]         = useState(false);
  const [elapsed, setElapsed]         = useState(0);
  const [showType, setShowType]       = useState(false);
  const [typeValue, setTypeValue]     = useState('');

  const bottomRef  = useRef<HTMLDivElement>(null);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const typeRef    = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<Session | null>(null);
  const processingRef = useRef(false);

  const { speak, cancel: cancelSpeech, isSpeaking } = useSpeechSynthesis();

  // keep refs in sync
  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { processingRef.current = isProcessing; }, [isProcessing]);

  const submitUserText = useCallback(async (text: string) => {
    const s = sessionRef.current;
    if (!s || processingRef.current || !text.trim()) return;

    setInterimText('');
    setIsProcessing(true);

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await sessionsApi.sendMessage(s.id, text.trim());
      const aiMsg: Message = {
        id: response.message_id,
        role: 'ai',
        content: response.ai_reply,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => {
        const updated = [...prev];
        const idx = updated.findLastIndex(m => m.role === 'user' && m.content === text.trim());
        if (idx !== -1) updated[idx] = { ...updated[idx], feedback: response.feedback };
        return [...updated, aiMsg];
      });
      speak(response.ai_reply);
    } catch (err) {
      console.error('[sendMessage]', err);
      const errMsg: Message = {
        id: Date.now(),
        role: 'ai',
        content: '⚠️ Sorry, I had trouble responding. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  }, [speak]);

  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
    onResult:  useCallback((t: string) => submitUserText(t), [submitUserText]),
    onInterim: useCallback((t: string) => setInterimText(t), []),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimText, isProcessing]);

  const startSession = async () => {
    if (!scenarioId) return;
    const s = await sessionsApi.start(Number(scenarioId), difficulty);
    setSession(s);
    setStarted(true);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    const detail = await sessionsApi.get(s.id);
    if (detail.messages.length > 0) {
      setMessages(detail.messages);
      speak(detail.messages[0].content);
    }
  };

  const handleEndSession = async () => {
    const s = sessionRef.current;
    if (!s) return;
    if (!window.confirm('End session and see your report?')) return;
    if (timerRef.current) clearInterval(timerRef.current);
    cancelSpeech();
    try {
      const result = await sessionsApi.end(s.id);
      navigate('/feedback', { state: { result, scenario, messages } });
    } catch {
      navigate('/');
    }
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleMicClick = () => {
    if (isProcessing || isSpeaking) return;
    cancelSpeech();
    if (isListening) stopListening(); else startListening();
  };

  const sendTyped = () => {
    const v = typeValue.trim();
    if (!v) return;
    setTypeValue('');
    submitUserText(v);
  };

  if (!scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
        <p style={{ color: 'var(--ink-soft)' }}>
          Scenario not found.{' '}
          <a href="/" style={{ color: 'var(--teal)' }}>Go home</a>
        </p>
      </div>
    );
  }

  /* ── Pre-session screen ── */
  if (!started) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-4 lg:p-8"
        style={{ background: 'var(--paper)' }}>
        <div
          className="rounded-[24px] p-6 lg:p-8 max-w-sm lg:max-w-3xl w-full text-center lg:text-left transition-all"
          style={{ background: 'var(--card)', boxShadow: '0 8px 32px var(--shadow)' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            
            {/* Left column: Overview & level selector */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="text-5xl mb-3 text-center lg:text-left">{scenario.icon}</div>
                <h1 className="font-serif text-xl lg:text-2xl font-bold mb-1 text-center lg:text-left" style={{ color: 'var(--ink)' }}>
                  {scenario.title}
                </h1>
                <p className="text-sm mb-5 text-center lg:text-left leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                  {scenario.description}
                </p>

                <div className="text-center lg:text-left mb-6">
                  <p className="text-xs mb-2 font-semibold" style={{ color: 'var(--ink-soft)' }}>Select your level:</p>
                  <div className="flex gap-2 justify-center lg:justify-start">
                    {(['beginner', 'intermediate', 'advanced'] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer hover:shadow-sm"
                        style={
                          difficulty === d
                            ? { background: 'var(--teal)', color: '#fff', border: '1.5px solid var(--teal)' }
                            : { background: 'var(--paper)', color: 'var(--ink-soft)', border: '1.5px solid var(--line)' }
                        }
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons (hidden on mobile, shown on desktop) */}
              <div className="hidden lg:flex flex-col gap-2">
                <button
                  onClick={startSession}
                  className="w-full py-3.5 rounded-[14px] font-bold text-sm text-white transition-transform active:scale-[.98] cursor-pointer shadow-sm hover:opacity-95"
                  style={{ background: 'linear-gradient(135deg, var(--saffron), var(--saffron-deep))' }}
                >
                  Start Conversation →
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full mt-1 text-sm py-2 cursor-pointer hover:underline text-center"
                  style={{ color: 'var(--ink-soft)' }}
                >
                  ← Back to scenarios
                </button>
              </div>
            </div>

            {/* Right column: Role cards & opener preview */}
            <div className="flex flex-col justify-between">
              <div className="space-y-4">
                <div className="rounded-[14px] p-4 text-left shadow-sm"
                  style={{ background: 'var(--teal-soft)', border: '1px solid #a9d2c8' }}>
                  <p className="text-[11px] font-bold mb-0.5 uppercase tracking-wide" style={{ color: 'var(--teal)' }}>
                    Your role
                  </p>
                  <p className="text-sm mb-3 font-semibold" style={{ color: 'var(--ink)' }}>{scenario.user_role}</p>
                  <p className="text-[11px] font-bold mb-0.5 uppercase tracking-wide" style={{ color: 'var(--teal)' }}>
                    AI plays
                  </p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{scenario.ai_role}</p>
                </div>

                {scenario.example_opener && (
                  <div className="rounded-[12px] p-4 text-left"
                    style={{ background: 'var(--paper-2)', border: '1px dashed var(--line)' }}>
                    <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--ink-soft)' }}>
                      They'll start with…
                    </p>
                    <p className="text-[13px] italic font-medium leading-relaxed" style={{ color: 'var(--ink)' }}>"{scenario.example_opener}"</p>
                  </div>
                )}
              </div>

              {/* Action buttons (shown on mobile, hidden on desktop) */}
              <div className="flex lg:hidden flex-col gap-2 mt-6">
                <button
                  onClick={startSession}
                  className="w-full py-3.5 rounded-[14px] font-bold text-sm text-white transition-transform active:scale-[.98] cursor-pointer shadow-sm"
                  style={{ background: 'linear-gradient(135deg, var(--saffron), var(--saffron-deep))' }}
                >
                  Start Conversation →
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full mt-2 text-sm py-2 cursor-pointer"
                  style={{ color: 'var(--ink-soft)' }}
                >
                  ← Back to scenarios
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Active conversation ── */
  return (
    <div className="flex h-[100dvh] overflow-hidden" style={{ background: 'var(--paper)' }}>
      
      {/* LEFT PANE: Scenario Overview (Desktop only) */}
      <aside className="hidden lg:flex flex-col w-[350px] border-r border-[var(--line)] bg-[var(--card)] p-6 overflow-y-auto flex-shrink-0 justify-between h-full">
        <div className="space-y-6">
          {/* Exit Link */}
          <button
            onClick={() => { cancelSpeech(); navigate('/'); }}
            className="flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer hover:underline text-left w-fit"
            style={{ color: 'var(--ink-soft)' }}
          >
            ← Exit Session
          </button>

          {/* Scenario Details */}
          <div className="space-y-3 pt-2">
            <div className="text-4xl">{scenario.icon}</div>
            <div>
              <h2 className="font-serif text-xl font-bold leading-tight" style={{ color: 'var(--ink)' }}>
                {scenario.title}
              </h2>
              <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded-[6px] bg-[var(--paper-2)]" style={{ color: 'var(--ink-soft)' }}>
                {scenario.category}
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
              📍 <strong>Scene context:</strong> {scenario.description}
            </p>
          </div>

          {/* Role Box */}
          <div className="rounded-[14px] p-4 text-xs space-y-2.5 shadow-sm"
            style={{ background: 'var(--teal-soft)', border: '1px solid #a9d2c8' }}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--teal)' }}>
                Your Role
              </p>
              <p className="font-medium" style={{ color: 'var(--ink)' }}>{scenario.user_role}</p>
            </div>
            <div className="pt-2" style={{ borderTop: '1px dashed #a9d2c8' }}>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--teal)' }}>
                AI Plays
              </p>
              <p className="font-medium" style={{ color: 'var(--ink)' }}>{scenario.ai_role}</p>
            </div>
          </div>
        </div>

        {/* Bottom clock & tips */}
        <div className="space-y-4 pt-4 border-t border-[var(--line)]">
          <div className="bg-[var(--paper)] rounded-xl p-3 text-center shadow-inner">
            <p className="text-[9.5px] font-bold uppercase tracking-widest" style={{ color: 'var(--ink-soft)' }}>Session Timer</p>
            <p className="font-mono text-2xl font-bold tracking-wider mt-0.5" style={{ color: 'var(--ink)' }}>
              ⏱️ {formatTime(elapsed)}
            </p>
          </div>

          <div className="text-[10px] space-y-1" style={{ color: 'var(--ink-soft)' }}>
            <p className="flex gap-1.5"><span>🗣️</span> Speak clearly at a comfortable pace.</p>
            <p className="flex gap-1.5"><span>👂</span> Wait for the AI speaker to finish speaking.</p>
          </div>
        </div>
      </aside>

      {/* RIGHT PANE: Chat Dialogue Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--paper)]">
        
        {/* Slim Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: 'var(--card)', borderBottom: '1px solid var(--line)' }}
        >
          <div className="flex items-center gap-3">
            {/* Back button (Mobile only) */}
            <button
              onClick={() => { cancelSpeech(); navigate('/'); }}
              className="text-2xl leading-none p-1 lg:hidden cursor-pointer"
              style={{ background: 'none', border: 'none', color: 'var(--ink)' }}
            >
              ‹
            </button>
            <div
              className="w-9 h-9 rounded-full grid place-items-center text-lg flex-shrink-0 lg:hidden"
              style={{ background: 'var(--saffron-deep)' }}
            >
              {scenario.icon}
            </div>
            <div>
              <p className="text-sm font-bold leading-tight" style={{ color: 'var(--ink)' }}>
                Speaking with {scenario.ai_role.split(' ').slice(0, 3).join(' ')}
              </p>
              <p className="text-[10.5px] lg:hidden" style={{ color: 'var(--ink-soft)' }}>
                ⏱️ {formatTime(elapsed)}
              </p>
              <span className="hidden lg:inline-block text-[10px] uppercase font-semibold text-[var(--teal)]" style={{ color: 'var(--teal)' }}>
                ● AI is active and listening
              </span>
            </div>
          </div>

          <button
            onClick={handleEndSession}
            className="text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer hover:bg-opacity-95 shadow-sm"
            style={{ background: 'var(--rose-soft)', color: 'var(--rose)', border: '1px solid #e8a8b4' }}
          >
            End Session & Report
          </button>
        </div>

        {/* Chat dialogue scroll layout */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 lg:py-6">
          {/* Mobile Scene Context (Hidden on desktop sidebar) */}
          <div
            className="rounded-[13px] px-4 py-3 text-[12.5px] text-center mb-4 leading-relaxed lg:hidden"
            style={{ background: 'var(--paper-2)', border: '1px dashed var(--line)', color: 'var(--ink-soft)' }}
          >
            <strong style={{ color: 'var(--ink)' }}>📍 The scene:</strong> {scenario.description}
          </div>

          {/* Centered Chat Bubbles Container */}
          <div className="max-w-2xl mx-auto w-full space-y-4 pb-2">
            {messages.map(m => (
              <MessageRow key={m.id} message={m} onSpeak={speak} />
            ))}

            {interimText && (
              <div className="flex justify-end mb-3">
                <div
                  className="max-w-[80%] px-4 py-3 rounded-[17px] rounded-br-[5px] text-sm italic shadow-sm"
                  style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}
                >
                  {interimText}…
                </div>
              </div>
            )}

            {isProcessing && <ThinkingDots />}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Mic Control Input Bar at bottom */}
        <div
          className="flex-shrink-0 px-4 pt-3.5 pb-6 border-t border-[var(--line)]"
          style={{ background: 'var(--card)' }}
        >
          <div className="max-w-2xl mx-auto w-full">
            {/* Live status label */}
            <p className="text-center text-[12.5px] italic mb-3 min-h-[18px] font-medium" style={{ color: 'var(--ink-soft)' }}>
              {isListening ? 'Listening…' : isSpeaking ? 'AI is speaking…' : ''}
            </p>

            {/* Button controls row */}
            <div className="flex items-center justify-center gap-4">
              {/* Type keyboard toggle */}
              <button
                onClick={() => {
                  setShowType(v => !v);
                  setTimeout(() => typeRef.current?.focus(), 80);
                }}
                className={`w-12 h-12 rounded-full grid place-items-center text-lg transition-all cursor-pointer hover:bg-gray-100 ${showType ? 'bg-[var(--paper-2)] border-[var(--ink-soft)]' : 'bg-[var(--paper)]'}`}
                style={{ border: '1.5px solid var(--line)' }}
                title="Type reply"
              >
                ⌨️
              </button>

              {/* Central Mic Button */}
              {isSupported ? (
                <button
                  onClick={handleMicClick}
                  disabled={isProcessing}
                  className={`w-[68px] h-[68px] rounded-full grid place-items-center border-none cursor-pointer transition-transform active:scale-[.93] ${isListening ? 'mic-pulse' : ''}`}
                  style={{
                    background: isListening
                      ? 'linear-gradient(135deg, var(--rose), #9c2f45)'
                      : isProcessing
                        ? 'var(--paper-2)'
                        : 'linear-gradient(135deg, var(--saffron), var(--saffron-deep))',
                    boxShadow: isListening ? 'none' : '0 8px 22px rgba(200,85,28,0.35)',
                    opacity: isProcessing ? 0.6 : 1,
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/>
                    <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21a1 1 0 1 0 2 0v-3.08A7 7 0 0 0 19 11z"/>
                  </svg>
                </button>
              ) : (
                <span className="text-xs text-center" style={{ color: 'var(--rose)' }}>
                  Voice not supported.<br/>Use Chrome / Edge.
                </span>
              )}

              {/* Repeat voice button */}
              <button
                onClick={() => {
                  const lastAiMsg = messages.findLast(m => m.role === 'ai');
                  if (lastAiMsg) speak(lastAiMsg.content);
                }}
                className="w-12 h-12 rounded-full grid place-items-center text-lg transition-all cursor-pointer hover:bg-gray-100 bg-[var(--paper)]"
                style={{ border: '1.5px solid var(--line)' }}
                title="Repeat last AI statement"
              >
                🔊
              </button>
            </div>

            {/* Central instructions label */}
            <p className="text-center text-[11px] mt-3 font-semibold" style={{ color: 'var(--ink-soft)' }}>
              {isListening ? 'Tap mic to stop and send' : 'Tap the mic and speak in English'}
            </p>

            {/* Type Input Box Panel */}
            {showType && (
              <div className="flex gap-2 mt-4 transition-all duration-200">
                <input
                  ref={typeRef}
                  value={typeValue}
                  onChange={e => setTypeValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendTyped()}
                  placeholder="Type your reply in English…"
                  className="flex-1 rounded-[12px] px-4 py-2.5 text-sm outline-none border hover:border-gray-400 focus:border-[var(--teal)]"
                  style={{
                    border: '1.5px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={sendTyped}
                  className="px-5 py-2.5 rounded-[12px] text-sm font-bold text-white cursor-pointer shadow-sm hover:opacity-90"
                  style={{ background: 'var(--teal)' }}
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Message row (bubble + optional feedback card) ── */
function MessageRow({ message, onSpeak }: { message: Message; onSpeak: (t: string) => void }) {
  const isUser = message.role === 'user';
  const fb     = message.feedback;

  return (
    <div className={`flex flex-col mb-4 max-w-2xl mx-auto w-full ${isUser ? 'items-end' : 'items-start'}`}>
      {/* Bubble */}
      <div
        className="bubble-pop max-w-[82%] px-4 py-3 rounded-[17px] text-sm leading-relaxed shadow-sm"
        style={
          isUser
            ? {
                background: 'linear-gradient(135deg, var(--saffron), var(--saffron-deep))',
                color: '#fff',
                borderBottomRightRadius: '5px',
              }
            : {
                background: 'var(--card)',
                color: 'var(--ink)',
                border: '1px solid var(--line)',
                borderBottomLeftRadius: '5px',
              }
        }
      >
        {message.content}
      </div>

      {/* AI "Listen again" */}
      {!isUser && (
        <button
          onClick={() => onSpeak(message.content)}
          className="mt-1 text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:underline"
          style={{ color: 'var(--teal)', background: 'none', border: 'none' }}
        >
          🔊 Listen again
        </button>
      )}

      {/* Inline feedback for user messages */}
      {isUser && fb && (
        <div
          className="bubble-pop mt-2 max-w-[88%] rounded-[13px] p-3 text-[12.5px] shadow-sm"
          style={
            fb.has_errors
              ? { background: 'var(--amber-soft)', border: '1px solid #ecd28a' }
              : { background: 'var(--teal-soft)', border: '1px solid #a9d2c8' }
          }
        >
          <p className="font-bold text-[12px] mb-1.5 flex items-center gap-1"
            style={{ color: fb.has_errors ? 'var(--saffron-deep)' : 'var(--teal)' }}>
            {fb.has_errors ? '💡 Small fix' : '✓ Well said!'}
          </p>

          {fb.has_errors && (
            <>
              {fb.issues.length > 0 && (
                <ul className="mb-1.5 space-y-0.5">
                  {fb.issues.map((issue, i) => (
                    <li key={i} className="text-[11.5px]" style={{ color: 'var(--ink)' }}>· {issue}</li>
                  ))}
                </ul>
              )}
              {fb.corrected && (
                <p className="text-[11.5px] mb-1" style={{ color: 'var(--ink)' }}>
                  ✓ <span style={{ color: 'var(--teal)', fontWeight: 700 }}>{fb.corrected}</span>
                </p>
              )}
              {fb.better_phrasing && (
                <p className="text-[11.5px] mb-1.5" style={{ color: 'var(--ink-soft)' }}>
                  More natural: <em>"{fb.better_phrasing}"</em>
                </p>
              )}
            </>
          )}

          {fb.gujarati_note && (
            <p
              className="font-guj text-[11.5px] pt-1.5 leading-relaxed"
              style={{
                color: 'var(--ink-soft)',
                borderTop: fb.has_errors ? '1px dashed #ddc380' : '1px dashed #a9d2c8',
                marginTop: fb.has_errors ? '6px' : '0',
              }}
            >
              {fb.gujarati_note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
