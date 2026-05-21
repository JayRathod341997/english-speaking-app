import type { Feedback } from '../types';

interface Props {
  feedback: Feedback | null;
  userMessage?: string;
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500';
  return (
    <div className={`text-2xl font-bold ${color}`}>
      {Math.round(score)}
      <span className="text-sm font-normal text-gray-400">/100</span>
    </div>
  );
}

export default function FeedbackPanel({ feedback, userMessage }: Props) {
  if (!feedback) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm text-center p-4">
        <div>
          <div className="text-4xl mb-3">🎯</div>
          <p>Speak your first message to get feedback on your English.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700 text-sm">Your Feedback</h3>
        <ScoreRing score={feedback.score} />
      </div>

      {userMessage && (
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">You said:</p>
          <p className="text-sm text-gray-700 italic">"{userMessage}"</p>
        </div>
      )}

      {feedback.has_errors ? (
        <>
          {feedback.corrected && feedback.corrected !== userMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs text-green-600 font-medium mb-1">✅ Corrected version:</p>
              <p className="text-sm text-green-800">"{feedback.corrected}"</p>
            </div>
          )}

          {feedback.issues.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-600 font-medium mb-2">⚠️ Issues found:</p>
              <ul className="space-y-1">
                {feedback.issues.map((issue, i) => (
                  <li key={i} className="text-xs text-amber-800 flex gap-1">
                    <span>•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.better_phrasing && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-600 font-medium mb-1">💡 Native speaker would say:</p>
              <p className="text-sm text-blue-800 italic">"{feedback.better_phrasing}"</p>
            </div>
          )}

          {feedback.gujarati_note && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
              <p className="text-xs text-purple-600 font-medium mb-1">🇮🇳 Note:</p>
              <p className="text-sm text-purple-800">{feedback.gujarati_note}</p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl mb-1">🌟</p>
          <p className="text-sm text-green-700 font-medium">Excellent English!</p>
          <p className="text-xs text-green-600 mt-1">Keep it up — you're speaking naturally.</p>
        </div>
      )}
    </div>
  );
}
