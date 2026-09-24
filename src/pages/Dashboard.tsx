import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AppNav from '../components/AppNav';
import api from '../services/api';
import FloatingLetters from '../components/dashboard/FloatingLetters';
import DashboardDecorativeNotes from '../components/dashboard/DashboardDecorativeNotes';
import DashboardIllustration from '../components/dashboard/DashboardIllustration';
import LanguageProgressCard from '../components/dashboard/LanguageProgressCard';
import LanguageOverview from '../components/dashboard/LanguageOverview';
import FeatureCard from '../components/dashboard/FeatureCard';
import MeetPeopleCarousel from '../components/dashboard/MeetPeopleCarousel';
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

function ConversationsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5h16v11H8l-4 4V5Z"
        stroke="var(--color-turquoise)"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 4h9l3 3v13H6V4Z"
        stroke="var(--color-deep-red)"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M9 10h6M9 14h6" stroke="var(--color-deep-red)" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CommunityIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.4" stroke="var(--color-turquoise)" strokeWidth="1.7" />
      <circle cx="17" cy="9.5" r="2.6" stroke="var(--color-turquoise)" strokeWidth="1.7" />
      <path d="M3 20c0-4.5 3-7 6-7s6 2.5 6 7M14.5 20c0-3 1.7-5.5 5-5.5" stroke="var(--color-turquoise)" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
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

  const primaryNative = user.nativeLanguages[0];
  const primaryLearning = user.learningLanguages[0];
  const shownCount = (primaryNative ? 1 : 0) + (primaryLearning ? 1 : 0);
  const hasMoreLanguages = user.nativeLanguages.length + user.learningLanguages.length > shownCount;

  const conversationsCta =
    conversations.length > 0
      ? { label: 'View your conversations', to: '/messages', tone: 'turquoise' as const }
      : { label: 'Find conversation partners', to: '/discover', tone: 'turquoise' as const };
  const conversationsDescription =
    conversations.length > 0
      ? `You have ${conversations.length} active conversation${conversations.length === 1 ? '' : 's'}.`
      : 'Start a conversation with native speakers and fellow learners.';

  const latestNotification = notifications[0]?.message;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FCFBF8' }}>
      <AppNav />

      <div className="relative px-6 pt-8 pb-24 md:px-10">
        <DashboardDecorativeNotes />
        <FloatingLetters />

        <main className="relative z-10 max-w-[1240px] mx-auto">
          {/* Hero */}
          <section className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-8 mb-10 lg:mb-16 animate-fade-rise">
            <div className="lg:flex-1 lg:max-w-sm">
              <h1
                className="text-6xl sm:text-7xl mb-4"
                style={{ fontFamily: 'var(--font-display)', color: '#111111', lineHeight: 0.98, fontWeight: 400 }}
              >
                {getGreeting()},
                <br />
                <span style={{ color: 'var(--color-coral)' }}>{user.name.split(' ')[0]}.</span>
              </h1>
              <p className="text-lg mb-2" style={{ color: '#123F4B', fontFamily: 'var(--font-body)' }}>
                Ready to learn something new today?
              </p>
              <p className="text-sm" style={{ color: '#617481', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                Practice languages, meet people, and explore cultures from around the world.
              </p>
            </div>

            <div className="flex justify-center lg:flex-none flex-shrink-0">
              <DashboardIllustration />
            </div>

            {(primaryNative || primaryLearning) && (
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 lg:flex-1">
                {primaryNative && <LanguageProgressCard entry={primaryNative} variant="native" />}
                {primaryLearning && <LanguageProgressCard entry={primaryLearning} variant="learning" />}
              </div>
            )}
          </section>

          {hasMoreLanguages && (
            <section className="mb-12">
              <h2 className="text-xl mb-4" style={{ fontFamily: 'var(--font-display)', color: '#111111' }}>
                Your languages
              </h2>
              <LanguageOverview native={user.nativeLanguages} learning={user.learningLanguages} />
            </section>
          )}

          {/* Three feature cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <FeatureCard
              icon={<ConversationsIcon />}
              iconBg="#DDF4F4"
              title="Your conversations"
              description={conversationsDescription}
              cta={conversationsCta}
            />
            <FeatureCard
              icon={<ActivityIcon />}
              iconBg="#FFF0F0"
              title="Activity"
              description={
                latestNotification
                  ? `${notifications.length} update${notifications.length === 1 ? '' : 's'} — latest: ${latestNotification}`
                  : 'Keep your learning journey active and consistent.'
              }
            />
            <FeatureCard
              icon={<CommunityIcon />}
              iconBg="#DDF4F4"
              title="What's being asked"
              description={
                questions.length > 0
                  ? `${questions.length} question${questions.length === 1 ? '' : 's'} from fellow learners right now.`
                  : 'Explore questions, corrections and helpful tips from the community.'
              }
              cta={{ label: 'Ask the community', to: '/community', tone: 'coral' }}
            />
          </section>

          {/* Meet people */}
          <section>
            <MeetPeopleCarousel people={discoverResults} />
          </section>
        </main>
      </div>
    </div>
  );
}
