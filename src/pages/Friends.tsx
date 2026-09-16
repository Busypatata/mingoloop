import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppNav from '../components/AppNav';
import { useSocket } from '../context/SocketContext';
import type { Friend, FriendRequestItem } from '../types/user';

export default function Friends() {
  const navigate = useNavigate();
  const { onlineUserIds } = useSocket();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<FriendRequestItem[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
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

  const onlineFriends = friends.filter((f) => onlineUserIds.has(f.id) || f.online);
  const otherFriends = friends.filter((f) => !onlineUserIds.has(f.id) && !f.online);

  return (
    <div className="min-h-screen bg-white">
      <AppNav />

      <main className="max-w-5xl mx-auto px-6 py-10 md:px-16">
        <h1 className="text-4xl sm:text-5xl mb-2" style={{ fontFamily: 'var(--font-display)', color: '#000000' }}>
          Your circle.
        </h1>
        <p className="text-lg mb-12" style={{ color: '#6F6F6F' }}>
          The people you're learning alongside.
        </p>

        {isLoading && <p style={{ color: '#6F6F6F' }}>Loading…</p>}
        {error && (
          <p className="text-sm mb-6" style={{ color: '#B3261E' }}>
            {error}
          </p>
        )}

        {!isLoading && !error && (
          <>
            {incoming.length > 0 && (
              <section className="mb-14">
                <h2 className="text-sm uppercase tracking-wide mb-4" style={{ color: '#999999' }}>
                  Requests
                </h2>
                <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                  {incoming.map((req) => (
                    <div key={req.id} className="py-4 flex items-center justify-between">
                      <span style={{ color: '#000000' }}>{req.from?.name}</span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => respond(req.id, 'accept')}
                          className="px-4 py-2 rounded-full text-sm"
                          style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => respond(req.id, 'reject')}
                          className="px-4 py-2 rounded-full text-sm border"
                          style={{ borderColor: 'rgba(0,0,0,0.15)', color: '#6F6F6F' }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {outgoing.length > 0 && (
              <section className="mb-14">
                <h2 className="text-sm uppercase tracking-wide mb-4" style={{ color: '#999999' }}>
                  Sent requests
                </h2>
                <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                  {outgoing.map((req) => (
                    <div key={req.id} className="py-4 flex items-center justify-between">
                      <span style={{ color: '#000000' }}>{req.to?.name}</span>
                      <button onClick={() => cancelRequest(req.id)} className="text-sm" style={{ color: '#6F6F6F' }}>
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mb-14">
              <h2 className="text-sm uppercase tracking-wide mb-4" style={{ color: '#999999' }}>
                Online now
              </h2>
              {onlineFriends.length === 0 ? (
                <p style={{ color: '#6F6F6F' }}>No one's online right now.</p>
              ) : (
                <FriendList friends={onlineFriends} onMessage={startConversation} onRemove={removeFriend} />
              )}
            </section>

            <section>
              <h2 className="text-sm uppercase tracking-wide mb-4" style={{ color: '#999999' }}>
                All friends
              </h2>
              {friends.length === 0 ? (
                <p style={{ color: '#6F6F6F' }}>
                  Your circle is still waiting. Find someone who speaks the language you're learning.
                </p>
              ) : (
                <FriendList friends={otherFriends} onMessage={startConversation} onRemove={removeFriend} />
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function FriendList({
  friends,
  onMessage,
  onRemove,
}: {
  friends: Friend[];
  onMessage: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  if (friends.length === 0) {
    return (
      <p style={{ color: '#6F6F6F' }}>Nothing here yet.</p>
    );
  }

  return (
    <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
      {friends.map((friend) => (
        <div key={friend.id} className="py-4 flex items-center justify-between">
          <div>
            <p style={{ color: '#000000' }}>{friend.name}</p>
            <p className="text-sm" style={{ color: '#999999' }}>
              {friend.country || ''}
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => onMessage(friend.id)} className="text-sm" style={{ color: '#000000' }}>
              Message
            </button>
            <button onClick={() => onRemove(friend.id)} className="text-sm" style={{ color: '#6F6F6F' }}>
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
