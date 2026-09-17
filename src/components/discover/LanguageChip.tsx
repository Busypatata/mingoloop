interface LanguageChipProps {
  label: string;
  tone?: 'turquoise' | 'coral' | 'muted-blue' | 'aqua';
  active?: boolean;
  onClick?: () => void;
  as?: 'button' | 'span';
}

const TONE_VAR: Record<NonNullable<LanguageChipProps['tone']>, string> = {
  turquoise: 'var(--color-turquoise)',
  coral: 'var(--color-coral)',
  'muted-blue': 'var(--color-muted-blue)',
  aqua: 'var(--color-aqua)',
};

export default function LanguageChip({ label, tone = 'aqua', active = false, onClick, as = 'span' }: LanguageChipProps) {
  const accent = TONE_VAR[tone];
  const style = {
    fontFamily: 'var(--font-body)',
    color: active ? '#ffffff' : `color-mix(in srgb, ${accent} 70%, #11110f)`,
    backgroundColor: active ? accent : `color-mix(in srgb, ${accent} 12%, white)`,
    borderColor: `color-mix(in srgb, ${accent} 45%, white)`,
  };

  if (as === 'button') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="discover-chip text-sm px-4 py-1.5 rounded-full border transition-colors"
        style={style}
      >
        {label}
      </button>
    );
  }

  return (
    <span className="text-xs px-3 py-1 rounded-full border" style={style}>
      {label}
    </span>
  );
}
