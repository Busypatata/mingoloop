export default function DashboardDecorativeNotes() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <div
        className="hidden lg:block absolute rounded-full"
        style={{ top: -50, left: -130, width: 300, height: 300, backgroundColor: 'var(--color-aqua)', opacity: 0.35, filter: 'blur(2px)' }}
      />

      <svg
        className="hidden lg:block absolute"
        style={{ top: 40, right: -60, opacity: 0.4 }}
        width="200"
        height="200"
        viewBox="0 0 200 200"
      >
        <circle cx="100" cy="100" r="90" fill="none" stroke="var(--color-muted-blue)" strokeWidth="1" />
      </svg>
    </div>
  );
}
