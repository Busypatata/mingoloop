import { Link } from 'react-router-dom';
import type { CommunityQuestionSummary } from '../../types/user';

export default function CommunityPulse({ questions }: { questions: CommunityQuestionSummary[] }) {
  return (
    <div className="rounded-2xl border p-6" style={{ borderColor: 'rgba(17,17,17,0.08)', backgroundColor: '#FFFFFF' }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium" style={{ color: '#111111' }}>
          What's being asked
        </p>
        {questions.length > 0 && (
          <Link to="/community" className="text-xs" style={{ color: 'var(--color-coral)' }}>
            View all
          </Link>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm mb-3" style={{ color: '#5A5A5A' }}>
            The conversation starts with someone.
          </p>
          <Link to="/community" className="text-sm" style={{ color: 'var(--color-coral)' }}>
            Ask the community →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(17,17,17,0.06)' }}>
          {questions.slice(0, 3).map((q) => (
            <Link key={q.id} to={`/community/${q.id}`} className="py-3 first:pt-0 last:pb-0 block">
              <p className="text-sm mb-1.5" style={{ color: '#111111' }}>
                {q.title}
              </p>
              <div className="flex gap-3 text-xs" style={{ color: '#9A9893' }}>
                <span>♡ {q.likeCount}</span>
                <span>💬 {q.answerCount}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
