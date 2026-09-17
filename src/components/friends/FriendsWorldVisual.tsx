import type { Friend } from '../../types/user';
import FriendAvatar from './FriendAvatar';

interface FriendsWorldVisualProps {
  friends: Friend[];
}

const LABELS = [
  { text: '日本語', top: 6, left: 40 },
  { text: '한국어', top: 18, left: 82 },
  { text: 'Español', top: 74, left: 2 },
  { text: 'Français', top: 32, left: 90 },
  { text: '中文', top: 82, left: 68 },
];

export default function FriendsWorldVisual({ friends }: FriendsWorldVisualProps) {
  // Real friends only — purely decorative placement, never fabricated people.
  const avatarFriends = friends.slice(0, 2);
  const avatarAnchors = [
    { top: 12, left: 66 },
    { top: 68, left: 28 },
  ];

  return (
    <div className="relative w-full aspect-square max-w-[220px] mx-auto" aria-hidden="true">
      <svg viewBox="0 0 220 220" className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="friends-globe-gradient" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="var(--color-light-turquoise)" stopOpacity="0.55" />
            <stop offset="60%" stopColor="var(--color-aqua)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-muted-blue)" stopOpacity="0.3" />
          </radialGradient>
        </defs>
        <circle cx="110" cy="110" r="72" fill="url(#friends-globe-gradient)" />
        <ellipse cx="110" cy="110" rx="95" ry="40" fill="none" stroke="var(--color-turquoise)" strokeWidth="1" opacity="0.4" />
        <ellipse cx="110" cy="110" rx="72" ry="72" fill="none" stroke="var(--color-muted-blue)" strokeWidth="1" opacity="0.3" />
        <circle cx="42" cy="88" r="3" fill="var(--color-coral)" opacity="0.6" />
        <circle cx="176" cy="132" r="3" fill="var(--color-turquoise)" opacity="0.6" />
      </svg>

      {LABELS.map((label, i) => (
        <span
          key={label.text}
          className="mingoloop-float absolute rounded-full whitespace-nowrap"
          style={{
            top: `${label.top}%`,
            left: `${label.left}%`,
            transform: 'translate(-50%, -50%)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.6rem',
            padding: '3px 8px',
            color: i % 2 === 0 ? 'color-mix(in srgb, var(--color-turquoise) 60%, #111820)' : 'color-mix(in srgb, var(--color-muted-blue) 65%, #111820)',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(20,40,50,0.08)',
            animationDuration: `${6 + i}s`,
            animationDelay: `${i * 0.5}s`,
          }}
        >
          {label.text}
        </span>
      ))}

      {avatarFriends.map((friend, i) => {
        const anchor = avatarAnchors[i];
        return (
          <div
            key={friend.id}
            className="mingoloop-float absolute"
            style={{
              top: `${anchor.top}%`,
              left: `${anchor.left}%`,
              transform: 'translate(-50%, -50%)',
              animationDuration: `${7 + i}s`,
              animationDelay: `${i * 0.7}s`,
            }}
          >
            <div style={{ border: '2px solid #ffffff', borderRadius: 9999, boxShadow: '0 4px 12px rgba(20,40,50,0.1)' }}>
              <FriendAvatar name={friend.name} avatar={friend.avatar} size={32} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
