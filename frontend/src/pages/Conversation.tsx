import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { sessionsApi } from '../services/api';
import type { Message, Scenario, Session } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

function ThinkingDots() {
  return (
    <div className="flex justify-start mb-3 bubble-pop">
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
      <div className="min-h-[100dvh] flex items-center justify-center p-5"
        style={{ background: 'var(--paper)' }}>
        <div
          className="rounded-[24px] p-7 max-w-sm w-full text-center"
          style={{ background: 'var(--card)', boxShadow: '0 8px 32px var(--shadow)' }}
        >
          <div className="text-5xl mb-3">{scenario.icon}</div>
          <h1 className="font-serif text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>
            {scenario.title}
          </h1>
          <p className="text-sm mb-5" style={{ color: 'var(--ink-soft)' }}>{scenario.description}</p>

          <div className="rounded-[14px] p-4 mb-5 text-left"
            style={{ background: 'var(--teal-soft)', border: '1px solid #a9d2c8' }}>
            <p className="text-[11px] font-bold mb-0.5 uppercase tracking-wide" style={{ color: 'var(--teal)' }}>
              Your role
            </p>
            <p className="text-sm mb-2" style={{ color: 'var(--ink)' }}>{scenario.user_role}</p>
            <p className="text-[11px] font-bold mb-0.5 uppercase tracking-wide" style={{ color: 'var(--teal)' }}>
              AI plays
            </p>
            <p className="text-sm" style={{ color: 'var(--ink)' }}>{scenario.ai_role}</p>
          </div>

          {/* Opening line preview */}
          {scenario.example_opener && (
            <div className="rounded-[12px] p-3 mb-5 text-left"
              style={{ background: 'var(--paper-2)', border: '1px dashed var(--line)' }}>
              <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--ink-soft)' }}>
                They'll start with…
              </p>
              <p className="text-[13px] italic" style={{ color: 'var(--ink)' }}>"{scenario.example_opener}"</p>
            </div>
          )}

          <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>Select your level:</p>
          <div className="flex gap-2 justify-center mb-6">
            {(['beginner', 'intermediate', 'advanced'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
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

          <button
            onClick={startSession}
            className="w-full py-3.5 rounded-[14px] font-bold text-sm text-white transition-transform active:scale-[.98]"
            style={{ background: 'linear-gradient(135deg, var(--saffron), var(--saffron-deep))' }}
          >
            Start Conversation →
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full mt-3 text-sm py-2"
            style={{ color: 'var(--ink-soft)' }}
          >
            ← Back to scenarios
          </button>
        </div>
      </div>
    );
  }

  /* ── Active conversation ── */
  return (
    <div className="flex flex-col h-[100dvh]" style={{ background: 'var(--paper)' }}>
      {/* Conversation header */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ background: 'var(--card)', borderBottom: '1px solid var(--line)' }}
      >
        <button
          onClick={() => { cancelSpeech(); navigate('/'); }}
          className="text-2xl leading-none p-1"
          style={{ background: 'none', border: 'none', color: 'var(--ink)', cursor: 'pointer' }}
        >
          ‹
        </button>
        <div
          className="w-10 h-10 rounded-full grid place-items-center text-xl flex-shrink-0"
          style={{ background: 'var(--saffron-deep)' }}
        >
          {scenario.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight truncate" style={{ color: 'var(--ink)' }}>
            {scenario.ai_role.split(' ').slice(0, 4).join(' ')}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>
            {scenario.category} · {formatTime(elapsed)}
          </p>
        </div>
        <button
          onClick={handleEndSession}
          className="text-xs font-bold px-3 py-1.5 rounded-xl"
          style={{ background: 'var(--rose-soft)', color: 'var(--rose)', border: '1px solid #e8a8b4' }}
        >
          End
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4">
        {/* Scene card */}
        <div
          className="rounded-[13px] px-4 py-3 text-[12.5px] text-center mb-4 leading-relaxed"
          style={{ background: 'var(--paper-2)', border: '1px dashed var(--line)', color: 'var(--ink-soft)' }}
        >
          <strong style={{ color: 'var(--ink)' }}>📍 The scene:</strong> {scenario.description}
        </div>

        {messages.map(m => (
          <MessageRow key={m.id} message={m} onSpeak={speak} />
        ))}

        {interimText && (
          <div className="flex justify-end mb-3">
            <div
              className="max-w-[80%] px-4 py-3 rounded-[17px] rounded-br-[5px] text-sm italic"
              style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}
            >
              {interimText}…
            </div>
          </div>
        )}

        {isProcessing && <ThinkingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Mic dock */}
      <div
        className="flex-shrink-0 px-4 pt-3 pb-5"
        style={{ background: 'var(--card)', borderTop: '1px solid var(--line)' }}
      >
        {/* Live transcript */}
        <p className="text-center text-[12.5px] italic mb-2.5 min-h-[18px]" style={{ color: 'var(--ink-soft)' }}>
          {isListening ? 'Listening…' : isSpeaking ? 'AI is speaking…' : ''}
        </p>

        {/* Controls row */}
        <div className="flex items-center justify-center gap-4">
          {/* Type toggle */}
          <button
            onClick={() => {
              setShowType(v => !v);
              setTimeout(() => typeRef.current?.focus(), 80);
            }}
            className="w-12 h-12 rounded-full grid place-items-center text-lg transition-all"
            style={{ background: 'var(--paper)', border: '1.5px solid var(--line)' }}
            title="Type instead"
          >
            ⌨️
          </button>

          {/* Mic */}
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

          {/* Slow voice toggle */}
          <button
            onClick={() => {}}
            className="w-12 h-12 rounded-full grid place-items-center text-lg transition-all"
            style={{ background: 'var(--paper)', border: '1.5px solid var(--line)' }}
            title="Repeat last AI message"
          >
            🔊
          </button>
        </div>

        <p className="text-center text-[11px] mt-2" style={{ color: 'var(--ink-soft)' }}>
          {isListening ? 'Tap mic to stop' : 'Tap the mic and speak in English'}
        </p>

        {/* Type input */}
        {showType && (
          <div className="flex gap-2 mt-3">
            <input
              ref={typeRef}
              value={typeValue}
              onChange={e => setTypeValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendTyped()}
              placeholder="Type your reply in English…"
              className="flex-1 rounded-[12px] px-4 py-2.5 text-sm outline-none"
              style={{
                border: '1.5px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={sendTyped}
              className="px-4 py-2.5 rounded-[12px] text-sm font-bold text-white"
              style={{ background: 'var(--teal)' }}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Message row (bubble + optional feedback card) ── */
function MessageRow({ message, onSpeak }: { message: Message; onSpeak: (t: string) => void }) {
  const isUser = message.role === 'user';
  const fb     = message.feedback;

  return (
    <div className={`flex flex-col mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
      {/* Bubble */}
      <div
        className="bubble-pop max-w-[82%] px-4 py-3 rounded-[17px] text-sm leading-relaxed"
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
          className="mt-1 text-[11px] font-bold flex items-center gap-1"
          style={{ color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          🔊 Listen again
        </button>
      )}

      {/* Inline feedback for user messages */}
      {isUser && fb && (
        <div
          className="bubble-pop mt-2 max-w-[88%] rounded-[13px] p-3 text-[12.5px]"
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
