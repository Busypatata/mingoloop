import { useRef } from 'react';
import { Link } from 'react-router-dom';
import InitialsAvatar from '../InitialsAvatar';
import type { DiscoverResult } from '../../types/user';

export default function MeetPeopleCarousel({ people }: { people: DiscoverResult[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(amount: number) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  }

  if (people.length === 0) return null;

  return (
    <div className="rounded-2xl border p-6" style={{ borderColor: 'rgba(17,17,17,0.08)', backgroundColor: '#FFFFFF' }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium" style={{ color: '#111111' }}>
          Meet people
        </p>
        <div className="flex items-center gap-4">
          <Link to="/discover" className="text-xs" style={{ color: 'var(--color-coral)' }}>
            View all
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => scrollBy(-240)}
              aria-label="Scroll left"
              className="w-7 h-7 rounded-full border flex items-center justify-center text-sm"
              style={{ borderColor: 'rgba(17,17,17,0.15)', color: '#111111' }}
            >
              ←
            </button>
            <button
              onClick={() => scrollBy(240)}
              aria-label="Scroll right"
              className="w-7 h-7 rounded-full border flex items-center justify-center text-sm"
              style={{ borderColor: 'rgba(17,17,17,0.15)', color: '#111111' }}
            >
              →
            </button>
          </div>
        </div>
      </div>
      <p className="text-xs mb-5" style={{ color: '#9A9893' }}>
        Practice languages, make friends, explore cultures.
      </p>

      <div ref={scrollerRef} className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {people.slice(0, 10).map((p) => (
          <Link
            key={p.id}
            to="/discover"
            className="flex-shrink-0 w-28 flex flex-col items-center text-center"
          >
            <InitialsAvatar name={p.name} size={72} />
            <p className="text-sm mt-2" style={{ color: '#111111' }}>
              {p.name}
            </p>
            <p className="text-xs flex items-center gap-1" style={{ color: '#9A9893' }}>
              {p.country || ''}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
