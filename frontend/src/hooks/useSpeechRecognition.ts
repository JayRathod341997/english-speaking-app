import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionOptions {
  onResult: (transcript: string) => void;
  onInterim?: (transcript: string) => void;
  /**
   * Keep listening through pauses. Default `false`: mobile Chrome mishandles
   * continuous mode — it re-emits the same final result across events / silently
   * auto-restarts, which produced the "hello hello hello" duplication bug.
   */
  continuous?: boolean;
}

export function useSpeechRecognition({ onResult, onInterim, continuous = false }: SpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Use refs for callbacks/options so the SpeechRecognition object is only created once
  const onResultRef   = useRef(onResult);
  const onInterimRef  = useRef(onInterim);
  const continuousRef = useRef(continuous);
  useEffect(() => { onResultRef.current = onResult; });
  useEffect(() => { onInterimRef.current = onInterim; });
  useEffect(() => { continuousRef.current = continuous; });

  // Accumulates final transcript chunks for the current listening session
  const accumulatedRef = useRef('');
  // Highest final-result index already consumed — guards against mobile Chrome
  // re-emitting the same isFinal result and re-accumulating it.
  const processedIndexRef = useRef(0);
  // One-shot guard so an auto-restart-then-onend can't double-fire onResult.
  const submittedRef = useRef(false);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    setIsSupported(true);
    const recognition = new SR();
    recognition.continuous     = continuousRef.current; // default false — see options doc
    recognition.interimResults = true;
    recognition.lang           = 'en-IN'; // Indian English accent model

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          // Consume each final index at most once (mobile Chrome re-emits them).
          if (i < processedIndexRef.current) continue;
          processedIndexRef.current = i + 1;
          const chunk = r[0].transcript.trim();
          // Skip a chunk identical to the trailing one already accumulated,
          // which collapses literal "hello hello" repeats.
          const tail = accumulatedRef.current.trim().split(' ').slice(-chunk.split(' ').length).join(' ');
          if (chunk && chunk !== tail) accumulatedRef.current += chunk + ' ';
        } else {
          interim += r[0].transcript;
        }
      }
      // Show live preview: everything confirmed so far + what's being said now
      const preview = accumulatedRef.current + interim;
      if (preview) onInterimRef.current?.(preview);
    };

    // Submit the full accumulated transcript only when recognition ends
    // (with continuous=false this fires automatically after a pause).
    recognition.onend = () => {
      setIsListening(false);
      if (submittedRef.current) return; // guard against auto-restart double-fire
      submittedRef.current = true;
      const text = accumulatedRef.current.trim();
      if (text) onResultRef.current(text);
    };

    recognition.onerror = () => {
      setIsListening(false);
      accumulatedRef.current = '';
      processedIndexRef.current = 0;
      submittedRef.current = true; // suppress a trailing onend submit on error
    };

    recognitionRef.current = recognition;

    return () => { recognitionRef.current?.abort(); };
  }, []); // runs once

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    // Refuse to open the mic while TTS is playing — phones lack echo cancellation,
    // so the recognizer would transcribe the AI's own voice. Reads the global engine
    // directly, so it's correct regardless of which useSpeechSynthesis instance is speaking.
    const synth = window.speechSynthesis;
    if (synth && (synth.speaking || synth.pending)) return;
    // Reset session state at start (not in onend) to avoid races with a late auto-restart.
    accumulatedRef.current = '';
    processedIndexRef.current = 0;
    submittedRef.current = false;
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
