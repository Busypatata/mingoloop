import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppNav from '../components/AppNav';
import api from '../services/api';
import AbstractLanguageVisual from '../components/dashboard/AbstractLanguageVisual';
import FloatingLetters from '../components/dashboard/FloatingLetters';
import LanguageOverview from '../components/dashboard/LanguageOverview';
import ConversationsList from '../components/dashboard/ConversationsList';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import CommunityPulse from '../components/dashboard/CommunityPulse';
import MeetPeopleCarousel from '../components/dashboard/MeetPeopleCarousel';
import HomeDiscoveryCTA from '../components/dashboard/HomeDiscoveryCTA';
import type {
  CommunityQuestionSummary,
  ConversationSummary,
  DiscoverResult,
  Friend,
  NotificationItem,
} from '../types/user';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [, setFriends] = useState<Friend[]>([]);
  const [questions, setQuestions] = useState<CommunityQuestionSummary[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [discoverResults, setDiscoverResults] = useState<DiscoverResult[]>([]);

  useEffect(() => {
    api.get('/messages/conversations').then((res) => setConversations(res.data)).catch(() => {});
    api.get('/friends').then((res) => setFriends(res.data.friends)).catch(() => {});
    api.get('/community/questions').then((res) => setQuestions(res.data)).catch(() => {});
    api.get('/notifications').then((res) => setNotifications(res.data)).catch(() => {});
    api.get('/users/discover').then((res) => setDiscoverResults(res.data.results)).catch(() => {});
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-landing-bg)' }}>
      <AppNav />

      <div className="relative px-6 py-10 md:px-16">
        <FloatingLetters />

        <main className="relative z-10 max-w-5xl mx-auto">
          {/* Hero */}
          <section className="flex flex-col lg:flex-row items-center gap-12 mb-24">
            <div className="flex-1 w-full animate-fade-rise">
              <h1
                className="text-4xl sm:text-5xl md:text-6xl mb-4"
                style={{ fontFamily: 'var(--font-display)', color: '#111111', lineHeight: 1.05 }}
              >
                {getGreeting()},
                <br />
                <span style={{ color: 'var(--color-coral)' }}>{user.name.split(' ')[0]}.</span>
              </h1>
              <p className="text-lg mb-9 animate-fade-rise-delay" style={{ color: '#5A5A5A' }}>
                What are we discovering today?
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-rise-delay-2">
                <Link
                  to="/discover"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm transition-transform duration-200 hover:scale-[1.03] hover:gap-3"
                  style={{ backgroundColor: 'var(--color-coral)', color: '#FFFFFF' }}
                >
                  Discover people <span aria-hidden="true">→</span>
                </Link>
                <Link
                  to="/community"
                  className="inline-flex items-center px-7 py-3.5 rounded-full text-sm border transition-colors"
                  style={{ borderColor: 'var(--color-turquoise)', color: 'var(--color-turquoise)' }}
                >
                  Explore the community
                </Link>
              </div>
            </div>

            <div className="flex-1 w-full flex justify-center">
              <AbstractLanguageVisual />
            </div>
          </section>

          {/* Languages */}
          <section className="mb-16">
            <h2 className="text-2xl mb-6" style={{ fontFamily: 'var(--font-display)', color: '#111111' }}>
              Your languages
            </h2>
            <LanguageOverview native={user.nativeLanguages} learning={user.learningLanguages} />
          </section>

          {/* Conversations + Activity + Community */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <ConversationsList conversations={conversations} />
            <ActivityFeed notifications={notifications} />
            <CommunityPulse questions={questions} />
          </section>

          {/* Meet people */}
          <section className="mb-20">
            <MeetPeopleCarousel people={discoverResults} />
          </section>

          <HomeDiscoveryCTA />

          <p className="text-center text-sm mt-16 mb-4 flex items-center justify-center gap-2" style={{ color: '#9A9893' }}>
            <span aria-hidden="true" style={{ color: 'var(--color-coral)' }}>
              ♥
            </span>
            Language connects us.
          </p>
        </main>
      </div>
    </div>
  );
}
