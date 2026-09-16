import { timeAgo } from '../../utils/timeAgo';
import type { NotificationItem } from '../../types/user';

const ICON_FOR_TYPE: Record<string, string> = {
  friend_request: '👋',
  friend_request_accepted: '🤝',
  new_message: '💬',
  new_answer: '💬',
  like: '♡',
  session_invite: '🎥',
};

export default function ActivityFeed({ notifications }: { notifications: NotificationItem[] }) {
  return (
    <div className="rounded-2xl border p-6" style={{ borderColor: 'rgba(17,17,17,0.08)', backgroundColor: '#FFFFFF' }}>
      <p className="text-sm font-medium mb-4" style={{ color: '#111111' }}>
        Activity
      </p>

      {notifications.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: '#5A5A5A' }}>
          Nothing here yet.
        </p>
      ) : (
        <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(17,17,17,0.06)' }}>
          {notifications.slice(0, 4).map((n) => (
            <div key={n.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="text-base flex-shrink-0" aria-hidden="true">
                {ICON_FOR_TYPE[n.type] ?? '•'}
              </span>
              <p className="text-sm flex-1 min-w-0" style={{ color: '#111111' }}>
                {n.message}
              </p>
              <span className="text-xs flex-shrink-0" style={{ color: '#9A9893' }}>
                {timeAgo(n.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
