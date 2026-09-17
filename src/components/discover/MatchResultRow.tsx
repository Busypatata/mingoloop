import type { DiscoverResult } from '../../types/user';
import LanguageChip from './LanguageChip';

interface MatchResultRowProps {
  person: DiscoverResult;
  connected: boolean;
  onConnect: (userId: string) => void;
}

export default function MatchResultRow({ person, connected, onConnect }: MatchResultRowProps) {
  return (
    <div
      className="py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b"
      style={{ borderColor: 'rgba(17,17,15,0.08)' }}
    >
      <div className="min-w-0">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h3 className="text-xl sm:text-2xl" style={{ fontFamily: 'var(--font-display)', color: '#11110f' }}>
            {person.name}
          </h3>
          {person.country && (
            <span className="text-sm" style={{ color: 'var(--color-app-text-muted)' }}>
              {person.country}
            </span>
          )}
        </div>

        {person.bio && (
          <p className="text-sm mt-1.5 max-w-md" style={{ color: 'var(--color-app-text-secondary)' }}>
            {person.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          {person.nativeLanguages.map((l) => (
            <LanguageChip key={`n-${l.language}`} label={`${l.language} · native`} tone="turquoise" />
          ))}
          {person.learningLanguages.map((l) => (
            <LanguageChip key={`l-${l.language}`} label={`${l.language} · learning`} tone="coral" />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-5 shrink-0 sm:pl-6">
        <span className="text-sm whitespace-nowrap" style={{ color: 'var(--color-muted-blue)', fontFamily: 'var(--font-body)' }}>
          {person.compatibility}% match
        </span>
        <button
          onClick={() => onConnect(person.id)}
          disabled={connected}
          className="discover-connect-btn px-6 py-2.5 rounded-full text-sm whitespace-nowrap disabled:cursor-default"
          style={
            connected
              ? { backgroundColor: 'var(--color-app-text-muted)', color: '#ffffff' }
              : { backgroundColor: 'var(--color-coral)', color: '#ffffff' }
          }
        >
          {connected ? 'Request sent' : 'Connect'}
        </button>
      </div>
    </div>
  );
}
