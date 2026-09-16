import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import AppNav from '../components/AppNav';
import type { CommunityQuestionDetail } from '../types/user';

export default function CommunityQuestionPage() {
  const { questionId } = useParams();
  const [question, setQuestion] = useState<CommunityQuestionDetail | null>(null);
  const [answerDraft, setAnswerDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  function load() {
    if (!questionId) return;
    api
      .get(`/community/questions/${questionId}`)
      .then((res) => setQuestion(res.data))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [questionId]);

  async function toggleLike() {
    if (!questionId || !question) return;
    const res = await api.post(`/community/questions/${questionId}/like`);
    setQuestion({ ...question, likeCount: res.data.likeCount, likedByMe: res.data.likedByMe });
  }

  async function submitAnswer() {
    if (!answerDraft.trim() || !questionId) return;
    await api.post(`/community/questions/${questionId}/answers`, { body: answerDraft.trim() });
    setAnswerDraft('');
    load();
  }

  async function toggleUpvote(answerId: string) {
    const res = await api.post(`/community/answers/${answerId}/upvote`);
    setQuestion((prev) =>
      prev
        ? {
            ...prev,
            answers: prev.answers.map((a) =>
              a.id === answerId ? { ...a, upvoteCount: res.data.upvoteCount, upvotedByMe: res.data.upvotedByMe } : a
            ),
          }
        : prev
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AppNav />

      <main className="max-w-3xl mx-auto px-6 py-10 md:px-0">
        {isLoading && <p style={{ color: '#6F6F6F' }}>Loading…</p>}

        {!isLoading && question && (
          <>
            <h1 className="text-4xl sm:text-5xl mb-3" style={{ fontFamily: 'var(--font-display)', color: '#000000' }}>
              {question.title}
            </h1>
            <p className="text-sm mb-8" style={{ color: '#6F6F6F' }}>
              Asked by {question.author.name}
            </p>

            <p className="text-lg mb-6 leading-relaxed" style={{ color: '#000000' }}>
              {question.description}
            </p>

            <button onClick={toggleLike} className="text-sm mb-14" style={{ color: question.likedByMe ? '#000000' : '#6F6F6F' }}>
              {question.likedByMe ? '♥' : '♡'} {question.likeCount} likes
            </button>

            <h2 className="text-sm uppercase tracking-wide mb-6" style={{ color: '#999999' }}>
              {question.answers.length} answers
            </h2>

            <div className="flex flex-col divide-y mb-10" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
              {question.answers.length === 0 && (
                <p className="pb-6" style={{ color: '#6F6F6F' }}>
                  No answers yet — be the first to help.
                </p>
              )}
              {question.answers.map((a) => (
                <div key={a.id} className="py-6">
                  <p className="text-sm mb-2" style={{ color: '#999999' }}>
                    {a.author.name}
                  </p>
                  <p className="mb-3" style={{ color: '#000000' }}>
                    {a.body}
                  </p>
                  <button
                    onClick={() => toggleUpvote(a.id)}
                    className="text-sm"
                    style={{ color: a.upvotedByMe ? '#000000' : '#6F6F6F' }}
                  >
                    ▲ {a.upvoteCount}
                  </button>
                </div>
              ))}
            </div>

            <textarea
              value={answerDraft}
              onChange={(e) => setAnswerDraft(e.target.value)}
              placeholder="Write an answer…"
              rows={4}
              className="w-full mb-4 px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: 'rgba(0,0,0,0.15)' }}
            />
            <button
              onClick={submitAnswer}
              className="px-6 py-2.5 rounded-full text-sm"
              style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
            >
              Post answer
            </button>
          </>
        )}
      </main>
    </div>
  );
}
