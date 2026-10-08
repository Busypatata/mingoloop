export default function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative flex-shrink-0 transition-colors duration-200"
      style={{
        width: 40,
        height: 22,
        borderRadius: 999,
        backgroundColor: checked ? 'var(--color-turquoise)' : 'rgba(17,17,15,0.15)',
      }}
    >
      <span
        className="absolute rounded-full bg-white transition-transform duration-200"
        style={{
          width: 18,
          height: 18,
          top: 2,
          left: 2,
          transform: checked ? 'translateX(18px)' : 'translateX(0)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
        }}
      />
    </button>
  );
}
