import { useState } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { CheckIcon, MicIcon, SpeakerIcon, StopIcon, XIcon } from './Icon';

interface Props {
  /** The phrase to hear / pronounce. */
  target: string;
  /** Compact mode renders smaller buttons (for cards/dialogue turns). */
  size?: 'sm' | 'md';
  /** Hide the result line (caller renders its own feedback). */
  hideResult?: boolean;
  onResult?: (match: boolean, heard: string) => void;
  /** Hide the microphone button (useful for grammar/reading-only components). */
  hideMic?: boolean;
}

/** Normalize for comparison: lowercase, strip punctuation, collapse whitespace. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** True if the heard transcript contains the target phrase (forgiving of extra words). */
function isMatch(target: string, heard: string): boolean {
  const t = normalize(target);
  const h = normalize(heard);
  if (!t || !h) return false;
  return h === t || h.includes(t) || t.includes(h);
}

export default function PronounceButton({ target, size = 'md', hideResult, onResult, hideMic }: Props) {
  const [heard, setHeard] = useState<string | null>(null);
  const [match, setMatch] = useState<boolean | null>(null);
  const { speak, isSpeaking } = useSpeechSynthesis();
  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
    onResult: (transcript) => {
      const ok = isMatch(target, transcript);
      setHeard(transcript);
      setMatch(ok);
      onResult?.(ok, transcript);
    },
  });

  const btn = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  const icon = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        {/* Hear it */}
        <button
          type="button"
          onClick={() => speak(target)}
          disabled={isSpeaking}
          aria-label="Listen"
          className={`${btn} rounded-full grid place-items-center transition-transform active:scale-90 disabled:opacity-50`}
          style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}
        >
          <SpeakerIcon className={icon} />
        </button>

        {/* Say it */}
        {isSupported && !hideMic ? (
          <button
            type="button"
            disabled={isSpeaking}
            onClick={() => {
              if (isSpeaking) return; // don't open the mic while TTS is playing
              if (isListening) { stopListening(); return; }
              setHeard(null); setMatch(null);
              startListening();
            }}
            aria-label={isListening ? 'Stop' : 'Speak'}
            className={`${btn} rounded-full grid place-items-center text-white transition-transform active:scale-90 disabled:opacity-50 ${isListening ? 'mic-pulse' : ''}`}
            style={{
              background: isListening
                ? 'linear-gradient(140deg, var(--rose), #9e2f45)'
                : 'linear-gradient(140deg, var(--saffron), var(--saffron-deep))',
            }}
          >
            {isListening ? <StopIcon className={icon} /> : <MicIcon className={icon} />}
          </button>
        ) : null}

        {isListening && (
          <span className="text-xs font-medium" style={{ color: 'var(--rose)' }}>
            Listening…
          </span>
        )}
      </div>

      {!hideResult && match !== null && (
        <div
          className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-2.5 py-1.5"
          style={
            match
              ? { background: 'var(--teal-soft)', color: 'var(--teal)' }
              : { background: 'var(--rose-soft)', color: 'var(--rose)' }
          }
        >
          {match ? <CheckIcon className="w-4 h-4" /> : <XIcon className="w-4 h-4" />}
          {match ? 'Great pronunciation!' : `Heard: "${heard}" — try again`}
        </div>
      )}
    </div>
  );
}
