import { Link } from 'react-router-dom';
import FriendAvatar from '../friends/FriendAvatar';
import { timeAgo } from '../../utils/timeAgo';
import type { CommunityQuestionSummary } from '../../types/user';

export default function PostCard({ question }: { question: CommunityQuestionSummary }) {
  const pills = Array.from(new Set([question.category, ...(question.tags ?? [])].filter(Boolean)));

  return (
    <Link
      to={`/community/${question.id}`}
      className="block p-5"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(20,40,50,0.06)',
        borderRadius: 18,
        boxShadow: '0 8px 30px rgba(40,70,70,0.04)',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <FriendAvatar name={question.author.name} avatar={question.author.avatar} size={40} />
        <div className="flex items-baseline gap-2 min-w-0">
          <span
            className="truncate"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem', color: '#187C91' }}
          >
            {question.author.name}
          </span>
          {question.createdAt && (
            <span className="text-xs flex-shrink-0" style={{ color: '#8A989E', fontFamily: 'var(--font-body)' }}>
              {timeAgo(question.createdAt)}
            </span>
          )}
        </div>
      </div>

      <h3 className="text-base mb-1" style={{ fontFamily: 'var(--font-display)', color: '#111820' }}>
        {question.title}
      </h3>
      {question.description && (
        <p className="text-sm mb-3" style={{ color: '#4F6874', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
          {question.description}
        </p>
      )}

      {pills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {pills.map((pill) => (
            <span
              key={pill}
              className="text-xs px-2.5 py-1"
              style={{ backgroundColor: '#E8F8F7', color: '#2E91A0', borderRadius: 9999, fontFamily: 'var(--font-body)' }}
            >
              {pill}
            </span>
          ))}
          {question.language && (
            <span
              className="text-xs px-2.5 py-1"
              style={{ backgroundColor: '#E8F8F7', color: '#2E91A0', borderRadius: 9999, fontFamily: 'var(--font-body)' }}
            >
              {question.language}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-app-text-muted)', fontFamily: 'var(--font-body)' }}>
        <span className="flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21s-7.5-4.87-10-9.5C.5 7.5 3 4 6.5 4c2 0 3.5 1 5.5 3.5C14 5 15.5 4 17.5 4 21 4 23.5 7.5 22 11.5 19.5 16.13 12 21 12 21Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          {question.likeCount}
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 12a8 8 0 01-11.5 7.2L4 20l1.1-4.3A8 8 0 1121 12Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          {question.answerCount}
        </span>
      </div>
    </Link>
  );
}
