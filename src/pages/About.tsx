import Navbar from '../components/Navbar';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1
          className="text-5xl sm:text-6xl mb-8"
          style={{ fontFamily: 'var(--font-display)', color: '#000000' }}
        >
          Language was never meant to be learned alone.
        </h1>
        <p className="text-lg leading-relaxed" style={{ color: '#6F6F6F' }}>
          MingoLoop connects people around the world who want to learn and practice
          languages together — trading fluency for fluency, and turning conversations
          into friendships.
        </p>
      </main>
    </div>
  );
}
