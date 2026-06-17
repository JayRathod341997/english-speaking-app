import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

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

  const onResultRef  = useRef(onResult);
  const onInterimRef = useRef(onInterim);
  useEffect(() => { onResultRef.current = onResult; });
  useEffect(() => { onInterimRef.current = onInterim; });

  const isNative = Capacitor.isNativePlatform();

  // ── Native path (Android / iOS via Capacitor plugin) ──────────────────────
  useEffect(() => {
    if (!isNative) return;
    SpeechRecognition.available().then(({ available }) => setIsSupported(available));
  }, [isNative]);

  const startNative = useCallback(async () => {
    if (isListening) return;
    try {
      const { speechRecognition } = await SpeechRecognition.checkPermissions();
      if (speechRecognition !== 'granted') {
        const result = await SpeechRecognition.requestPermissions();
        if (result.speechRecognition !== 'granted') return;
      }

      setIsListening(true);

      const listenerHandle = await SpeechRecognition.addListener('partialResults', (data: { matches: string[] }) => {
        if (data.matches?.length) onInterimRef.current?.(data.matches[0]);
      });

      const { matches } = await SpeechRecognition.start({
        language: 'en-IN',
        maxResults: 1,
        partialResults: true,
        popup: false,
      });

      listenerHandle.remove();
      setIsListening(false);
      if (matches?.[0]) onResultRef.current(matches[0]);
    } catch {
      setIsListening(false);
    }
  }, [isListening]);

  const stopNative = useCallback(async () => {
    if (!isListening) return;
    await SpeechRecognition.stop();
    setIsListening(false);
  }, [isListening]);

  // ── Web path (existing Web Speech API) ────────────────────────────────────
  const accumulatedRef    = useRef('');
  const processedIndexRef = useRef(0);
  const submittedRef      = useRef(false);
  const continuousRef     = useRef(continuous);
  useEffect(() => { continuousRef.current = continuous; });

  useEffect(() => {
    if (isNative) return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    setIsSupported(true);
    const recognition = new SR();
    recognition.continuous     = continuousRef.current;
    recognition.interimResults = true;
    recognition.lang           = 'en-IN';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          if (i < processedIndexRef.current) continue;
          processedIndexRef.current = i + 1;
          const chunk = r[0].transcript.trim();
          const tail = accumulatedRef.current.trim().split(' ').slice(-chunk.split(' ').length).join(' ');
          if (chunk && chunk !== tail) accumulatedRef.current += chunk + ' ';
        } else {
          interim += r[0].transcript;
        }
      }
      const preview = accumulatedRef.current + interim;
      if (preview) onInterimRef.current?.(preview);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (submittedRef.current) return;
      submittedRef.current = true;
      const text = accumulatedRef.current.trim();
      if (text) onResultRef.current(text);
    };

    recognition.onerror = () => {
      setIsListening(false);
      accumulatedRef.current = '';
      processedIndexRef.current = 0;
      submittedRef.current = true;
    };

    recognitionRef.current = recognition;
    return () => { recognitionRef.current?.abort(); };
  }, [isNative]);

  const startListening = useCallback(() => {
    if (isNative) { startNative(); return; }
    if (!recognitionRef.current || isListening) return;
    const synth = window.speechSynthesis;
    if (synth && (synth.speaking || synth.pending)) return;
    accumulatedRef.current = '';
    processedIndexRef.current = 0;
    submittedRef.current = false;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  }, [isListening, isNative, startNative]);

  const stopListening = useCallback(() => {
    if (isNative) { stopNative(); return; }
    if (!recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
  }, [isListening, isNative, stopNative]);

  return { isListening, isSupported, startListening, stopListening };
}
