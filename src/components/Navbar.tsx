import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Find Partners', to: '/register' },
  { label: 'Community', to: '/register' },
  { label: 'About', to: '/about' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
      <Link
        to="/"
        className="flex items-center gap-2 text-2xl tracking-tight"
        style={{ fontFamily: 'var(--font-display)', color: '#111111' }}
      >
        <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
          <circle cx="10" cy="10" r="8" fill="var(--color-turquoise)" opacity={0.85} />
          <circle cx="17" cy="15" r="7" fill="var(--color-coral)" opacity={0.9} />
        </svg>
        MingoLoop<sup className="text-xs align-super">®</sup>
      </Link>

      <div className="hidden md:flex items-center gap-10">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              className="relative text-sm pb-1 transition-colors"
              style={{ color: active ? 'var(--color-coral)' : '#444444' }}
            >
              {item.label}
              {active && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 -bottom-0.5 w-1 h-1 rounded-full"
                  style={{ backgroundColor: 'var(--color-coral)' }}
                />
              )}
            </Link>
          );
        })}
      </div>

      <Link
        to="/register"
        className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm transition-transform duration-200 hover:scale-[1.03] hover:gap-3"
        style={{ backgroundColor: 'var(--color-coral)', color: '#FFFFFF' }}
      >
        Get Started <span aria-hidden="true">→</span>
      </Link>
    </nav>
  );
}
