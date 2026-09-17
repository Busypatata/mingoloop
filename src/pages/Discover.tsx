import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import AppNav from '../components/AppNav';
import FloatingLetters from '../components/dashboard/FloatingLetters';
import DiscoverWorldVisual from '../components/discover/DiscoverWorldVisual';
import LanguageChip from '../components/discover/LanguageChip';
import MatchResultRow from '../components/discover/MatchResultRow';
import type { DiscoverResult } from '../types/user';

const CHIP_TONES = ['turquoise', 'coral', 'muted-blue', 'aqua'] as const;

export default function Discover() {
  const [results, setResults] = useState<DiscoverResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  useEffect(() => {
    api
      .get('/users/discover')
      .then((res) => setResults(res.data.results))
      .catch(() => setError('Something went wrong while finding language partners.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleConnect(userId: string) {
    try {
      await api.post('/friends/request', { userId });
      setSentTo((prev) => new Set(prev).add(userId));
    } catch {
      // Silently ignore — the button will simply remain clickable to retry.
    }
  }

  // Popular languages are derived from the real discover results — never
  // hardcoded — so the chips always reflect languages people are actually
  // using right now.
  const popularLanguages = useMemo(() => {
    const seen = new Map<string, number>();
    for (const person of results) {
      for (const l of [...person.nativeLanguages, ...person.learningLanguages]) {
        seen.set(l.language, (seen.get(l.language) ?? 0) + 1);
      }
    }
    return Array.from(seen.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([language]) => language);
  }, [results]);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return results;
    return results.filter((person) => {
      const languages = [...person.nativeLanguages, ...person.learningLanguages].map((l) => l.language.toLowerCase());
      return person.name.toLowerCase().includes(q) || languages.some((l) => l.includes(q));
    });
  }, [results, query]);

  function scrollToResults() {
    document.getElementById('discover-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-landing-bg)' }}>
      <AppNav />

      <div className="relative px-6 pt-8 pb-24 md:px-10">
        <FloatingLetters />

        <main className="relative z-10 max-w-6xl mx-auto">
          {/* Hero */}
          <section className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center mb-20 lg:mb-24">
            <div className="animate-fade-rise">
              <p
                className="text-xs uppercase mb-4"
                style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.18em', color: 'var(--color-coral)' }}
              >
                Explore &bull; Connect &bull; Learn
              </p>

              <h1
                className="text-5xl sm:text-6xl mb-6"
                style={{ fontFamily: 'var(--font-display)', color: '#11110f', lineHeight: 1.04 }}
              >
                New languages,
                <br />
                <span style={{ color: 'var(--color-coral)' }}>new people,</span>
                <br />
                a bigger world.
              </h1>

              <p className="text-base sm:text-lg max-w-md mb-8" style={{ color: 'var(--color-app-text-secondary)' }}>
                Find language partners, join conversations, and explore cultures — together.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  scrollToResults();
                }}
                className="flex items-center gap-3 max-w-lg mb-6"
              >
                <div
                  className="flex-1 flex items-center gap-2 rounded-full px-5 py-3.5"
                  style={{ backgroundColor: '#ffffff', border: '1px solid rgba(17,17,15,0.1)', boxShadow: '0 6px 20px rgba(17,17,15,0.05)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--color-app-text-muted)', flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                    <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search a language..."
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ fontFamily: 'var(--font-body)', color: '#11110f' }}
                  />
                </div>
                <button
                  type="submit"
                  className="discover-search-btn flex items-center gap-1.5 px-6 py-3.5 rounded-full text-sm whitespace-nowrap"
                  style={{ backgroundColor: 'var(--color-coral)', color: '#ffffff' }}
                >
                  Find Matches
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>

              {popularLanguages.length > 0 && (
                <div>
                  <p
                    className="text-xs uppercase mb-3"
                    style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.14em', color: 'var(--color-app-text-muted)' }}
                  >
                    Popular Languages
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularLanguages.map((language, i) => (
                      <LanguageChip
                        key={language}
                        label={language}
                        tone={CHIP_TONES[i % CHIP_TONES.length]}
                        active={query.toLowerCase() === language.toLowerCase()}
                        as="button"
                        onClick={() => {
                          setQuery(language);
                          scrollToResults();
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="animate-fade-rise-delay">
              <DiscoverWorldVisual />
            </div>
          </section>

          {/* Match results */}
          <section id="discover-results" className="scroll-mt-24">
            {isLoading && (
              <p style={{ color: 'var(--color-app-text-secondary)', fontFamily: 'var(--font-body)' }}>Finding your people…</p>
            )}
            {error && (
              <p className="text-sm" style={{ color: '#B3261E' }}>
                {error}
              </p>
            )}
            {!isLoading && !error && results.length === 0 && (
              <p style={{ color: 'var(--color-app-text-secondary)' }}>
                Nothing here yet — check back once more people have joined.
              </p>
            )}
            {!isLoading && !error && results.length > 0 && filteredResults.length === 0 && (
              <p style={{ color: 'var(--color-app-text-secondary)' }}>
                No matches for "{query}" — try another language.
              </p>
            )}

            <div className="flex flex-col">
              {filteredResults.map((person) => (
                <MatchResultRow
                  key={person.id}
                  person={person}
                  connected={sentTo.has(person.id)}
                  onConnect={handleConnect}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
