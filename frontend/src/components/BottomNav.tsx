import { useNavigate } from 'react-router-dom';
import { BookIcon, CardsIcon, ChatIcon, GrammarIcon, HomeIcon } from './Icon';

export type NavTab = 'home' | 'conversations' | 'idioms' | 'vocabulary' | 'grammar';

const TABS: { key: NavTab; label: string; path: string; Icon: typeof HomeIcon }[] = [
  { key: 'home',          label: 'Home',     path: '/',              Icon: HomeIcon },
  { key: 'conversations', label: 'Talk',     path: '/conversations', Icon: ChatIcon },
  { key: 'idioms',        label: 'Idioms',   path: '/idioms',        Icon: BookIcon },
  { key: 'vocabulary',    label: 'Words',    path: '/vocabulary',    Icon: CardsIcon },
  { key: 'grammar',       label: 'Grammar',  path: '/grammar',       Icon: GrammarIcon },
];

export default function BottomNav({ active }: { active?: NavTab | 'progress' }) {
  const navigate = useNavigate();
  return (
    <nav
      className="flex flex-shrink-0"
      style={{ borderTop: '1px solid var(--line)', background: 'var(--card)' }}
    >
      {TABS.map(({ key, label, path, Icon }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            onClick={() => !isActive && navigate(path)}
            className="flex-1 flex flex-col items-center gap-1 pt-2.5 pb-4 text-[10.5px] font-semibold transition-colors"
            style={{ color: isActive ? 'var(--saffron-deep)' : 'var(--ink-soft)' }}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
