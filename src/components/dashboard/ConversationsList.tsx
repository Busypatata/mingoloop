import { Link } from 'react-router-dom';
import InitialsAvatar from '../InitialsAvatar';
import { timeAgo } from '../../utils/timeAgo';
import type { ConversationSummary } from '../../types/user';

export default function ConversationsList({ conversations }: { conversations: ConversationSummary[] }) {
  return (
    <div className="rounded-2xl border p-6" style={{ borderColor: 'rgba(17,17,17,0.08)', backgroundColor: '#FFFFFF' }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium" style={{ color: '#111111' }}>
          Your conversations
        </p>
        {conversations.length > 0 && (
          <Link to="/messages" className="text-xs" style={{ color: 'var(--color-coral)' }}>
            View all
          </Link>
        )}
      </div>

      {conversations.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm mb-3" style={{ color: '#5A5A5A' }}>
            Start a conversation.
          </p>
          <Link
            to="/discover"
            className="text-sm"
            style={{ color: 'var(--color-turquoise)' }}
          >
            Find conversation partners →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(17,17,17,0.06)' }}>
          {conversations.slice(0, 3).map((c) => (
            <Link key={c.id} to={`/messages/${c.id}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <InitialsAvatar name={c.participant?.name || '?'} size={40} />
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: '#111111' }}>
                  {c.participant?.name}
                </p>
                <p className="text-xs truncate" style={{ color: '#9A9893', maxWidth: 220 }}>
                  {c.lastMessage?.text || 'Say hello.'}
                </p>
              </div>
              {c.lastMessage?.sentAt && (
                <span className="text-xs flex-shrink-0" style={{ color: '#9A9893' }}>
                  {timeAgo(c.lastMessage.sentAt)}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
