import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import AppNav from '../components/AppNav';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import type { ChatMessage, ConversationSummary } from '../types/user';

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, onlineUserIds } = useSocket();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isTypingOther, setIsTypingOther] = useState(false);
  const typingTimeout = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/messages/conversations').then((res) => setConversations(res.data));
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    api.get(`/messages/${conversationId}`).then((res) => setMessages(res.data));

    if (socket) {
      socket.emit('join_conversation', conversationId);
    }

    return () => {
      if (socket) socket.emit('leave_conversation', conversationId);
    };
  }, [conversationId, socket]);

  useEffect(() => {
    if (!socket) return;

    function handleReceive(payload: ChatMessage) {
      if (payload.conversationId === conversationId) {
        setMessages((prev) => [...prev, payload]);
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === payload.conversationId
            ? { ...c, lastMessage: { text: payload.text, sender: payload.sender, sentAt: payload.createdAt } }
            : c
        )
      );
    }

    function handleTypingStart({ conversationId: cid }: { conversationId: string }) {
      if (cid === conversationId) setIsTypingOther(true);
    }
    function handleTypingStop({ conversationId: cid }: { conversationId: string }) {
      if (cid === conversationId) setIsTypingOther(false);
    }

    socket.on('receive_message', handleReceive);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
    };
  }, [socket, conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleDraftChange(value: string) {
    setDraft(value);
    if (!socket || !conversationId) return;

    socket.emit('typing_start', { conversationId });
    if (typingTimeout.current) window.clearTimeout(typingTimeout.current);
    typingTimeout.current = window.setTimeout(() => {
      socket.emit('typing_stop', { conversationId });
    }, 1500);
  }

  function sendMessage() {
    if (!draft.trim() || !socket || !conversationId) return;
    socket.emit('send_message', { conversationId, text: draft.trim() });
    setDraft('');
  }

  const activeConversation = conversations.find((c) => c.id === conversationId);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppNav />

      <div className="flex-1 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-8 px-0 md:px-16 py-0 md:py-10">
        {/* Conversation list */}
        <div className="border-r md:pr-6" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          <h2 className="text-sm uppercase tracking-wide px-6 md:px-0 py-4 md:py-0 mb-4" style={{ color: '#999999' }}>
            Conversations
          </h2>
          {conversations.length === 0 && (
            <p className="px-6 md:px-0 text-sm" style={{ color: '#6F6F6F' }}>
              Start a conversation from Friends or Discover.
            </p>
          )}
          <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/messages/${c.id}`)}
                className="text-left px-6 md:px-0 py-4"
                style={{ backgroundColor: c.id === conversationId ? 'rgba(0,0,0,0.03)' : 'transparent' }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: '#000000' }}>{c.participant?.name}</span>
                  {(c.participant?.online || onlineUserIds.has(c.participant?.id || '')) && (
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2E7D32' }} />
                  )}
                </div>
                <p className="text-sm truncate" style={{ color: '#6F6F6F' }}>
                  {c.lastMessage?.text || 'Say hello.'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Active chat */}
        <div className="md:col-span-2 flex flex-col px-6 md:px-0 py-4 md:py-0">
          {!conversationId && (
            <p className="mt-10" style={{ color: '#6F6F6F' }}>
              Select a conversation to start chatting.
            </p>
          )}

          {conversationId && (
            <>
              <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#000000' }}>
                    {activeConversation?.participant?.name}
                  </p>
                  {isTypingOther && (
                    <p className="text-xs" style={{ color: '#999999' }}>
                      typing…
                    </p>
                  )}
                </div>
                {activeConversation?.participant && (
                  <Link to={`/session/${activeConversation.participant.id}`} className="text-sm" style={{ color: '#000000' }}>
                    Start a session
                  </Link>
                )}
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4" style={{ minHeight: '50vh' }}>
                {messages.map((m) => {
                  const mine = m.sender === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className="max-w-xs sm:max-w-sm px-4 py-2.5 rounded-2xl text-sm"
                        style={
                          mine
                            ? { backgroundColor: '#000000', color: '#FFFFFF' }
                            : { backgroundColor: '#FFFFFF', color: '#000000', border: '1px solid rgba(0,0,0,0.1)' }
                        }
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <input
                  value={draft}
                  onChange={(e) => handleDraftChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Write a message…"
                  className="flex-1 px-4 py-3 rounded-full border text-sm outline-none"
                  style={{ borderColor: 'rgba(0,0,0,0.15)' }}
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-3 rounded-full text-sm"
                  style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
