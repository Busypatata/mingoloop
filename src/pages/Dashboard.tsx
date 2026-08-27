import { useAuth } from '../context/AuthContext';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white px-6 py-10 md:px-16">
      <header className="flex justify-between items-center max-w-5xl mx-auto mb-16">
        <span
          className="text-2xl tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: '#000000' }}
        >
          MingoLoop<sup className="text-sm align-super">®</sup>
        </span>
        <button onClick={logout} className="text-sm" style={{ color: '#6F6F6F' }}>
          Log out
        </button>
      </header>

      <main className="max-w-5xl mx-auto">
        <h1
          className="text-4xl sm:text-5xl mb-2"
          style={{ fontFamily: 'var(--font-display)', color: '#000000' }}
        >
          {getGreeting()}, {user.name.split(' ')[0]}.
        </h1>
        <p className="text-lg mb-16" style={{ color: '#6F6F6F' }}>
          What are we discovering today?
        </p>

        <section className="mb-16">
          <h2 className="text-sm uppercase tracking-wide mb-4" style={{ color: '#999999' }}>
            Your languages
          </h2>
          {user.nativeLanguages.length === 0 && user.learningLanguages.length === 0 ? (
            <p style={{ color: '#6F6F6F' }}>Nothing here yet.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {user.nativeLanguages.map((l) => (
                <span
                  key={`native-${l.language}`}
                  className="px-4 py-2 rounded-full text-sm border"
                  style={{ borderColor: 'rgba(0,0,0,0.1)' }}
                >
                  {l.language} — Native
                </span>
              ))}
              {user.learningLanguages.map((l) => (
                <span
                  key={`learning-${l.language}`}
                  className="px-4 py-2 rounded-full text-sm border"
                  style={{ borderColor: 'rgba(0,0,0,0.1)' }}
                >
                  {l.language} — Learning
                  {l.proficiency ? ` · ${l.proficiency}` : ''}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="mb-16">
          <h2 className="text-sm uppercase tracking-wide mb-4" style={{ color: '#999999' }}>
            People you may know
          </h2>
          <p style={{ color: '#6F6F6F' }}>
            Nothing here yet — head to Discover to find your language people.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-sm uppercase tracking-wide mb-4" style={{ color: '#999999' }}>
            Continue conversations
          </h2>
          <p style={{ color: '#6F6F6F' }}>Start a conversation.</p>
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wide mb-4" style={{ color: '#999999' }}>
            Your activity
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: 'Conversations', value: 0 },
              { label: 'New friends', value: 0 },
              { label: 'Sessions', value: 0 },
              { label: 'Languages practiced', value: user.learningLanguages.length },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="text-3xl"
                  style={{ fontFamily: 'var(--font-display)', color: '#000000' }}
                >
                  {stat.value}
                </p>
                <p className="text-sm" style={{ color: '#6F6F6F' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
