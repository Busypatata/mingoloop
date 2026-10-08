import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import AppNav from '../components/AppNav';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import FloatingLetters from '../components/dashboard/FloatingLetters';
import FriendsDecorativeNotes from '../components/friends/FriendsDecorativeNotes';
import FriendAvatar from '../components/friends/FriendAvatar';
import ConversationRow from '../components/messages/ConversationRow';
import MessagesEmptyState from '../components/messages/MessagesEmptyState';
import MessageBubble from '../components/messages/MessageBubble';
import { useVoiceRecorder, type RecordedAudio } from '../hooks/useVoiceRecorder';
import type { ChatMessage, ConversationSummary } from '../types/user';

const VOICE_PREVIEW = 'Voice message';

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const PANEL_STYLE = {
  backgroundColor: '#ffffff',
  border: '1px solid rgba(20,40,50,0.06)',
  boxShadow: '0 8px 30px rgba(40,70,70,0.04)',
  borderRadius: 18,
};

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, onlineUserIds } = useSocket();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isTypingOther, setIsTypingOther] = useState(false);
  const [query, setQuery] = useState('');
  const [chatError, setChatError] = useState('');
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const typingTimeout = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    recording,
    seconds: recordingSeconds,
    error: recorderError,
    start: startRecording,
    stop: stopRecording,
    cancel: cancelRecording,
  } = useVoiceRecorder({ onAutoStop: (audio) => void sendVoice(audio) });

  // Switching conversations drops any in-progress recording and stale errors.
  useEffect(() => {
    cancelRecording();
    setChatError('');
  }, [conversationId, cancelRecording]);

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
        // Skip if already added (e.g. our own voice message arrives both from
        // the upload response and from the socket).
        setMessages((prev) => (prev.some((m) => m.id === payload.id) ? prev : [...prev, payload]));
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === payload.conversationId
            ? {
                ...c,
                lastMessage: {
                  text: payload.audioUrl ? VOICE_PREVIEW : payload.text,
                  sender: payload.sender,
                  sentAt: payload.createdAt,
                },
              }
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
    setChatError('');
  }

  async function handleStartRecording() {
    setChatError('');
    await startRecording();
  }

  async function handleStopAndSend() {
    await sendVoice(await stopRecording());
  }

  async function sendVoice(audio: RecordedAudio | null) {
    if (!audio || !conversationId) return;

    setUploadingVoice(true);
    setChatError('');
    try {
      const baseType = audio.mimeType.split(';')[0];
      const extension = baseType.includes('mp4') ? 'm4a' : baseType.includes('ogg') ? 'ogg' : 'webm';

      const form = new FormData();
      form.append('duration', String(audio.durationSeconds));
      form.append('audio', new File([audio.blob], `voice.${extension}`, { type: baseType }));

      const res = await api.post<ChatMessage>(`/messages/${conversationId}/audio`, form);
      const sent = res.data;

      setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === sent.conversationId
            ? { ...c, lastMessage: { text: VOICE_PREVIEW, sender: sent.sender, sentAt: sent.createdAt } }
            : c
        )
      );
    } catch (err: any) {
      setChatError(err?.response?.data?.message || 'Could not send your voice message. Please try again.');
    } finally {
      setUploadingVoice(false);
    }
  }

  function isOnline(c: ConversationSummary) {
    return !!(c.participant && (c.participant.online || onlineUserIds.has(c.participant.id)));
  }

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const name = c.participant?.name?.toLowerCase() ?? '';
      const preview = c.lastMessage?.text?.toLowerCase() ?? '';
      return name.includes(q) || preview.includes(q);
    });
  }, [conversations, query]);

  const activeConversation = conversations.find((c) => c.id === conversationId);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7FCFB' }}>
      <AppNav />

      <div className="relative px-6 pt-6 pb-10 md:px-10">
        <FriendsDecorativeNotes />
        <FloatingLetters />

        <main className="relative z-10 max-w-[1280px] mx-auto">
          <div
            className="grid md:grid-cols-[380px_1fr] gap-4 items-stretch"
            style={{ height: 'calc(100vh - 170px)', minHeight: 560 }}
          >
            {/* Conversation list */}
            <div
              className={`flex-col min-h-0 p-5 ${conversationId ? 'hidden md:flex' : 'flex'}`}
              style={PANEL_STYLE}
            >
              <h1
                className="text-3xl mb-4 px-1"
                style={{ fontFamily: 'var(--font-display)', color: '#111820', fontWeight: 400 }}
              >
                Messages
              </h1>

              <div
                className="flex items-center gap-2 px-4 mb-3 flex-shrink-0"
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
                  placeholder="Search conversations..."
                  className="bg-transparent outline-none text-sm w-full"
                  style={{ fontFamily: 'var(--font-body)', color: '#111820' }}
                />
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1">
                {conversations.length === 0 ? (
                  <div className="py-10 text-center px-2">
                    <p className="text-base mb-2" style={{ fontFamily: 'var(--font-display)', color: '#111820' }}>
                      No conversations yet.
                    </p>
                    <p className="text-sm" style={{ color: '#71818A', fontFamily: 'var(--font-body)' }}>
                      Start a conversation from{' '}
                      <Link to="/friends" style={{ color: 'var(--color-turquoise)' }}>
                        Friends
                      </Link>{' '}
                      or{' '}
                      <Link to="/discover" style={{ color: 'var(--color-turquoise)' }}>
                        Discover
                      </Link>
                      .
                    </p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <p className="text-sm py-6 px-2" style={{ color: '#71818A', fontFamily: 'var(--font-body)' }}>
                    No conversations match &ldquo;{query}&rdquo;.
                  </p>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    {filteredConversations.map((c) => (
                      <ConversationRow
                        key={c.id}
                        conversation={c}
                        active={c.id === conversationId}
                        online={isOnline(c)}
                        onSelect={(id) => navigate(`/messages/${id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active chat / empty state */}
            <div
              className={`flex-col min-h-0 ${conversationId ? 'flex' : 'hidden md:flex'}`}
              style={PANEL_STYLE}
            >
              {!conversationId ? (
                <MessagesEmptyState />
              ) : (
                <>
                  <div
                    className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                    style={{ borderBottom: '1px solid rgba(20,40,50,0.07)' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Link to="/messages" className="md:hidden -ml-1 p-1" aria-label="Back to conversations">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#111820' }}>
                          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                      <FriendAvatar
                        name={activeConversation?.participant?.name ?? '?'}
                        avatar={activeConversation?.participant?.avatar}
                        size={40}
                        online={!!activeConversation && isOnline(activeConversation)}
                        showStatus
                      />
                      <div className="min-w-0">
                        <p
                          className="truncate"
                          style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#111820' }}
                        >
                          {activeConversation?.participant?.name}
                        </p>
                        {isTypingOther && (
                          <p className="text-xs" style={{ color: 'var(--color-turquoise)', fontFamily: 'var(--font-body)' }}>
                            typing…
                          </p>
                        )}
                      </div>
                    </div>
                    {activeConversation?.participant && (
                      <Link
                        to={`/session/${activeConversation.participant.id}`}
                        className="text-sm whitespace-nowrap flex-shrink-0"
                        style={{ color: 'var(--color-coral)', fontFamily: 'var(--font-body)' }}
                      >
                        Start a session
                      </Link>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-6 py-5 min-h-0">
                    {messages.map((m) => (
                      <MessageBubble key={m.id} message={m} mine={m.sender === user?.id} />
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(20,40,50,0.07)' }}>
                    {(chatError || recorderError) && (
                      <p className="text-xs mb-2 px-1" style={{ color: '#B3261E', fontFamily: 'var(--font-body)' }}>
                        {chatError || recorderError}
                      </p>
                    )}
                    {uploadingVoice && (
                      <p className="text-xs mb-2 px-1" style={{ color: '#71818A', fontFamily: 'var(--font-body)' }}>
                        Sending voice message…
                      </p>
                    )}

                    {recording ? (
                      <div className="flex items-center gap-3">
                        <span
                          className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0"
                          style={{ backgroundColor: '#B3261E' }}
                        />
                        <span className="flex-1 text-sm" style={{ fontFamily: 'var(--font-body)', color: '#111820' }}>
                          Recording… {formatDuration(recordingSeconds)}
                        </span>
                        <button
                          onClick={cancelRecording}
                          className="px-5 py-3 rounded-full text-sm flex-shrink-0"
                          style={{ border: '1px solid rgba(20,40,50,0.1)', color: '#111820', fontFamily: 'var(--font-body)' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleStopAndSend}
                          className="friends-message-btn px-6 py-3 rounded-full text-sm flex-shrink-0"
                          style={{ backgroundColor: 'var(--color-coral)', color: '#ffffff', fontFamily: 'var(--font-body)', fontWeight: 500 }}
                        >
                          Send
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <input
                          value={draft}
                          onChange={(e) => handleDraftChange(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Write a message…"
                          className="flex-1 px-4 py-3 rounded-full text-sm outline-none"
                          style={{ border: '1px solid rgba(20,40,50,0.1)', fontFamily: 'var(--font-body)', color: '#111820' }}
                        />
                        <button
                          onClick={handleStartRecording}
                          disabled={uploadingVoice}
                          aria-label="Record a voice message"
                          title="Record a voice message"
                          className="flex items-center justify-center rounded-full flex-shrink-0"
                          style={{
                            width: 44,
                            height: 44,
                            border: '1px solid rgba(20,40,50,0.1)',
                            color: 'var(--color-turquoise)',
                            opacity: uploadingVoice ? 0.5 : 1,
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <rect x="9" y="3" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
                            <path d="M5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                        <button
                          onClick={sendMessage}
                          className="friends-message-btn px-6 py-3 rounded-full text-sm flex-shrink-0"
                          style={{ backgroundColor: 'var(--color-coral)', color: '#ffffff', fontFamily: 'var(--font-body)', fontWeight: 500 }}
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
