export default function DashboardIllustration() {
  return (
    <div className="relative w-[230px] h-[200px]" aria-hidden="true">
      <svg viewBox="0 0 230 200" className="absolute inset-0 w-full h-full overflow-visible">
        {/* Soft mint halo */}
        <circle cx="115" cy="120" r="78" fill="var(--color-aqua)" opacity="0.4" />
        <ellipse cx="115" cy="150" rx="60" ry="14" fill="var(--color-muted-blue)" opacity="0.25" />

        {/* Paper plane */}
        <g transform="translate(178,26) rotate(18)">
          <path
            d="M0 14L26 0L15 26L11 15L0 14Z"
            fill="none"
            stroke="var(--color-turquoise)"
            strokeWidth="1.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>

        {/* Small dotted trail */}
        <path d="M30 60c10 10 14 24 8 38" fill="none" stroke="var(--color-turquoise)" strokeWidth="1.4" strokeDasharray="1 6" strokeLinecap="round" opacity="0.5" />

        {/* Person — shoulders + head */}
        <path d="M55 190c0-30 22-46 60-46s60 16 60 46" fill="var(--color-turquoise)" />
        <circle cx="115" cy="104" r="34" fill="#F4CBA8" />
        <path d="M83 96c0-20 14-34 32-34s32 14 32 30c-8-4-14-10-16-16-6 10-24 16-48 12v8Z" fill="#183744" />

        {/* Laptop */}
        <rect x="76" y="150" width="78" height="4" rx="2" fill="#183744" opacity="0.85" />
        <path d="M84 150l4-30h54l4 30Z" fill="#ffffff" stroke="rgba(20,40,50,0.15)" strokeWidth="1.5" />
        <rect x="94" y="128" width="42" height="18" rx="2" fill="var(--color-light-turquoise)" opacity="0.6" />

        {/* Speech bubbles */}
        <g transform="translate(20,30)">
          <rect x="0" y="0" width="52" height="26" rx="13" fill="var(--color-turquoise)" />
          <text x="26" y="17" textAnchor="middle" fontSize="11" fill="#ffffff" fontFamily="var(--font-body)">
            Hello
          </text>
        </g>
        <g transform="translate(88,4)">
          <rect x="0" y="0" width="70" height="26" rx="13" fill="#ffffff" stroke="rgba(20,40,50,0.1)" />
          <text x="35" y="17" textAnchor="middle" fontSize="10" fill="#123F4B" fontFamily="var(--font-body)">
            こんにちは
          </text>
        </g>
        <g transform="translate(168,58)">
          <rect x="0" y="0" width="52" height="26" rx="13" fill="var(--color-coral)" />
          <text x="26" y="17" textAnchor="middle" fontSize="11" fill="#ffffff" fontFamily="var(--font-body)">
            Hola
          </text>
        </g>

        {/* Tiny decorative heart + dots */}
        <path
          d="M40 96c-4-5-11-3-11 3 0 5 6 9 11 13 5-4 11-8 11-13 0-6-7-8-11-3Z"
          fill="var(--color-coral)"
          opacity="0.5"
        />
        <circle cx="200" cy="120" r="3" fill="var(--color-turquoise)" opacity="0.5" />
        <circle cx="18" cy="150" r="2.5" fill="var(--color-coral)" opacity="0.4" />
      </svg>
    </div>
  );
}
