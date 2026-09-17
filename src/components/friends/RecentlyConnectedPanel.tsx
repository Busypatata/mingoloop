import type { Friend } from '../../types/user';
import FriendAvatar from './FriendAvatar';

interface RecentlyConnectedPanelProps {
  friends: Friend[];
  onViewAll: () => void;
}

export default function RecentlyConnectedPanel({ friends, onViewAll }: RecentlyConnectedPanelProps) {
  const shown = friends.slice(0, 4);

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(20,40,50,0.06)',
        boxShadow: '0 8px 30px rgba(40,70,70,0.04)',
        borderRadius: 18,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl" style={{ fontFamily: 'var(--font-display)', color: '#111820' }}>
          Recently connected
        </h3>
        {shown.length > 0 && (
          <button
            onClick={onViewAll}
            className="text-xs whitespace-nowrap"
            style={{ color: 'var(--color-turquoise)', fontFamily: 'var(--font-body)' }}
          >
            View all →
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-app-text-secondary)', fontFamily: 'var(--font-body)' }}>
          New connections will show up here.
        </p>
      ) : (
        <div className="flex gap-4">
          {shown.map((friend) => (
            <div key={friend.id} className="flex flex-col items-center gap-1.5 min-w-0" style={{ width: 60 }}>
              <FriendAvatar name={friend.name} avatar={friend.avatar} size={48} />
              <span
                className="text-xs truncate w-full text-center"
                style={{ color: '#111820', fontFamily: 'var(--font-body)' }}
              >
                {friend.username || friend.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
