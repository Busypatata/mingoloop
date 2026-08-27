import { Link } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Home', active: true, to: '/' },
  { label: 'About', active: false, to: '/about' },
];

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
      <Link
        to="/"
        className="text-3xl tracking-tight"
        style={{ fontFamily: 'var(--font-display)', color: '#000000' }}
      >
        MingoLoop<sup className="text-base align-super">®</sup>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="text-sm transition-colors hover:text-black"
            style={{ color: item.active ? '#000000' : '#6F6F6F' }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <Link
        to="/register"
        className="rounded-full px-6 py-2.5 text-sm transition-transform duration-200 hover:scale-[1.03] inline-block"
        style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
      >
        Begin Journey
      </Link>
    </nav>
  );
}
