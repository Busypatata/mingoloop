import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface NotificationPayload {
  id: string;
  type: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

interface SocketContextValue {
  socket: Socket | null;
  onlineUserIds: Set<string>;
  notifications: NotificationPayload[];
  clearLocalNotifications: () => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

const TOKEN_KEY = 'mingoloop_token';
const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    const s = io(SOCKET_URL, { auth: { token } });

    s.on('user_online', ({ userId }: { userId: string }) => {
      setOnlineUserIds((prev) => new Set(prev).add(userId));
    });

    s.on('user_offline', ({ userId }: { userId: string }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    s.on('notification', (payload: NotificationPayload) => {
      setNotifications((prev) => [payload, ...prev]);
    });

    socketRef.current = s;
    setSocket(s);

    return () => {
      s.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function clearLocalNotifications() {
    setNotifications([]);
  }

  return (
    <SocketContext.Provider value={{ socket, onlineUserIds, notifications, clearLocalNotifications }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
}
