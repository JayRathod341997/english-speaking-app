import { useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isNative = Capacitor.isNativePlatform();
  const isSupported = isNative || 'speechSynthesis' in window;

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!isSupported) return;

      if (isNative) {
        setIsSpeaking(true);
        TextToSpeech.speak({
          text,
          lang: 'en-US',
          rate: 0.9,
          pitch: 1.0,
          volume: 1.0,
          category: 'ambient',
        })
          .then(() => {
            setIsSpeaking(false);
            onEnd?.();
          })
          .catch(() => setIsSpeaking(false));
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang  = 'en-US';
      utterance.rate  = 0.9;
      utterance.pitch = 1;

      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
        voices.find(v => v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend   = () => { setIsSpeaking(false); onEnd?.(); };
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, isNative],
  );

  const cancel = useCallback(() => {
    if (isNative) {
      TextToSpeech.stop().catch(() => {});
    } else {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [isNative]);

  return { speak, cancel, isSpeaking, isSupported };
}
