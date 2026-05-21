import { Mic, Square } from 'lucide-react';

interface Props {
  isListening: boolean;
  isSpeaking: boolean;
  disabled?: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function MicButton({ isListening, isSpeaking, disabled, onStart, onStop }: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={isListening ? onStop : onStart}
        disabled={disabled || isSpeaking}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg
          ${isListening
            ? 'bg-red-500 hover:bg-red-600 scale-110'
            : isSpeaking
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'
          }
          disabled:opacity-50`}
      >
        {isListening && (
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
        )}
        {isListening ? (
          <Square className="w-6 h-6 text-white fill-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </button>
      <span className="text-xs text-gray-500">
        {isSpeaking ? '🔊 AI is speaking...' : isListening ? 'Tap to stop' : 'Tap to speak'}
      </span>
    </div>
  );
}
