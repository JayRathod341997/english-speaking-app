import { useCallback, useEffect, useRef, useState } from 'react';

const SILENCE_TIMEOUT  = 1500; // ms of silence → auto-submit utterance
const INTERIM_SUPPRESS = 700;  // ms after restart to suppress interim (masks buffer replay)

interface SpeechRecognitionOptions {
  onResult:  (transcript: string) => void;
  onInterim?: (transcript: string) => void;
}

export function useSpeechRecognition({ onResult, onInterim }: SpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  const onResultRef  = useRef(onResult);
  const onInterimRef = useRef(onInterim);
  useEffect(() => { onResultRef.current  = onResult;  });
  useEffect(() => { onInterimRef.current = onInterim; });

  // Finals from CURRENT session only — reset to '' on every restart so
  // buffer-replayed interims from the new session don't overlap pending text.
  const sessionTextRef   = useRef('');
  // Finals from ALL completed sessions — grows on each onend flush.
  // Submitted to onResult when the silence timer fires.
  const pendingTextRef   = useRef('');
  // VAD silence timer handle.
  const silenceTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Date.now() timestamp: interim display is suppressed until this moment
  // (INTERIM_SUPPRESS ms post-restart) to hide buffer-replay flicker.
  const suppressUntilRef = useRef(0);
  // Closure-safe mirror of isListening state.
  const isListeningRef   = useRef(false);
  // True between recognition.start() call and the new session's first event —
  // prevents a second concurrent start() when Chrome fires onend twice.
  const isRestartingRef  = useRef(false);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current !== null) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const armSilenceTimer = () => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      const text = pendingTextRef.current.trim();
      pendingTextRef.current = '';
      sessionTextRef.current = '';
      if (text) onResultRef.current(text);
      onInterimRef.current?.('');
    }, SILENCE_TIMEOUT);
  };

  const fullReset = (submitPending: boolean) => {
    clearSilenceTimer();
    const text = (pendingTextRef.current + sessionTextRef.current).trim();
    pendingTextRef.current   = '';
    sessionTextRef.current   = '';
    suppressUntilRef.current = 0;
    isListeningRef.current   = false;
    isRestartingRef.current  = false;
    setIsListening(false);
    onInterimRef.current?.('');
    if (submitPending && text) onResultRef.current(text);
  };

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    setIsSupported(true);
    const recognition = new SR();
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = 'en-IN';

    recognition.onresult = (event: any) => {
      let newFinals = '';
      let interim   = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          newFinals += r[0].transcript + ' ';
        } else {
          interim += r[0].transcript;
        }
      }

      if (newFinals) {
        sessionTextRef.current += newFinals;
        armSilenceTimer(); // new speech detected — push back the submission deadline
      }

      const suppressed = Date.now() < suppressUntilRef.current;
      const preview = (
        pendingTextRef.current +
        sessionTextRef.current +
        (suppressed ? '' : interim)
      ).trimStart();

      onInterimRef.current?.(preview);
    };

    recognition.onend = () => {
      // Double-onend guard: Chrome mobile sometimes fires onend twice in quick
      // succession after a single stop. The second one is spurious — ignore it.
      if (isRestartingRef.current) return;

      if (isListeningRef.current) {
        // Flush this session's finals into the pending bucket.
        pendingTextRef.current += sessionTextRef.current;
        sessionTextRef.current  = '';

        // Re-arm VAD timer. If the user truly stopped, this will fire and submit.
        armSilenceTimer();

        // Restart immediately so we don't miss the next utterance.
        isRestartingRef.current  = true;
        suppressUntilRef.current = Date.now() + INTERIM_SUPPRESS;
        try {
          recognition.start();
        } catch {
          // start() failed (e.g. recognition still transitioning).
          // Don't restart — the silence timer will submit pending text.
          isRestartingRef.current  = false;
          suppressUntilRef.current = 0;
          return;
        }
        isRestartingRef.current = false;
        return;
      }
      // isListeningRef is false → user called stopListening(); fullReset already
      // handled submission. Nothing more to do.
    };

    recognition.onerror = (event: any) => {
      // no-speech is non-fatal on mobile — onend always follows and handles restart.
      if (event.error === 'no-speech') return;
      recognitionRef.current?.abort();
      fullReset(true);
    };

    recognitionRef.current = recognition;
    return () => { recognitionRef.current?.abort(); };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current) return;

    clearSilenceTimer();
    pendingTextRef.current   = '';
    sessionTextRef.current   = '';
    suppressUntilRef.current = Date.now() + INTERIM_SUPPRESS;
    isListeningRef.current   = true;
    isRestartingRef.current  = false;

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListeningRef.current) return;
    // Capture text before fullReset clears the refs.
    const text = (pendingTextRef.current + sessionTextRef.current).trim();
    fullReset(false);
    recognitionRef.current.stop();
    // Submit immediately — don't wait for the silence timer.
    if (text) onResultRef.current(text);
  }, []);

  return { isListening, isSupported, startListening, stopListening };
}
