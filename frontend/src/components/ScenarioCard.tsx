import type { Scenario } from '../types';

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

interface Props {
  scenario: Scenario;
  onClick: () => void;
}

export default function ScenarioCard({ scenario, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all text-left group w-full"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{scenario.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
              {scenario.title}
            </h3>
          </div>
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{scenario.description}</p>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${DIFFICULTY_COLORS[scenario.difficulty]}`}
            >
              {scenario.difficulty}
            </span>
            <span className="text-xs text-gray-400">~{scenario.estimated_minutes} min</span>
          </div>
        </div>
      </div>
    </button>
  );
}
