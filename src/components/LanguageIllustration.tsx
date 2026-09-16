export default function LanguageIllustration() {
  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto" aria-hidden="true">
      {/* Organic background blobs */}
      <svg viewBox="0 0 560 560" className="absolute inset-0 w-full h-full">
        <path
          d="M420 60c90 20 150 110 130 200s-120 160-220 150S140 340 130 240 200 40 420 60Z"
          fill="var(--color-muted-blue)"
          opacity={0.35}
        />
        <path
          d="M120 260c60-40 150-30 190 30s10 140-60 170-160 0-190-70 0-100 60-130Z"
          fill="var(--color-aqua)"
          opacity={0.6}
        />
        <path
          d="M330 340c70 0 130 50 130 110s-70 90-140 80-110-60-100-120 40-70 110-70Z"
          fill="var(--color-light-turquoise)"
          opacity={0.4}
        />
      </svg>

      {/* Thin curved connection lines */}
      <svg viewBox="0 0 560 560" className="absolute inset-0 w-full h-full">
        <path
          d="M330 90c30 60-20 110-70 100s-90 40-50 90 130 30 150-30"
          fill="none"
          stroke="var(--color-turquoise)"
          strokeWidth="2"
        />
        <path
          d="M170 330c40-30 100-10 140 30s110 20 130-40"
          fill="none"
          stroke="var(--color-coral)"
          strokeWidth="2"
        />
        <path
          d="M400 200c50 10 70 70 40 120s-100 60-140 20"
          fill="none"
          stroke="var(--color-muted-blue)"
          strokeWidth="1.5"
        />
      </svg>

      {/* Decorative language characters */}
      <span
        className="absolute select-none"
        style={{ top: '10%', right: '18%', fontFamily: 'var(--font-display)', fontSize: '2.75rem', color: 'var(--color-coral)', opacity: 0.85 }}
      >
        あ
      </span>
      <span
        className="absolute select-none"
        style={{ bottom: '8%', right: '6%', fontFamily: 'var(--font-display)', fontSize: '2.25rem', color: 'var(--color-muted-blue)' }}
      >
        A
      </span>
      <span
        className="absolute select-none"
        style={{ top: '46%', left: '4%', fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--color-turquoise)', opacity: 0.9 }}
      >
        你
      </span>

      {/* Speech bubbles */}
      <div
        className="absolute rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1"
        style={{ top: '20%', left: '10%', backgroundColor: 'var(--color-turquoise)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
      </div>
      <div
        className="absolute rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1"
        style={{ top: '58%', right: '20%', backgroundColor: 'var(--color-coral)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
      </div>

      {/* Small decorative marks */}
      <div
        className="absolute grid grid-cols-3 gap-1"
        style={{ top: '30%', right: '30%' }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-turquoise)' }} />
        ))}
      </div>
      <span className="absolute text-lg" style={{ top: '68%', left: '30%', color: 'var(--color-coral)', opacity: 0.6 }}>
        +
      </span>
      <span className="absolute text-lg" style={{ top: '74%', left: '35%', color: 'var(--color-coral)', opacity: 0.4 }}>
        +
      </span>
    </div>
  );
}
