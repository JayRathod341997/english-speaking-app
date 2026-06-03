import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  subtitle?: string;   // Gujarati subtitle
  back?: string;       // path to navigate back to (defaults to history back)
}

export default function PageHeader({ title, subtitle, back }: Props) {
  const navigate = useNavigate();
  return (
    <div
      className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0"
      style={{ background: 'var(--card)', borderBottom: '1px solid var(--line)' }}
    >
      <button
        onClick={() => (back ? navigate(back) : navigate(-1))}
        className="text-2xl leading-none p-1"
        style={{ background: 'none', border: 'none', color: 'var(--ink)', cursor: 'pointer' }}
        aria-label="Back"
      >
        ‹
      </button>
      <div>
        <h1 className="font-serif text-[18px] font-semibold" style={{ color: 'var(--ink)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] font-guj" style={{ color: 'var(--ink-soft)' }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
