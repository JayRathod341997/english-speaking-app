import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionOptions {
  onResult: (transcript: string) => void;
  onInterim?: (transcript: string) => void;
}

export function useSpeechRecognition({ onResult, onInterim }: SpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  const onResultRef  = useRef(onResult);
  const onInterimRef = useRef(onInterim);
  useEffect(() => { onResultRef.current = onResult; });
  useEffect(() => { onInterimRef.current = onInterim; });

  const accumulatedRef = useRef('');
  // Mirrors isListening state inside event handlers (closure-safe).
  const isListeningRef = useRef(false);
  // Prevents double-submission when mobile Chrome fires onend twice in quick succession.
  const isRestartingRef = useRef(false);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    setIsSupported(true);
    const recognition = new SR();
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = 'en-IN';

    recognition.onresult = (event: any) => {
      let newFinalText = '';
      let interim      = '';

      // event.resultIndex points to the first NEW result in this event.
      // On mobile Chrome each auto-restart begins a fresh results array at index 0,
      // so using resultIndex (instead of counting from 0 every time) is the only
      // reliable way to avoid re-processing previously finalized words.
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          newFinalText += r[0].transcript + ' ';
        } else {
          interim += r[0].transcript;
        }
      }

      accumulatedRef.current += newFinalText;
      const preview = accumulatedRef.current + interim;
      if (preview) onInterimRef.current?.(preview);
    };

    recognition.onend = () => {
      // On mobile Chrome recognition auto-stops on each brief silence.
      // Guard with isRestartingRef so a rapid double-onend doesn't cause
      // two concurrent start() calls or a premature submission.
      if (isListeningRef.current && !isRestartingRef.current) {
        isRestartingRef.current = true;
        try {
          recognition.start();
          isRestartingRef.current = false;
          return;
        } catch {
          isRestartingRef.current = false;
          // start() failed — fall through and submit what we have
        }
      }

      if (isRestartingRef.current) return; // second onend during restart — ignore

      setIsListening(false);
      isListeningRef.current = false;
      const text = accumulatedRef.current.trim();
      accumulatedRef.current = '';
      if (text) onResultRef.current(text);
    };

    recognition.onerror = (event: any) => {
      // 'no-speech' is non-fatal on mobile — onend will handle restart
      if (event.error === 'no-speech') return;
      setIsListening(false);
      isListeningRef.current    = false;
      isRestartingRef.current   = false;
      accumulatedRef.current    = '';
    };

    recognitionRef.current = recognition;

    return () => { recognitionRef.current?.abort(); };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    accumulatedRef.current  = '';
    isListeningRef.current  = true;
    isRestartingRef.current = false;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    isListeningRef.current  = false;
    isRestartingRef.current = false;
    recognitionRef.current.stop();
  }, [isListening]);

  return { isListening, isSupported, startListening, stopListening };
}
