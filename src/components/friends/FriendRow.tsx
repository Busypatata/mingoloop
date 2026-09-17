import type { Friend } from '../../types/user';
import LanguageChip from '../discover/LanguageChip';
import FriendAvatar from './FriendAvatar';

interface FriendRowProps {
  friend: Friend;
  online: boolean;
  onMessage: (id: string) => void;
  onRemove?: (id: string) => void;
  showDivider?: boolean;
}

export default function FriendRow({ friend, online, onMessage, onRemove, showDivider = true }: FriendRowProps) {
  return (
    <div
      className="py-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5"
      style={showDivider ? { borderBottom: '1px solid rgba(20,40,50,0.07)' } : undefined}
    >
      <FriendAvatar name={friend.name} avatar={friend.avatar} size={60} online={online} showStatus />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="text-lg" style={{ fontFamily: 'var(--font-display)', color: '#111820' }}>
            {friend.name}
          </h3>
          {friend.username && (
            <span className="text-xs" style={{ color: 'var(--color-app-text-muted)', fontFamily: 'var(--font-body)' }}>
              @{friend.username}
            </span>
          )}
        </div>
        {friend.country && (
          <p className="flex items-center gap-1 text-xs mt-0.5" style={{ color: '#71818A', fontFamily: 'var(--font-body)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path
                d="M12 21s7-6.4 7-12a7 7 0 10-14 0c0 5.6 7 12 7 12Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            {friend.country}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {friend.nativeLanguages.map((l) => (
            <LanguageChip key={`n-${l.language}`} label={`${l.language} · native`} tone="coral" />
          ))}
          {friend.learningLanguages.map((l) => (
            <LanguageChip key={`l-${l.language}`} label={`${l.language} · learning`} tone="turquoise" />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-2.5 sm:pl-4 sm:shrink-0">
        <span className="flex items-center gap-1.5 text-xs whitespace-nowrap" style={{ fontFamily: 'var(--font-body)' }}>
          <span
            aria-hidden="true"
            className="rounded-full"
            style={{
              width: 6,
              height: 6,
              backgroundColor: online ? 'var(--color-turquoise)' : 'var(--color-app-text-muted)',
            }}
          />
          <span style={{ color: online ? 'color-mix(in srgb, var(--color-turquoise) 55%, #111820)' : 'var(--color-app-text-muted)' }}>
            {online ? 'Online now' : 'Offline'}
          </span>
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onMessage(friend.id)}
            className="friends-message-btn px-6 rounded-full text-sm whitespace-nowrap"
            style={{ backgroundColor: 'var(--color-coral)', color: '#ffffff', height: 38, fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            Message
          </button>

          {onRemove && (
            <button
              onClick={() => onRemove(friend.id)}
              className="text-xs whitespace-nowrap"
              style={{ color: 'var(--color-app-text-muted)', fontFamily: 'var(--font-body)' }}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
