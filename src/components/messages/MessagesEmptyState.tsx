export default function MessagesEmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 relative">
      <div className="relative w-full max-w-[280px] mb-8" aria-hidden="true">
        <svg viewBox="0 0 280 200" className="w-full h-auto overflow-visible">
          {/* Thin orbit lines */}
          <ellipse cx="140" cy="105" rx="120" ry="60" fill="none" stroke="var(--color-turquoise)" strokeWidth="1" opacity="0.25" />
          <path d="M40 60c-10 20-8 42 6 58" fill="none" stroke="var(--color-turquoise)" strokeWidth="1" opacity="0.3" strokeLinecap="round" />

          {/* Small decorative dots */}
          <circle cx="34" cy="52" r="3" fill="var(--color-turquoise)" opacity="0.5" />
          <circle cx="248" cy="70" r="2.5" fill="var(--color-muted-blue)" opacity="0.5" />
          <circle cx="230" cy="150" r="2.5" fill="var(--color-coral)" opacity="0.4" />
          <circle cx="20" cy="120" r="2" fill="var(--color-turquoise)" opacity="0.4" />

          {/* Paper plane */}
          <g transform="translate(190,28) rotate(18)">
            <path
              d="M0 18L34 0L20 34L15 20L0 18Z"
              fill="none"
              stroke="var(--color-turquoise)"
              strokeWidth="1.6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path d="M15 20L34 0" stroke="var(--color-turquoise)" strokeWidth="1.6" strokeLinecap="round" />
          </g>

          {/* Larger pale-teal speech bubble */}
          <path
            d="M46 78c0-17 15-30 34-30h30c19 0 34 13 34 30s-15 30-34 30H88l-16 14 2-15c-16-3-28-15-28-29Z"
            fill="var(--color-light-turquoise)"
            opacity="0.55"
          />
          <circle cx="83" cy="79" r="3.4" fill="#ffffff" opacity="0.9" />
          <circle cx="97" cy="79" r="3.4" fill="#ffffff" opacity="0.9" />
          <circle cx="111" cy="79" r="3.4" fill="#ffffff" opacity="0.9" />

          {/* Smaller pale-blue speech bubble, overlapping */}
          <path
            d="M124 110c0-14 13-25 29-25h24c16 0 29 11 29 25s-13 25-29 25l-10 12 1-12.6c-14-1.4-24-11.6-24-24.4Z"
            fill="var(--color-muted-blue)"
            opacity="0.45"
          />
          <circle cx="152" cy="111" r="3" fill="#ffffff" opacity="0.9" />
          <circle cx="164" cy="111" r="3" fill="#ffffff" opacity="0.9" />
          <circle cx="176" cy="111" r="3" fill="#ffffff" opacity="0.9" />
        </svg>
      </div>

      <h2
        className="text-3xl sm:text-4xl mb-3 text-center"
        style={{ fontFamily: 'var(--font-display)', color: '#183744', fontWeight: 400 }}
      >
        Select a conversation
      </h2>
      <p
        className="text-base text-center"
        style={{ color: '#71818A', fontFamily: 'var(--font-body)', lineHeight: 1.5, maxWidth: 400 }}
      >
        Choose a chat from your list to start messaging with your friends.
      </p>

      {/* Bottom-left decorative multilingual whispers */}
      <div
        className="hidden sm:block absolute left-6 bottom-6 pointer-events-none select-none"
        aria-hidden="true"
      >
        <div
          className="absolute rounded-full"
          style={{ width: 120, height: 120, left: -30, bottom: -20, backgroundColor: 'var(--color-aqua)', opacity: 0.4 }}
        />
        <p
          className="relative text-sm leading-relaxed"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'color-mix(in srgb, var(--color-turquoise) 60%, #111820)', opacity: 0.75 }}
        >
          Bonjour
          <br />
          こんにちは
          <br />
          Hello
          <br />
          Hola
        </p>
      </div>
    </div>
  );
}
