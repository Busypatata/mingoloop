import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppNav from '../components/AppNav';
import { useAuth } from '../context/AuthContext';
import FloatingLetters from '../components/dashboard/FloatingLetters';
import FriendsDecorativeNotes from '../components/friends/FriendsDecorativeNotes';
import CommunityIllustration from '../components/community/CommunityIllustration';
import TopicsPanel from '../components/community/TopicsPanel';
import PostComposer from '../components/community/PostComposer';
import PostCard from '../components/community/PostCard';
import type { CommunityQuestionSummary } from '../types/user';

export default function Community() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<CommunityQuestionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  function load() {
    setIsLoading(true);
    setLoadError(false);
    api
      .get('/community/questions')
      .then((res) => setQuestions(res.data))
      .catch(() => setLoadError(true))
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

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const q of questions) {
      if (!q.category) continue;
      counts.set(q.category, (counts.get(q.category) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (!activeCategory) return questions;
    return questions.filter((q) => q.category === activeCategory);
  }, [questions, activeCategory]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7FCFB' }}>
      <AppNav />

      <div className="relative px-6 pt-8 pb-24 md:px-10">
        <FriendsDecorativeNotes />
        <FloatingLetters />

        <main className="relative z-10 max-w-[1200px] mx-auto">
          {/* Hero */}
          <section className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-10 lg:mb-14 animate-fade-rise">
            <div className="max-w-xl">
              <h1
                className="text-6xl sm:text-7xl mb-4"
                style={{ fontFamily: 'var(--font-display)', color: '#111820', lineHeight: 1, fontWeight: 400 }}
              >
                Community.
              </h1>
              <p className="text-lg sm:text-xl" style={{ color: '#617481', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                Questions, corrections, and curiosity from fellow learners.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-4 flex-shrink-0">
              <button
                onClick={() => setShowForm(true)}
                className="px-7 rounded-full text-sm whitespace-nowrap transition-colors"
                style={{ height: 50, backgroundColor: '#111820', color: '#ffffff', fontFamily: 'var(--font-body)', fontWeight: 500 }}
              >
                Ask the community
              </button>

              <div className="relative flex items-center gap-3">
                <p
                  className="hidden lg:block text-right text-sm leading-snug"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    color: 'color-mix(in srgb, var(--color-turquoise) 60%, #111820)',
                    opacity: 0.75,
                  }}
                >
                  Real people
                  <br />
                  Real conversations
                  <br />
                  Global minds
                </p>
                <CommunityIllustration />
              </div>
            </div>
          </section>

          {/* Body */}
          {isLoading && (
            <p style={{ color: 'var(--color-app-text-secondary)', fontFamily: 'var(--font-body)' }}>Loading…</p>
          )}

          {!isLoading && loadError && (
            <div>
              <p className="text-sm mb-3" style={{ color: '#B3261E', fontFamily: 'var(--font-body)' }}>
                Couldn&rsquo;t load the community. Please try again.
              </p>
              <button
                onClick={load}
                className="text-sm px-5 py-2 rounded-full"
                style={{ backgroundColor: 'var(--color-coral)', color: '#ffffff', fontFamily: 'var(--font-body)' }}
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !loadError && (
            <div className="grid lg:grid-cols-[320px_1fr] gap-4 items-start">
              <TopicsPanel totalCount={questions.length} topics={topics} active={activeCategory} onSelect={setActiveCategory} />

              <div className="flex flex-col gap-2.5 min-w-0">
                <PostComposer
                  userName={user?.name ?? 'You'}
                  userAvatar={user?.avatar}
                  expanded={showForm}
                  onExpand={() => setShowForm(true)}
                  onCollapse={() => setShowForm(false)}
                  title={title}
                  onTitleChange={setTitle}
                  description={description}
                  onDescriptionChange={setDescription}
                  language={language}
                  onLanguageChange={setLanguage}
                  error={error}
                  onSubmit={handleSubmit}
                />

                {questions.length === 0 ? (
                  <div
                    className="p-10 text-center"
                    style={{ backgroundColor: '#ffffff', border: '1px solid rgba(20,40,50,0.06)', borderRadius: 18 }}
                  >
                    <p className="text-lg mb-2" style={{ fontFamily: 'var(--font-display)', color: '#111820' }}>
                      Be the first to start a conversation.
                    </p>
                    <p className="text-sm" style={{ color: '#71818A', fontFamily: 'var(--font-body)' }}>
                      Ask a question, share a correction, or start a discussion with fellow learners.
                    </p>
                  </div>
                ) : filteredQuestions.length === 0 ? (
                  <p className="py-8 text-center text-sm" style={{ color: '#71818A', fontFamily: 'var(--font-body)' }}>
                    No posts in &ldquo;{activeCategory}&rdquo; yet.
                  </p>
                ) : (
                  filteredQuestions.map((q) => <PostCard key={q.id} question={q} />)
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
