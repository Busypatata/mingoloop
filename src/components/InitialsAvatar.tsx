const PALETTE = ['var(--color-turquoise)', 'var(--color-coral)', 'var(--color-muted-blue)'];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + second).toUpperCase();
}

export default function InitialsAvatar({
  name,
  size = 40,
}: {
  name: string;
  size?: number;
}) {
  const bg = colorFor(name || '?');
  return (
    <div
      className="flex items-center justify-center rounded-full flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: `color-mix(in srgb, ${bg} 18%, white)`,
        color: bg,
        fontFamily: 'var(--font-display)',
        fontSize: size * 0.4,
        border: `1px solid ${bg}`,
      }}
    >
      {initialsFor(name)}
    </div>
  );
}
