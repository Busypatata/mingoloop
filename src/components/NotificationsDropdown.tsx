import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import type { NotificationItem } from '../types/user';

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
      actor: { id: '', name: '', username: '' },
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
      className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-lg border z-20"
      style={{ borderColor: 'rgba(0,0,0,0.08)' }}
      onMouseLeave={onClose}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
        <span className="text-sm font-medium" style={{ color: '#000000' }}>
          Notifications
        </span>
        <button onClick={handleMarkAllRead} className="text-xs" style={{ color: '#6F6F6F' }}>
          Mark all read
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading && (
          <p className="text-sm px-5 py-6" style={{ color: '#6F6F6F' }}>
            Loading…
          </p>
        )}
        {!isLoading && merged.length === 0 && (
          <p className="text-sm px-5 py-6" style={{ color: '#6F6F6F' }}>
            Nothing here yet.
          </p>
        )}
        {merged.map((n) => (
          <Link
            key={n.id}
            to={n.link || '#'}
            onClick={onClose}
            className="block px-5 py-3 text-sm border-b hover:bg-gray-50"
            style={{
              borderColor: 'rgba(0,0,0,0.06)',
              color: n.read ? '#6F6F6F' : '#000000',
            }}
          >
            {n.message}
          </Link>
        ))}
      </div>
    </div>
  );
}
