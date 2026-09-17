import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppNav from '../components/AppNav';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import FloatingLetters from '../components/dashboard/FloatingLetters';
import LanguageChip from '../components/discover/LanguageChip';
import FriendAvatar from '../components/friends/FriendAvatar';
import FriendRow from '../components/friends/FriendRow';
import FriendsWorldVisual from '../components/friends/FriendsWorldVisual';
import FriendsDecorativeNotes from '../components/friends/FriendsDecorativeNotes';
import RecentlyConnectedPanel from '../components/friends/RecentlyConnectedPanel';
import type { Friend, FriendRequestItem } from '../types/user';

type StatusFilter = 'all' | 'online' | 'offline';

const LANGUAGE_TONES = ['turquoise', 'coral', 'muted-blue', 'aqua'] as const;

export default function Friends() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onlineUserIds } = useSocket();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<FriendRequestItem[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const listRef = useRef<HTMLDivElement>(null);

  function load() {
    setIsLoading(true);
    setError(null);
    api
      .get('/friends')
      .then((res) => {
        setFriends(res.data.friends);
        setIncoming(res.data.incomingRequests);
        setOutgoing(res.data.outgoingRequests);
      })
      .catch(() => setError('Could not load your friends. Please try again.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function respond(requestId: string, action: 'accept' | 'reject') {
    await api.patch(`/friends/request/${requestId}`, { action });
    load();
  }

  async function cancelRequest(requestId: string) {
    await api.delete(`/friends/request/${requestId}`);
    load();
  }

  async function removeFriend(userId: string) {
    await api.delete(`/friends/${userId}`);
    load();
  }

  async function startConversation(userId: string) {
    const res = await api.post('/messages/conversations', { userId });
    navigate(`/messages/${res.data.id}`);
  }

  function isOnline(friend: Friend) {
    return onlineUserIds.has(friend.id) || friend.online;
  }

  function scrollToList() {
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => Number(isOnline(b)) - Number(isOnline(a)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friends, onlineUserIds]);

  const filteredFriends = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedFriends.filter((friend) => {
      if (statusFilter === 'online' && !isOnline(friend)) return false;
      if (statusFilter === 'offline' && isOnline(friend)) return false;
      if (!q) return true;
      const languages = [...friend.nativeLanguages, ...friend.learningLanguages].map((l) => l.language.toLowerCase());
      return (
        friend.name.toLowerCase().includes(q) ||
        friend.username.toLowerCase().includes(q) ||
        languages.some((l) => l.includes(q))
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedFriends, query, statusFilter, onlineUserIds]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7FCFB' }}>
      <AppNav />

      <div className="relative px-6 pt-8 pb-24 md:px-10">
        <FriendsDecorativeNotes />
        <FloatingLetters />

        <main className="relative z-10 max-w-[1240px] mx-auto">
          {/* Hero */}
          <section className="mb-10 lg:mb-12 animate-fade-rise max-w-2xl">
            <p
              className="text-xs uppercase mb-3"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 500, letterSpacing: '0.18em', color: 'color-mix(in srgb, var(--color-turquoise) 70%, #111820)' }}
            >
              Your Language Circle
            </p>
            <h1
              className="text-6xl sm:text-7xl mb-4"
              style={{ fontFamily: 'var(--font-display)', color: '#111820', lineHeight: 0.98 }}
            >
              Your circle.
            </h1>
            <p className="text-lg" style={{ color: '#617481', fontFamily: 'var(--font-body)' }}>
              People you&rsquo;re learning, talking, and growing alongside.
            </p>
          </section>

          {isLoading && (
            <p style={{ color: 'var(--color-app-text-secondary)', fontFamily: 'var(--font-body)' }}>Loading…</p>
          )}
          {error && (
            <div className="mb-6">
              <p className="text-sm mb-3" style={{ color: '#B3261E', fontFamily: 'var(--font-body)' }}>
                We couldn&rsquo;t load your circle. Please try again.
              </p>
              <button
                onClick={load}
                className="text-sm px-5 py-2 rounded-full"
                style={{ backgroundColor: 'var(--color-coral)', color: '#ffffff', fontFamily: 'var(--font-body)' }}
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
              {/* Left: requests + friend list */}
              <div className="flex flex-col gap-6 min-w-0">
                {(incoming.length > 0 || outgoing.length > 0) && (
                  <div
                    className="p-6 md:p-7"
                    style={{ backgroundColor: '#ffffff', border: '1px solid rgba(20,40,50,0.06)', boxShadow: '0 8px 30px rgba(40,70,70,0.04)', borderRadius: 18 }}
                  >
                    {incoming.length > 0 && (
                      <div className={outgoing.length > 0 ? 'mb-6' : ''}>
                        <h2 className="text-xs uppercase mb-4" style={{ letterSpacing: '0.1em', color: 'var(--color-app-text-muted)', fontFamily: 'var(--font-body)' }}>
                          Requests
                        </h2>
                        <div className="flex flex-col">
                          {incoming.map((req, i) => (
                            <div
                              key={req.id}
                              className="py-3.5 flex items-center justify-between gap-3"
                              style={i < incoming.length - 1 ? { borderBottom: '1px solid rgba(20,40,50,0.07)' } : undefined}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <FriendAvatar name={req.from?.name ?? '?'} avatar={req.from?.avatar} size={40} />
                                <span className="truncate" style={{ fontFamily: 'var(--font-display)', color: '#111820' }}>
                                  {req.from?.name}
                                </span>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => respond(req.id, 'accept')}
                                  className="px-4 py-1.5 rounded-full text-xs"
                                  style={{ backgroundColor: 'var(--color-coral)', color: '#ffffff', fontFamily: 'var(--font-body)' }}
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => respond(req.id, 'reject')}
                                  className="px-4 py-1.5 rounded-full text-xs border"
                                  style={{ borderColor: 'rgba(20,40,50,0.12)', color: 'var(--color-app-text-secondary)', fontFamily: 'var(--font-body)' }}
                                >
                                  Decline
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {outgoing.length > 0 && (
                      <div>
                        <h2 className="text-xs uppercase mb-4" style={{ letterSpacing: '0.1em', color: 'var(--color-app-text-muted)', fontFamily: 'var(--font-body)' }}>
                          Sent requests
                        </h2>
                        <div className="flex flex-col">
                          {outgoing.map((req, i) => (
                            <div
                              key={req.id}
                              className="py-3.5 flex items-center justify-between gap-3"
                              style={i < outgoing.length - 1 ? { borderBottom: '1px solid rgba(20,40,50,0.07)' } : undefined}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <FriendAvatar name={req.to?.name ?? '?'} avatar={req.to?.avatar} size={40} />
                                <span className="truncate" style={{ fontFamily: 'var(--font-display)', color: '#111820' }}>
                                  {req.to?.name}
                                </span>
                              </div>
                              <button
                                onClick={() => cancelRequest(req.id)}
                                className="text-xs shrink-0"
                                style={{ color: 'var(--color-app-text-secondary)', fontFamily: 'var(--font-body)' }}
                              >
                                Cancel
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div
                  ref={listRef}
                  className="p-6 md:p-8 scroll-mt-24"
                  style={{ backgroundColor: '#ffffff', border: '1px solid rgba(20,40,50,0.06)', boxShadow: '0 8px 30px rgba(40,70,70,0.04)', borderRadius: 20 }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                    <h2 className="text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-display)', color: '#111820' }}>
                      People in your circle
                    </h2>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center gap-2 px-4"
                        style={{ height: 40, borderRadius: 9999, border: '1px solid rgba(20,40,50,0.1)', backgroundColor: '#ffffff' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--color-app-text-muted)', flexShrink: 0 }}>
                          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search friends..."
                          className="bg-transparent outline-none text-sm w-36 sm:w-44"
                          style={{ fontFamily: 'var(--font-body)', color: '#111820' }}
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                        className="text-sm px-4 outline-none"
                        style={{
                          height: 40,
                          borderRadius: 9999,
                          border: '1px solid rgba(20,40,50,0.1)',
                          backgroundColor: '#ffffff',
                          color: '#111820',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        <option value="all">All</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                  </div>

                  {friends.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="text-lg mb-4" style={{ fontFamily: 'var(--font-display)', color: '#111820' }}>
                        Your circle is still growing.
                      </p>
                      <p className="text-sm mb-6" style={{ color: 'var(--color-app-text-secondary)', fontFamily: 'var(--font-body)' }}>
                        Find language partners and start connecting.
                      </p>
                      <Link
                        to="/discover"
                        className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm"
                        style={{ backgroundColor: 'var(--color-coral)', color: '#ffffff', fontFamily: 'var(--font-body)' }}
                      >
                        Discover people <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  ) : filteredFriends.length === 0 ? (
                    <p className="py-8" style={{ color: 'var(--color-app-text-secondary)', fontFamily: 'var(--font-body)' }}>
                      No one matches &ldquo;{query}&rdquo; right now.
                    </p>
                  ) : (
                    <div className="flex flex-col">
                      {filteredFriends.map((friend, i) => (
                        <FriendRow
                          key={friend.id}
                          friend={friend}
                          online={isOnline(friend)}
                          onMessage={startConversation}
                          onRemove={removeFriend}
                          showDivider={i < filteredFriends.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: sidebar */}
              <aside className="flex flex-col gap-5">
                <div
                  className="p-7"
                  style={{ backgroundColor: '#ffffff', border: '1px solid rgba(20,40,50,0.06)', boxShadow: '0 8px 30px rgba(40,70,70,0.04)', borderRadius: 20 }}
                >
                  <h3 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-display)', color: '#111820', lineHeight: 1.1 }}>
                    Keep your circle
                    <br />
                    growing
                  </h3>
                  <p className="text-sm mb-6" style={{ color: '#617481', fontFamily: 'var(--font-body)' }}>
                    More languages. More people.
                    <br />
                    More perspectives.
                  </p>

                  <FriendsWorldVisual friends={friends} />

                  <Link
                    to="/discover"
                    className="mt-6 flex items-center justify-center gap-2 rounded-full text-sm transition-transform duration-200 hover:scale-[1.02]"
                    style={{ backgroundColor: 'var(--color-coral)', color: '#ffffff', height: 46, fontFamily: 'var(--font-body)', fontWeight: 500 }}
                  >
                    Discover people <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <RecentlyConnectedPanel friends={friends} onViewAll={scrollToList} />

                {user && (user.nativeLanguages.length > 0 || user.learningLanguages.length > 0) && (
                  <div
                    className="p-6"
                    style={{ backgroundColor: '#ffffff', border: '1px solid rgba(20,40,50,0.06)', boxShadow: '0 8px 30px rgba(40,70,70,0.04)', borderRadius: 18 }}
                  >
                    <h3 className="text-xl mb-4" style={{ fontFamily: 'var(--font-display)', color: '#111820' }}>
                      Your languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[...user.nativeLanguages, ...user.learningLanguages].map((l, i) => (
                        <LanguageChip key={`${l.language}-${i}`} label={l.language} tone={LANGUAGE_TONES[i % LANGUAGE_TONES.length]} />
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
