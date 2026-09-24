import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import FriendAvatar from './friends/FriendAvatar';
import { timeAgo } from '../utils/timeAgo';
import type { NotificationItem } from '../types/user';

function TypeIcon({ type }: { type: string }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' } as const;
  const stroke = 'var(--color-turquoise)';
  if (type === 'friend_request' || type === 'friend_request_accepted') {
    return (
      <svg {...common}>
        <circle cx="12" cy="9" r="3.4" stroke={stroke} strokeWidth="1.7" />
        <path d="M5 20c0-4 3-6.5 7-6.5s7 2.5 7 6.5" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'session_invite') {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="13" height="12" rx="2" stroke={stroke} strokeWidth="1.7" />
        <path d="M16 10l5-3v10l-5-3Z" stroke={stroke} strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'like') {
    return (
      <svg {...common}>
        <path
          d="M12 20s-7-4.5-9-8.7C1.4 8 3.5 5 6.7 5c1.8 0 3.3 1 5.3 3.2C14 6 15.5 5 17.3 5c3.2 0 5.3 3 3.7 6.3-2 4.2-9 8.7-9 8.7Z"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  // new_message, new_answer, and any other type — message bubble default
  return (
    <svg {...common}>
      <path d="M4 5h16v11H8l-4 4V5Z" stroke={stroke} strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export default function NotificationsDropdown({ onClose }: { onClose: () => void }) {
  const { notifications: liveNotifications, clearLocalNotifications } = useSocket();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get('/notifications')
      .then((res) => setNotifications(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Merge in anything that arrived live over the socket since the page loaded.
  const merged = [
    ...liveNotifications.map((n) => ({
      id: n.id,
      type: n.type,
      message: n.message,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt,
      actor: { id: '', name: '', username: '', avatar: undefined as string | undefined },
    })),
    ...notifications,
  ];

  async function handleMarkAllRead() {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      clearLocalNotifications();
    } catch {
      // Non-critical — leave state as-is if this fails.
    }
  }

  return (
    <div
      className="absolute right-0 mt-3 z-20 animate-notif-in"
      style={{ width: 'min(92vw, 720px)' }}
      onMouseLeave={onClose}
    >
      {/* Connector */}
      <div
        className="absolute rounded-sm"
        style={{ top: -6, right: 24, width: 12, height: 12, backgroundColor: '#ffffff', transform: 'rotate(45deg)', border: '1px solid rgba(20,50,60,0.06)', borderRight: 'none', borderBottom: 'none' }}
        aria-hidden="true"
      />

      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: '#ffffff', border: '1px solid rgba(20,50,60,0.07)', borderRadius: 24, boxShadow: '0 16px 44px rgba(20,50,60,0.1)' }}
      >
        <div className="flex items-center justify-between px-7 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', color: '#111820', fontWeight: 400 }}>
              Notifications
            </h2>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ marginTop: -6 }}>
              <path d="M12 3c3 2 3 8 0 10-3-2-3-8 0-10Z" fill="var(--color-coral)" opacity="0.55" />
              <path d="M14 8c3 0 5 3 4 7-4 0-6-3-4-7Z" fill="var(--color-turquoise)" opacity="0.55" />
            </svg>
          </div>
          {merged.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="notif-mark-read text-sm"
              style={{ color: 'var(--color-muted-blue)', fontFamily: 'var(--font-body)' }}
            >
              Mark all read
            </button>
          )}
        </div>

        <div style={{ maxHeight: 480, overflowY: 'auto' }}>
          {isLoading && (
            <p className="text-sm px-7 py-10 text-center" style={{ color: 'var(--color-app-text-secondary)', fontFamily: 'var(--font-body)' }}>
              Loading…
            </p>
          )}

          {!isLoading && merged.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 px-7" aria-hidden="false">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mb-3">
                <path d="M12 2l1.7 5.2L19 9l-5.3 1.8L12 16l-1.7-5.2L5 9l5.3-1.8L12 2Z" fill="var(--color-light-turquoise)" />
              </svg>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#111820' }}>Nothing here yet.</p>
            </div>
          )}

          {merged.map((n, i) => (
            <Link
              key={n.id}
              to={n.link || '#'}
              onClick={onClose}
              className="notif-row flex items-start gap-4 px-7 py-4"
              style={i < merged.length - 1 ? { borderBottom: '1px solid rgba(20,50,60,0.06)' } : undefined}
            >
              <div className="relative flex-shrink-0">
                {n.actor?.name ? (
                  <FriendAvatar name={n.actor.name} avatar={n.actor.avatar} size={42} />
                ) : (
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{ width: 42, height: 42, backgroundColor: '#C3E9E7' }}
                  >
                    <TypeIcon type={n.type} />
                  </div>
                )}
                {!n.read && (
                  <span
                    className="absolute rounded-full"
                    style={{ width: 9, height: 9, top: -1, right: -1, backgroundColor: 'var(--color-coral)', border: '2px solid #ffffff' }}
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-sm"
                  style={{ color: n.read ? 'var(--color-app-text-secondary)' : '#111820', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}
                >
                  {n.message}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                <span className="text-xs whitespace-nowrap" style={{ color: 'var(--color-app-text-muted)', fontFamily: 'var(--font-body)' }}>
                  {timeAgo(n.createdAt)}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" stroke="var(--color-turquoise)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {merged.length > 0 && (
          <div className="relative px-7 py-4 text-center" style={{ borderTop: '1px solid rgba(20,50,60,0.06)' }}>
            <svg
              className="absolute pointer-events-none"
              style={{ bottom: -6, left: -10, opacity: 0.4 }}
              width="90"
              height="30"
              viewBox="0 0 90 30"
              aria-hidden="true"
            >
              <path d="M0 22c15-14 30 14 45 0s30-14 45 0v8H0Z" fill="var(--color-aqua)" />
            </svg>
            <svg
              className="absolute pointer-events-none"
              style={{ bottom: -2, right: 12, opacity: 0.5 }}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path d="M8 1c2 1.5 2 5.5 0 7-2-1.5-2-5.5 0-7Z" fill="var(--color-coral)" opacity="0.6" />
              <path d="M9.5 4c2 0 3.5 2 3 5-2.5 0-4-2-3-5Z" fill="var(--color-turquoise)" opacity="0.6" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
