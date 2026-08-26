const NAV_ITEMS = [
  { label: 'Home', active: true },
  { label: 'About', active: false },
];

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
      <a
        href="#"
        className="text-3xl tracking-tight"
        style={{ fontFamily: 'var(--font-display)', color: '#000000' }}
      >
        MingoLoop<sup className="text-base align-super">®</sup>
      </a>

      <div className="hidden md:flex items-center gap-8">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href="#"
            className="text-sm transition-colors hover:text-black"
            style={{ color: item.active ? '#000000' : '#6F6F6F' }}
          >
            {item.label}
          </a>
        ))}
      </div>

      <button
        className="rounded-full px-6 py-2.5 text-sm transition-transform duration-200 hover:scale-[1.03]"
        style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
      >
        Begin Journey
      </button>
    </nav>
  );
}
