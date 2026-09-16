import type { LanguageEntry } from '../../types/user';

const PROFICIENCY_PERCENT: Record<string, number> = {
  Beginner: 15,
  Elementary: 30,
  Intermediate: 50,
  'Upper Intermediate': 70,
  Advanced: 85,
  Fluent: 100,
};

export default function LanguageOverview({
  native,
  learning,
}: {
  native: LanguageEntry[];
  learning: LanguageEntry[];
}) {
  if (native.length === 0 && learning.length === 0) {
    return (
      <p style={{ color: '#5A5A5A' }}>
        Add your languages during onboarding to see them here.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {native.map((l) => (
        <div
          key={`native-${l.language}`}
          className="rounded-2xl p-5"
          style={{ backgroundColor: 'var(--color-aqua)' }}
        >
          <p className="text-lg mb-1" style={{ fontFamily: 'var(--font-display)', color: '#111111' }}>
            {l.language}
          </p>
          <p className="text-xs mb-4" style={{ color: '#5A5A5A' }}>
            Native
          </p>
          <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-turquoise)' }} />
        </div>
      ))}

      {learning.map((l) => {
        const percent = l.proficiency ? PROFICIENCY_PERCENT[l.proficiency] ?? 20 : 20;
        return (
          <div
            key={`learning-${l.language}`}
            className="rounded-2xl p-5 border"
            style={{ borderColor: 'rgba(17,17,17,0.08)', backgroundColor: '#FFFFFF' }}
          >
            <p className="text-lg mb-1" style={{ fontFamily: 'var(--font-display)', color: '#111111' }}>
              {l.language}
            </p>
            <p className="text-xs mb-4" style={{ color: '#5A5A5A' }}>
              Learning{l.proficiency ? ` · ${l.proficiency}` : ''}
            </p>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(17,17,17,0.08)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${percent}%`, backgroundColor: 'var(--color-coral)' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
