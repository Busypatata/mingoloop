import FriendAvatar from '../friends/FriendAvatar';
import { timeAgo } from '../../utils/timeAgo';
import type { ConversationSummary } from '../../types/user';

interface ConversationRowProps {
  conversation: ConversationSummary;
  active: boolean;
  online: boolean;
  onSelect: (id: string) => void;
}

export default function ConversationRow({ conversation, active, online, onSelect }: ConversationRowProps) {
  const name = conversation.participant?.name ?? 'Unknown';
  const when = conversation.lastMessage?.sentAt ?? conversation.updatedAt;

  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className="w-full text-left flex items-center gap-3 px-3 py-3.5 rounded-xl transition-colors"
      style={{ backgroundColor: active ? '#EFFAF9' : 'transparent' }}
    >
      <FriendAvatar name={name} avatar={conversation.participant?.avatar} size={48} online={online} showStatus />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className="truncate"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.95rem', color: '#243843' }}
          >
            {name}
          </span>
          {when && (
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-app-text-muted)', fontFamily: 'var(--font-body)' }}>
              {timeAgo(when)}
            </span>
          )}
        </div>
        <p className="truncate text-xs mt-0.5" style={{ color: '#71818A', fontFamily: 'var(--font-body)' }}>
          {conversation.lastMessage?.text || 'Say hello.'}
        </p>
      </div>
    </button>
  );
}
