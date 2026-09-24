import { useRef } from 'react';
import { Link } from 'react-router-dom';
import FriendAvatar from '../friends/FriendAvatar';
import type { DiscoverResult } from '../../types/user';

export default function MeetPeopleCarousel({ people }: { people: DiscoverResult[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(amount: number) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  }

  if (people.length === 0) return null;

  return (
    <div
      className="p-6 sm:p-7"
      style={{ backgroundColor: '#ffffff', border: '1px solid rgba(18,63,75,0.08)', borderRadius: 24 }}
    >
      <div className="flex items-start justify-between mb-1 gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#DDF4F4' }}
            aria-hidden="true"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="9" r="3.2" stroke="var(--color-turquoise)" strokeWidth="1.6" />
              <circle cx="17" cy="10" r="2.4" stroke="var(--color-turquoise)" strokeWidth="1.6" />
              <path d="M3 19c0-4 3-6.5 6-6.5s6 2.5 6 6.5M15 19c0-2.8 1.6-5 4.5-5" stroke="var(--color-turquoise)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-base" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: '#123F4B' }}>
              Meet people
            </p>
            <p className="text-xs" style={{ color: '#617481', fontFamily: 'var(--font-body)' }}>
              Practice languages, make friends, explore cultures.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link to="/discover" className="text-sm" style={{ color: 'var(--color-deep-red)', fontFamily: 'var(--font-body)' }}>
            View all
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => scrollBy(-240)}
              aria-label="Scroll left"
              className="rounded-full flex items-center justify-center"
              style={{ width: 36, height: 36, border: '1px solid rgba(18,63,75,0.1)', color: '#123F4B' }}
            >
              ←
            </button>
            <button
              onClick={() => scrollBy(240)}
              aria-label="Scroll right"
              className="rounded-full flex items-center justify-center"
              style={{ width: 36, height: 36, border: '1px solid rgba(18,63,75,0.1)', color: '#123F4B' }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div ref={scrollerRef} className="flex gap-7 overflow-x-auto pt-5 pb-1" style={{ scrollbarWidth: 'none' }}>
        {people.slice(0, 10).map((p) => {
          const langs = [p.nativeLanguages[0]?.language, p.learningLanguages[0]?.language].filter(Boolean).join(' · ');
          return (
            <Link key={p.id} to="/discover" className="flex-shrink-0 flex items-center gap-2.5">
              <FriendAvatar name={p.name} avatar={p.avatar} size={44} />
              <div className="min-w-0">
                <p className="text-sm truncate" style={{ color: '#123F4B', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                  {p.username || p.name}
                </p>
                {langs && (
                  <p className="text-xs truncate" style={{ color: '#617481', fontFamily: 'var(--font-body)' }}>
                    {langs}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
