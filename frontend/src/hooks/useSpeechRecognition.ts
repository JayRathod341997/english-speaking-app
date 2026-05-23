import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionOptions {
  onResult: (transcript: string) => void;
  onInterim?: (transcript: string) => void;
}

export function useSpeechRecognition({ onResult, onInterim }: SpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Use refs for callbacks so the SpeechRecognition object is only created once
  const onResultRef  = useRef(onResult);
  const onInterimRef = useRef(onInterim);
  useEffect(() => { onResultRef.current = onResult; });
  useEffect(() => { onInterimRef.current = onInterim; });

  // Accumulates all final transcript chunks across pauses while continuous=true
  const accumulatedRef    = useRef('');
  // Tracks how many final results we've already processed — prevents mobile
  // Chrome from re-processing finalized results when it internally restarts
  // recognition after a brief silence (event.resultIndex can reset to 0).
  const lastFinalCountRef = useRef(0);
  // Mirrors isListening state inside event handlers (closure-safe).
  const isListeningRef    = useRef(false);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    setIsSupported(true);
    const recognition = new SR();
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = 'en-IN';

    recognition.onresult = (event: any) => {
      let newFinalText    = '';
      let currentFinalCount = 0;
      let interim         = '';

      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          currentFinalCount++;
          if (currentFinalCount > lastFinalCountRef.current) {
            newFinalText += r[0].transcript + ' ';
          }
        } else {
          interim += r[0].transcript; // replace — only the latest interim matters
        }
      }

      lastFinalCountRef.current = currentFinalCount;
      accumulatedRef.current   += newFinalText;

      const preview = accumulatedRef.current + interim;
      if (preview) onInterimRef.current?.(preview);
    };

    recognition.onend = () => {
      // On mobile, the browser auto-stops recognition during natural pauses.
      // If the user hasn't tapped Stop, restart so they can keep speaking.
      if (isListeningRef.current) {
        try { recognition.start(); return; } catch { /* fall through to submit */ }
      }
      setIsListening(false);
      isListeningRef.current = false;
      const text = accumulatedRef.current.trim();
      if (text) onResultRef.current(text);
      accumulatedRef.current    = '';
      lastFinalCountRef.current = 0;
    };

    recognition.onerror = (event: any) => {
      // 'no-speech' / 'audio-capture' are non-fatal on mobile — let onend handle restart
      if (event.error === 'no-speech') return;
      setIsListening(false);
      isListeningRef.current    = false;
      accumulatedRef.current    = '';
      lastFinalCountRef.current = 0;
    };

    recognitionRef.current = recognition;

    return () => { recognitionRef.current?.abort(); };
  }, []); // runs once

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    accumulatedRef.current    = '';
    lastFinalCountRef.current = 0;
    isListeningRef.current    = true;
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
    // Clear the flag first so onend knows the user intended to stop
    isListeningRef.current = false;
    recognitionRef.current.stop();
  }, [isListening]);

  return { isListening, isSupported, startListening, stopListening };
}
