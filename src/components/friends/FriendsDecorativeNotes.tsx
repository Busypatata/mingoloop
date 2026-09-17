export default function FriendsDecorativeNotes() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Left blob + note */}
      <div
        className="hidden lg:block absolute rounded-full"
        style={{
          top: -40,
          left: -120,
          width: 280,
          height: 280,
          backgroundColor: 'var(--color-aqua)',
          opacity: 0.35,
          filter: 'blur(2px)',
        }}
      />
      <p
        className="hidden lg:block absolute mingoloop-float"
        style={{
          top: 90,
          left: 24,
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: '1.05rem',
          lineHeight: 1.35,
          color: 'color-mix(in srgb, var(--color-turquoise) 65%, #111820)',
          opacity: 0.7,
          transform: 'rotate(-4deg)',
          animationDuration: '9s',
        }}
      >
        Different
        <br />
        languages
        <br />
        Better
        <br />
        conversations
      </p>

      {/* Right circular outline + note */}
      <svg
        className="hidden lg:block absolute"
        style={{ top: 40, right: -60, opacity: 0.4 }}
        width="200"
        height="200"
        viewBox="0 0 200 200"
      >
        <circle cx="100" cy="100" r="90" fill="none" stroke="var(--color-muted-blue)" strokeWidth="1" />
      </svg>
      <p
        className="hidden lg:block absolute mingoloop-float text-right"
        style={{
          top: 70,
          right: 40,
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: '1.05rem',
          lineHeight: 1.35,
          color: 'color-mix(in srgb, var(--color-coral) 55%, #111820)',
          opacity: 0.7,
          transform: 'rotate(3deg)',
          animationDuration: '8s',
          animationDelay: '0.6s',
        }}
      >
        Language
        <br />
        brings people
        <br />
        together <span aria-hidden="true">♥</span>
      </p>
    </div>
  );
}
