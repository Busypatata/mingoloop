export default function ProfileDecorativeNotes() {
  return (
    <div className="hidden lg:block fixed left-6 bottom-10 pointer-events-none z-0" aria-hidden="true">
      <div className="flex items-center gap-1 mb-3">
        <span style={{ fontSize: '1.4rem' }}>🍃</span>
        <span style={{ fontSize: '1.4rem', color: 'var(--color-coral)' }}>🍃</span>
      </div>
      <p
        className="italic"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.35rem',
          lineHeight: 1.25,
          color: 'color-mix(in srgb, var(--color-muted-blue) 70%, #111820)',
          opacity: 0.75,
          maxWidth: 170,
        }}
      >
        Better conversations.
        <br />A more connected world.
      </p>
    </div>
  );
}
