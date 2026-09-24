interface TopicCount {
  name: string;
  count: number;
}

interface TopicsPanelProps {
  totalCount: number;
  topics: TopicCount[];
  active: string | null;
  onSelect: (category: string | null) => void;
}

function TopicIcon({ variant }: { variant: 'all' | 'topic' }) {
  if (variant === 'all') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10Z"
          stroke="var(--color-turquoise)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="var(--color-turquoise)" strokeWidth="1.6" />
      <path d="M9 12h6M12 9v6" stroke="var(--color-turquoise)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M9 6l6 6-6 6" stroke="#71818A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TopicsPanel({ totalCount, topics, active, onSelect }: TopicsPanelProps) {
  return (
    <div
      className="relative overflow-hidden p-6 flex flex-col"
      style={{
        backgroundColor: 'rgba(255,255,255,0.9)',
        border: '1px solid rgba(20,40,50,0.05)',
        borderRadius: 20,
        boxShadow: '0 8px 30px rgba(40,70,70,0.04)',
      }}
    >
      <h2 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-display)', color: '#183744', fontWeight: 400 }}>
        Community Topics
      </h2>

      <div className="flex flex-col gap-1">
        <button
          onClick={() => onSelect(null)}
          className="flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
          style={{ borderRadius: 18, backgroundColor: active === null ? '#EFFAF9' : 'transparent' }}
        >
          <TopicIcon variant="all" />
          <span className="flex-1 min-w-0">
            <span
              className="block text-sm"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 500, color: active === null ? 'color-mix(in srgb, var(--color-turquoise) 55%, #111820)' : '#111820' }}
            >
              All Posts
            </span>
            <span className="block text-xs" style={{ color: 'var(--color-app-text-muted)', fontFamily: 'var(--font-body)' }}>
              {totalCount}
            </span>
          </span>
          <Chevron />
        </button>

        {topics.map((topic) => (
          <button
            key={topic.name}
            onClick={() => onSelect(topic.name)}
            className="flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
            style={{ borderRadius: 18, backgroundColor: active === topic.name ? '#EFFAF9' : 'transparent' }}
          >
            <TopicIcon variant="topic" />
            <span className="flex-1 min-w-0">
              <span
                className="block text-sm truncate"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                  color: active === topic.name ? 'color-mix(in srgb, var(--color-turquoise) 55%, #111820)' : '#111820',
                }}
              >
                {topic.name}
              </span>
              <span className="block text-xs" style={{ color: 'var(--color-app-text-muted)', fontFamily: 'var(--font-body)' }}>
                {topic.count}
              </span>
            </span>
            <Chevron />
          </button>
        ))}
      </div>

      {/* Decorative language cluster, bottom-left */}
      <div className="relative mt-auto pt-10" aria-hidden="true">
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 130, height: 130, left: -30, bottom: -20, backgroundColor: 'var(--color-aqua)', opacity: 0.35 }}
        />
        <p
          className="relative text-sm leading-relaxed"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            color: 'color-mix(in srgb, var(--color-turquoise) 60%, #111820)',
            opacity: 0.75,
          }}
        >
          Bonjour
          <br />
          こんにちは
          <br />
          Hello
          <br />
          Hola <span aria-hidden="true">♡</span>
        </p>
      </div>
    </div>
  );
}
