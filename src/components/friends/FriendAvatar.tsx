import InitialsAvatar from '../InitialsAvatar';

interface FriendAvatarProps {
  name: string;
  avatar?: string;
  size?: number;
  online?: boolean;
  showStatus?: boolean;
}

export default function FriendAvatar({ name, avatar, size = 60, online, showStatus = false }: FriendAvatarProps) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <InitialsAvatar name={name} size={size} />
      )}
      {showStatus && (
        <span
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            width: Math.max(12, size * 0.22),
            height: Math.max(12, size * 0.22),
            right: -2,
            bottom: -2,
            backgroundColor: online ? 'var(--color-turquoise)' : 'var(--color-app-text-muted)',
            border: '2px solid #ffffff',
          }}
        />
      )}
    </div>
  );
}
