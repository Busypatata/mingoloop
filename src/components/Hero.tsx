import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import LanguageIllustration from './LanguageIllustration';

export default function Hero() {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--color-landing-bg)' }}>
      <Navbar />

      <section className="max-w-7xl mx-auto px-8 pt-10 pb-24 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 w-full max-w-xl">
          <h1
            className="font-normal animate-fade-rise text-5xl sm:text-6xl md:text-7xl"
            style={{ fontFamily: 'var(--font-display)', lineHeight: 1.08 }}
          >
            <span style={{ color: '#111111' }}>Speak Freely.</span>
            <br />
            <span style={{ color: 'var(--color-coral)' }}>Connect Deeply.</span>
            <br />
            <span style={{ color: 'var(--color-turquoise)' }}>Learn Naturally.</span>
          </h1>

          <p
            className="mt-8 text-base sm:text-lg leading-relaxed animate-fade-rise-delay"
            style={{ color: '#5A5A5A', maxWidth: 460 }}
          >
            A space to practice languages, make real connections, and explore cultures
            together.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-10 animate-fade-rise-delay-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm transition-transform duration-200 hover:scale-[1.03] hover:gap-3"
              style={{ backgroundColor: 'var(--color-coral)', color: '#FFFFFF' }}
            >
              Start Learning <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center rounded-full px-7 py-3.5 text-sm border transition-colors"
              style={{ borderColor: 'var(--color-turquoise)', color: '#111111', backgroundColor: 'transparent' }}
            >
              Explore Community
            </Link>
          </div>
        </div>

        <div className="flex-1 w-full flex justify-center">
          <LanguageIllustration />
        </div>
      </section>
    </div>
  );
}
