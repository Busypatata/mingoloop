import { PROFICIENCY_PERCENT } from './LanguageOverview';
import type { LanguageEntry } from '../../types/user';

interface LanguageProgressCardProps {
  entry: LanguageEntry;
  variant: 'native' | 'learning';
}

export default function LanguageProgressCard({ entry, variant }: LanguageProgressCardProps) {
  const isNative = variant === 'native';
  const percent = isNative ? 95 : entry.proficiency ? PROFICIENCY_PERCENT[entry.proficiency] ?? 20 : 20;

  return (
    <div
      className="flex items-center gap-3.5 px-5 py-4 w-full sm:w-[300px]"
      style={{
        borderRadius: 22,
        backgroundColor: isNative ? '#DDF4F4' : '#ffffff',
        border: isNative ? 'none' : '1px solid rgba(18,63,75,0.08)',
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: isNative ? 'rgba(255,255,255,0.6)' : '#FFF0F0',
        }}
        aria-hidden="true"
      >
        {isNative ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3c3 4 3 14 0 18M12 3c-3 4-3 14 0 18M4 9h16M4 15h16"
              stroke="var(--color-turquoise)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="9" stroke="var(--color-turquoise)" strokeWidth="1.6" />
          </svg>
        ) : (
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-coral)' }}>
            {entry.language.slice(0, 1)}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-base" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: '#123F4B' }}>
          {entry.language}
        </p>
        <p className="text-xs mb-2" style={{ color: '#617481', fontFamily: 'var(--font-body)' }}>
          {isNative ? 'Native' : `Learning${entry.proficiency ? ` · ${entry.proficiency}` : ''}`}
        </p>
        <div
          className="rounded-full overflow-hidden"
          style={{ height: 8, backgroundColor: isNative ? 'rgba(255,255,255,0.7)' : 'rgba(18,63,75,0.08)' }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${percent}%`, backgroundColor: isNative ? 'var(--color-turquoise)' : 'var(--color-coral)' }}
          />
        </div>
      </div>
    </div>
  );
}
