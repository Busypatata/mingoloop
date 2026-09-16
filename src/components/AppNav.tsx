import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import NotificationsDropdown from './NotificationsDropdown';
import InitialsAvatar from './InitialsAvatar';

const LINKS = [
  { to: '/dashboard', label: 'Home' },
  { to: '/discover', label: 'Discover' },
  { to: '/friends', label: 'Friends' },
  { to: '/messages', label: 'Messages' },
  { to: '/community', label: 'Community' },
];

export default function AppNav() {
  const { logout, user } = useAuth();
  const { notifications } = useSocket();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="sticky top-0 z-30 flex justify-center px-4 pt-4">
      <nav
        className="flex items-center justify-between w-full max-w-5xl px-5 transition-all duration-300"
        style={{
          borderRadius: 999,
          border: '1px solid rgba(17,17,15,0.08)',
          backgroundColor: scrolled ? 'rgba(247,245,240,0.85)' : 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(18px)',
          boxShadow: scrolled ? '0 8px 24px rgba(17,17,15,0.08)' : '0 2px 10px rgba(17,17,15,0.04)',
          paddingTop: scrolled ? 10 : 14,
          paddingBottom: scrolled ? 10 : 14,
        }}
      >
        <Link
          to="/dashboard"
          className="text-xl tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: '#11110F' }}
        >
          MingoLoop<sup className="text-xs align-super">®</sup>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="relative text-sm px-3 py-1.5 transition-colors"
                style={{ color: active ? '#11110F' : '#73716D' }}
              >
                {link.label}
                {active && (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 -bottom-0.5 w-1 h-1 rounded-full"
                    style={{ backgroundColor: '#E7464E' }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="text-sm relative"
              style={{ color: '#73716D' }}
              aria-label="Notifications"
            >
              Notifications
              {unreadCount > 0 && (
                <span
                  className="absolute -top-2 -right-3 text-[10px] rounded-full px-1.5 py-0.5 text-white"
                  style={{ backgroundColor: '#E7464E' }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && <NotificationsDropdown onClose={() => setShowNotifications(false)} />}
          </div>

          <button onClick={logout} className="text-sm" style={{ color: '#73716D' }}>
            Log out
          </button>

          {user && <InitialsAvatar name={user.name} size={32} />}
        </div>
      </nav>
    </div>
  );
}
