import FriendAvatar from '../friends/FriendAvatar';

interface PostComposerProps {
  userName: string;
  userAvatar?: string;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  title: string;
  onTitleChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  language: string;
  onLanguageChange: (v: string) => void;
  error: string | null;
  onSubmit: () => void;
}

const inputStyle = {
  border: '1px solid rgba(20,40,50,0.1)',
  fontFamily: 'var(--font-body)',
  color: '#111820',
};

export default function PostComposer({
  userName,
  userAvatar,
  expanded,
  onExpand,
  onCollapse,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  language,
  onLanguageChange,
  error,
  onSubmit,
}: PostComposerProps) {
  return (
    <div
      className="p-5"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(20,40,50,0.06)',
        borderRadius: 20,
        boxShadow: '0 8px 30px rgba(40,70,70,0.04)',
      }}
    >
      {!expanded ? (
        <div className="flex items-center gap-3">
          <FriendAvatar name={userName} avatar={userAvatar} size={38} />
          <button
            onClick={onExpand}
            className="flex-1 text-left px-4 text-sm truncate"
            style={{ ...inputStyle, height: 42, borderRadius: 9999, backgroundColor: '#F7FCFB', color: '#71818A' }}
          >
            Share a question, correction, or start a discussion...
          </button>
          <button
            onClick={onExpand}
            className="friends-message-btn flex items-center gap-1.5 px-5 rounded-full text-sm flex-shrink-0"
            style={{ height: 42, backgroundColor: 'var(--color-coral)', color: '#ffffff', fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 2L15 22l-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Post
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <FriendAvatar name={userName} avatar={userAvatar} size={38} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: '#111820' }}>{userName}</span>
          </div>

          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Title"
            className="w-full mb-3 px-4 py-3 rounded-xl text-sm outline-none"
            style={inputStyle}
          />
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Share a question, correction, or start a discussion..."
            rows={4}
            className="w-full mb-3 px-4 py-3 rounded-xl text-sm outline-none resize-none"
            style={inputStyle}
          />
          <input
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            placeholder="Language (optional)"
            className="w-full mb-3 px-4 py-3 rounded-xl text-sm outline-none"
            style={inputStyle}
          />

          {error && (
            <p className="text-sm mb-3" style={{ color: '#B3261E', fontFamily: 'var(--font-body)' }}>
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onSubmit}
              className="friends-message-btn px-6 py-2.5 rounded-full text-sm"
              style={{ backgroundColor: 'var(--color-coral)', color: '#ffffff', fontFamily: 'var(--font-body)', fontWeight: 500 }}
            >
              Publish question
            </button>
            <button
              onClick={onCollapse}
              className="px-4 py-2.5 rounded-full text-sm"
              style={{ color: 'var(--color-app-text-secondary)', fontFamily: 'var(--font-body)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
