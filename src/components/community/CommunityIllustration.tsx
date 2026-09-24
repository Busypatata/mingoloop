export default function CommunityIllustration() {
  return (
    <div className="relative w-[220px] h-[160px] flex-shrink-0" aria-hidden="true">
      <svg viewBox="0 0 220 160" className="absolute inset-0 w-full h-full overflow-visible">
        {/* Soft mint halo behind the figures */}
        <circle cx="110" cy="80" r="66" fill="var(--color-aqua)" opacity="0.35" />

        {/* Thin orbit line */}
        <ellipse cx="110" cy="82" rx="88" ry="46" fill="none" stroke="var(--color-turquoise)" strokeWidth="1" opacity="0.3" />

        {/* Paper plane, upper right */}
        <g transform="translate(168,18) rotate(20)">
          <path
            d="M0 14L26 0L15 26L11 15L0 14Z"
            fill="none"
            stroke="var(--color-turquoise)"
            strokeWidth="1.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>

        {/* Small decorative dots */}
        <circle cx="26" cy="34" r="2.6" fill="var(--color-coral)" opacity="0.5" />
        <circle cx="196" cy="100" r="2.4" fill="var(--color-muted-blue)" opacity="0.5" />
        <circle cx="18" cy="118" r="2" fill="var(--color-turquoise)" opacity="0.45" />

        {/* Figure 1 — left */}
        <g transform="translate(46,58)">
          <circle r="24" fill="var(--color-light-turquoise)" opacity="0.55" />
          <circle cy="-4" r="9" fill="#ffffff" opacity="0.9" />
          <path d="M-13 16c0-9 7-14 13-14s13 5 13 14" fill="#ffffff" opacity="0.9" />
        </g>

        {/* Figure 2 — center, slightly higher */}
        <g transform="translate(110,42)">
          <circle r="26" fill="var(--color-aqua)" opacity="0.65" />
          <circle cy="-4" r="9.5" fill="#ffffff" opacity="0.95" />
          <path d="M-14 17c0-9.5 7.5-15 14-15s14 5.5 14 15" fill="#ffffff" opacity="0.95" />
        </g>

        {/* Figure 3 — right */}
        <g transform="translate(172,66)">
          <circle r="22" fill="var(--color-muted-blue)" opacity="0.5" />
          <circle cy="-3" r="8" fill="#ffffff" opacity="0.9" />
          <path d="M-12 14c0-8 6-12 12-12s12 4 12 12" fill="#ffffff" opacity="0.9" />
        </g>

        {/* Speech bubble near figure 2 */}
        <g transform="translate(128,8)">
          <rect x="0" y="0" width="30" height="18" rx="9" fill="var(--color-light-turquoise)" opacity="0.7" />
          <circle cx="9" cy="9" r="1.6" fill="#ffffff" />
          <circle cx="15" cy="9" r="1.6" fill="#ffffff" />
          <circle cx="21" cy="9" r="1.6" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}
