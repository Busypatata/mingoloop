interface LangBubble {
  text: string;
  top: number; // % within container
  left: number; // % within container
  size: number; // px diameter
  color: 'turquoise' | 'coral' | 'light-turquoise' | 'muted-blue' | 'aqua' | 'deep-red';
  duration: number;
  delay: number;
  fontSize: string;
}

const COLOR_VAR: Record<LangBubble['color'], string> = {
  turquoise: 'var(--color-turquoise)',
  coral: 'var(--color-coral)',
  'light-turquoise': 'var(--color-light-turquoise)',
  'muted-blue': 'var(--color-muted-blue)',
  aqua: 'var(--color-aqua)',
  'deep-red': 'var(--color-deep-red)',
};

// Fixed, hand-placed bubbles echoing the reference composition — a ring of
// language names/scripts surrounding a soft abstract world map. Positions
// are percentages of the container so the whole thing stays responsive.
const BUBBLES: LangBubble[] = [
  { text: '日本語', top: 10, left: 47, size: 118, color: 'turquoise', duration: 8, delay: 0, fontSize: '1.15rem' },
  { text: '한국어', top: 16, left: 84, size: 98, color: 'coral', duration: 7.5, delay: 0.6, fontSize: '1rem' },
  { text: '中文', top: 20, left: 11, size: 84, color: 'coral', duration: 9, delay: 0.2, fontSize: '1rem' },
  { text: 'ไทย', top: 30, left: 97, size: 82, color: 'muted-blue', duration: 8.5, delay: 1, fontSize: '0.95rem' },
  { text: 'English', top: 40, left: 3, size: 100, color: 'turquoise', duration: 7, delay: 0.4, fontSize: '0.95rem' },
  { text: 'Қазақ тілі', top: 48, left: 99, size: 92, color: 'muted-blue', duration: 9.5, delay: 0.8, fontSize: '0.75rem' },
  { text: 'Tiếng Việt', top: 62, left: 95, size: 96, color: 'coral', duration: 8, delay: 1.4, fontSize: '0.82rem' },
  { text: 'Français', top: 61, left: 5, size: 94, color: 'muted-blue', duration: 7.8, delay: 0.3, fontSize: '0.92rem' },
  { text: 'Español', top: 72, left: 18, size: 104, color: 'coral', duration: 8.4, delay: 1.1, fontSize: '0.95rem' },
  { text: 'Deutsch', top: 74, left: 79, size: 100, color: 'turquoise', duration: 7.6, delay: 0.9, fontSize: '0.92rem' },
  { text: 'Ελληνικά', top: 87, left: 96, size: 78, color: 'muted-blue', duration: 9, delay: 1.6, fontSize: '0.78rem' },
  { text: 'ñ', top: 86, left: 45, size: 64, color: 'coral', duration: 6.5, delay: 0.5, fontSize: '1.3rem' },
];

export default function DiscoverWorldVisual() {
  return (
    <div
      className="relative w-full aspect-[11/10] max-w-[620px] mx-auto"
      aria-hidden="true"
    >
      {/* Soft organic "world" blobs — suggestive, not a literal map */}
      <svg viewBox="0 0 620 580" className="absolute inset-0 w-full h-full">
        <path
          d="M260 60c130-10 240 30 280 120s-10 190-120 230-260 30-330-60S90 150 150 100s70-30 110-40Z"
          fill="var(--color-muted-blue)"
          opacity={0.16}
        />
        <path
          d="M340 120c90 10 150 80 140 160s-90 130-190 120-160-70-160-150 60-140 210-130Z"
          fill="var(--color-aqua)"
          opacity={0.45}
        />
        <path
          d="M370 180c60-10 120 30 130 90s-40 110-110 120-140-20-150-80 30-110 130-130Z"
          fill="var(--color-coral)"
          opacity={0.08}
        />
      </svg>

      {/* Faint orbit ring + connector lines with small dots, echoing the reference */}
      <svg viewBox="0 0 620 580" className="absolute inset-0 w-full h-full">
        <ellipse
          cx="310"
          cy="290"
          rx="270"
          ry="150"
          fill="none"
          stroke="var(--color-muted-blue)"
          strokeWidth="1"
          opacity={0.35}
        />
        <path
          d="M120 210c60-20 130 10 150 70"
          fill="none"
          stroke="var(--color-turquoise)"
          strokeWidth="1.5"
          opacity={0.6}
        />
        <path
          d="M420 140c50 30 60 100 10 140"
          fill="none"
          stroke="var(--color-coral)"
          strokeWidth="1.5"
          opacity={0.5}
        />
        <path
          d="M180 400c70 20 160 10 210-40"
          fill="none"
          stroke="var(--color-muted-blue)"
          strokeWidth="1.5"
          opacity={0.5}
        />
        {[
          [130, 190],
          [438, 150],
          [200, 60],
          [560, 300],
          [70, 430],
          [330, 450],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={4} fill={i % 2 === 0 ? 'var(--color-coral)' : 'var(--color-turquoise)'} opacity={0.55} />
        ))}
      </svg>

      {/* Floating language bubbles */}
      {BUBBLES.map((b, i) => (
        <div
          key={i}
          className="absolute"
          style={{ top: `${b.top}%`, left: `${b.left}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="mingoloop-float" style={{ animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s` }}>
            <div
              className="rounded-full flex items-center justify-center text-center px-2"
              style={{
                width: b.size,
                height: b.size,
                fontFamily: 'var(--font-body)',
                fontSize: b.fontSize,
                fontWeight: 500,
                color: `color-mix(in srgb, ${COLOR_VAR[b.color]} 75%, #11110f)`,
                backgroundColor: `color-mix(in srgb, ${COLOR_VAR[b.color]} 16%, white)`,
                border: `1px solid color-mix(in srgb, ${COLOR_VAR[b.color]} 40%, white)`,
                boxShadow: '0 10px 26px rgba(17,17,15,0.06)',
              }}
            >
              {b.text}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
