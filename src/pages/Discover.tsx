import { useEffect, useState } from 'react';
import api from '../services/api';
import type { DiscoverResult } from '../types/user';

export default function Discover() {
  const [results, setResults] = useState<DiscoverResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/users/discover')
      .then((res) => setResults(res.data.results))
      .catch(() => setError('Something went wrong while finding language partners.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white px-6 py-10 md:px-16">
      <header className="max-w-5xl mx-auto mb-12">
        <span
          className="text-2xl tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: '#000000' }}
        >
          MingoLoop<sup className="text-sm align-super">®</sup>
        </span>
      </header>

      <main className="max-w-5xl mx-auto">
        <h1
          className="text-4xl sm:text-5xl mb-2"
          style={{ fontFamily: 'var(--font-display)', color: '#000000' }}
        >
          Who are you looking for?
        </h1>
        <p className="text-lg mb-12" style={{ color: '#6F6F6F' }}>
          People whose languages complement yours.
        </p>

        {isLoading && <p style={{ color: '#6F6F6F' }}>Finding your people…</p>}
        {error && (
          <p className="text-sm" style={{ color: '#B3261E' }}>
            {error}
          </p>
        )}
        {!isLoading && !error && results.length === 0 && (
          <p style={{ color: '#6F6F6F' }}>
            Nothing here yet — check back once more people have joined.
          </p>
        )}

        <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          {results.map((person) => (
            <div
              key={person.id}
              className="py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              style={{ borderColor: 'rgba(0,0,0,0.08)' }}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                    {person.name}
                  </h3>
                  {person.country && (
                    <span className="text-sm" style={{ color: '#999999' }}>
                      {person.country}
                    </span>
                  )}
                </div>
                {person.bio && (
                  <p className="text-sm mb-2" style={{ color: '#6F6F6F' }}>
                    {person.bio}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {person.nativeLanguages.map((l) => (
                    <span key={`n-${l.language}`} className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                      {l.language} · native
                    </span>
                  ))}
                  {person.learningLanguages.map((l) => (
                    <span key={`l-${l.language}`} className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                      {l.language} · learning
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm" style={{ color: '#6F6F6F' }}>
                  {person.compatibility}% match
                </span>
                <button
                  className="px-6 py-2.5 rounded-full text-sm transition-transform duration-200 hover:scale-[1.03]"
                  style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
                >
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
