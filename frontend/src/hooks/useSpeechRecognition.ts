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
  const accumulatedRef = useRef('');

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    setIsSupported(true);
    const recognition = new SR();
    recognition.continuous     = true;  // keep listening through natural pauses
    recognition.interimResults = true;
    recognition.lang           = 'en-IN'; // Indian English accent model

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) accumulatedRef.current += r[0].transcript + ' ';
        else           interim += r[0].transcript;
      }
      // Show live preview: everything confirmed so far + what's being said now
      const preview = accumulatedRef.current + interim;
      if (preview) onInterimRef.current?.(preview);
    };

    // Submit the full accumulated transcript only when recognition ends
    // (triggered by user tapping Stop, or browser timeout)
    recognition.onend = () => {
      setIsListening(false);
      const text = accumulatedRef.current.trim();
      if (text) onResultRef.current(text);
      accumulatedRef.current = '';
    };

    recognition.onerror = () => {
      setIsListening(false);
      accumulatedRef.current = '';
    };

    recognitionRef.current = recognition;

    return () => { recognitionRef.current?.abort(); };
  }, []); // runs once

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    accumulatedRef.current = '';
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    // stop() triggers onend which will submit accumulated transcript
    recognitionRef.current.stop();
  }, [isListening]);

  return { isListening, isSupported, startListening, stopListening };
}
