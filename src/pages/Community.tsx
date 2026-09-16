import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppNav from '../components/AppNav';
import type { CommunityQuestionSummary } from '../types/user';

export default function Community() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<CommunityQuestionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [error, setError] = useState<string | null>(null);

  function load() {
    setIsLoading(true);
    api
      .get('/community/questions')
      .then((res) => setQuestions(res.data))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      setError('A title and description are required.');
      return;
    }
    try {
      const res = await api.post('/community/questions', { title, description, language });
      navigate(`/community/${res.data.id}`);
    } catch {
      setError('Could not publish your question. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <AppNav />

      <main className="max-w-3xl mx-auto px-6 py-10 md:px-0">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-4xl sm:text-5xl" style={{ fontFamily: 'var(--font-display)', color: '#000000' }}>
            Community.
          </h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-5 py-2.5 rounded-full text-sm"
            style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
          >
            Ask the community
          </button>
        </div>
        <p className="text-lg mb-12" style={{ color: '#6F6F6F' }}>
          Questions, corrections, and curiosity from fellow learners.
        </p>

        {showForm && (
          <div className="mb-14 border rounded-2xl p-6" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full mb-4 px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: 'rgba(0,0,0,0.15)' }}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ask your question…"
              rows={4}
              className="w-full mb-4 px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: 'rgba(0,0,0,0.15)' }}
            />
            <input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="Language (optional)"
              className="w-full mb-4 px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: 'rgba(0,0,0,0.15)' }}
            />
            {error && (
              <p className="text-sm mb-3" style={{ color: '#B3261E' }}>
                {error}
              </p>
            )}
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-full text-sm"
              style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
            >
              Publish question
            </button>
          </div>
        )}

        {isLoading && <p style={{ color: '#6F6F6F' }}>Loading…</p>}
        {!isLoading && questions.length === 0 && (
          <p style={{ color: '#6F6F6F' }}>Ask the first question.</p>
        )}

        <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          {questions.map((q) => (
            <Link key={q.id} to={`/community/${q.id}`} className="py-6 block">
              <h3 className="text-xl mb-1" style={{ fontFamily: 'var(--font-display)', color: '#000000' }}>
                {q.title}
              </h3>
              <p className="text-sm mb-2" style={{ color: '#6F6F6F' }}>
                Asked by {q.author.name}
              </p>
              <div className="flex items-center gap-4 text-sm" style={{ color: '#999999' }}>
                <span>{q.answerCount} answers</span>
                <span>{q.likeCount} likes</span>
                {q.language && <span>{q.language}</span>}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
