interface Bubble {
  label: string;
  top: number;
  left: number;
  w: number;
  h: number;
  tone: 'turquoise' | 'coral' | 'muted-blue';
  duration: number;
  delay: number;
}

const BUBBLES: Bubble[] = [
  { label: '日本語', top: 10, left: 34, w: 100, h: 52, tone: 'turquoise', duration: 8, delay: 0 },
  { label: '한국어', top: 6, left: 70, w: 96, h: 50, tone: 'muted-blue', duration: 7.5, delay: 0.4 },
  { label: 'あ', top: 28, left: 4, w: 56, h: 56, tone: 'turquoise', duration: 9, delay: 0.8 },
  { label: 'Español', top: 26, left: 92, w: 118, h: 56, tone: 'coral', duration: 8.4, delay: 0.2 },
  { label: '中文', top: 46, left: 96, w: 86, h: 50, tone: 'turquoise', duration: 7.8, delay: 1.1 },
  { label: 'Français', top: 46, left: 0, w: 118, h: 54, tone: 'muted-blue', duration: 8.6, delay: 0.6 },
  { label: 'English', top: 66, left: 6, w: 114, h: 54, tone: 'coral', duration: 7.2, delay: 1.3 },
  { label: 'ñ', top: 66, left: 98, w: 56, h: 56, tone: 'muted-blue', duration: 9.4, delay: 0.3 },
  { label: '한', top: 82, left: 84, w: 56, h: 56, tone: 'turquoise', duration: 8, delay: 1.5 },
  { label: '文', top: 84, left: 40, w: 78, h: 50, tone: 'coral', duration: 7.6, delay: 0.9 },
];

const TONE_VAR: Record<Bubble['tone'], string> = {
  turquoise: 'var(--color-light-turquoise)',
  coral: 'var(--color-coral)',
  'muted-blue': 'var(--color-muted-blue)',
};

export default function AuthGlobe() {
  return (
    <div className="relative w-full aspect-square max-w-[640px] mx-auto" aria-hidden="true">
      <svg viewBox="0 0 640 640" className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="auth-globe-gradient" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="var(--color-light-turquoise)" stopOpacity="0.6" />
            <stop offset="60%" stopColor="var(--color-aqua)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--color-muted-blue)" stopOpacity="0.35" />
          </radialGradient>
        </defs>

        <circle cx="320" cy="320" r="200" fill="url(#auth-globe-gradient)" />
        <ellipse cx="320" cy="320" rx="200" ry="82" fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.55" />
        <ellipse cx="320" cy="320" rx="130" ry="200" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.4" />
        <circle cx="320" cy="320" r="200" fill="none" stroke="var(--color-turquoise)" strokeWidth="1" opacity="0.35" />

        <circle cx="210" cy="240" r="4" fill="var(--color-coral)" opacity="0.7" />
        <circle cx="360" cy="270" r="3" fill="var(--color-coral)" opacity="0.6" />
        <path d="M210 240c50-20 100 5 150 30" fill="none" stroke="var(--color-coral)" strokeWidth="1" strokeDasharray="2 5" opacity="0.4" />

        {/* Small decorative leaves */}
        <g transform="translate(150,120) rotate(-20)">
          <path d="M0 10C0 3 6 0 12 0S24 3 24 10 18 22 12 24C6 22 0 17 0 10Z" fill="var(--color-turquoise)" opacity="0.4" />
        </g>
        <g transform="translate(490,150) rotate(25)">
          <path d="M0 8C0 3 5 0 9 0S18 3 18 8 14 17 9 18C4 17 0 13 0 8Z" fill="var(--color-coral)" opacity="0.4" />
        </g>
        <g transform="translate(520,470) rotate(-15)">
          <path d="M0 9C0 4 5 0 10 0S20 4 20 9 15 19 10 20C5 19 0 14 0 9Z" fill="var(--color-turquoise)" opacity="0.35" />
        </g>
        <g transform="translate(110,480) rotate(35)">
          <path d="M0 8C0 3 5 0 9 0S18 3 18 8 14 17 9 18C4 17 0 13 0 8Z" fill="var(--color-coral)" opacity="0.35" />
        </g>
      </svg>

      {BUBBLES.map((b, i) => (
        <div
          key={b.label + i}
          className="absolute"
          style={{ top: `${b.top}%`, left: `${b.left}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="mingoloop-float" style={{ animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s` }}>
            <div
              className="rounded-full flex items-center justify-center text-center px-3"
              style={{
                width: b.w,
                height: b.h,
                fontFamily: 'var(--font-display)',
                fontSize: b.w > 90 ? '1.1rem' : '1rem',
                color: b.tone === 'coral' ? '#ffffff' : '#123F4B',
                backgroundColor: TONE_VAR[b.tone],
                boxShadow: '0 10px 28px rgba(20,50,60,0.08)',
              }}
            >
              {b.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
