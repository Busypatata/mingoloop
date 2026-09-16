import { Link } from 'react-router-dom';

export default function HomeDiscoveryCTA() {
  return (
    <div
      className="rounded-2xl px-8 py-14 sm:px-14 text-center"
      style={{ backgroundColor: 'var(--color-aqua)' }}
    >
      <p
        className="text-3xl sm:text-4xl mb-8"
        style={{ fontFamily: 'var(--font-display)', color: '#111111' }}
      >
        Who will you meet today?
      </p>
      <Link
        to="/discover"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm transition-transform duration-200 hover:scale-[1.03] hover:gap-3"
        style={{ backgroundColor: 'var(--color-coral)', color: '#FFFFFF' }}
      >
        Discover people <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
