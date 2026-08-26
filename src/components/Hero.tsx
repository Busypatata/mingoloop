import { useLoopingVideoFade } from '../hooks/useLoopingVideoFade';
import Navbar from './Navbar';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4';

export default function Hero() {
  const { videoRef, opacity, hasError } = useLoopingVideoFade();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background video layer */}
      <div className="absolute z-0" style={{ top: '300px', inset: 'auto 0 0 0' }}>
        {!hasError ? (
          <video
            ref={videoRef}
            src={VIDEO_URL}
            muted
            playsInline
            autoPlay
            className="h-full w-full object-cover"
            style={{ opacity, transition: 'opacity 0.1s linear' }}
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                'linear-gradient(180deg, #f4f4f4 0%, #e5e5e5 50%, #ffffff 100%)',
            }}
          />
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-0" />

      {/* Navigation + Hero content sit above the video */}
      <div className="relative z-10">
        <Navbar />

        <section
          className="flex flex-col items-center justify-center text-center px-6"
          style={{ paddingTop: 'calc(8rem - 75px)', paddingBottom: '10rem' }}
        >
          <h1
            className="max-w-7xl font-normal animate-fade-rise text-5xl sm:text-7xl md:text-8xl"
            style={{
              fontFamily: 'var(--font-display)',
              lineHeight: 0.95,
              letterSpacing: '-2.46px',
              color: '#000000',
            }}
          >
            Say hello{' '}
            <em className="italic" style={{ color: '#6F6F6F' }}>in another language.</em>
          </h1>

          <p
            className="max-w-2xl mt-8 text-base sm:text-lg leading-relaxed animate-fade-rise-delay"
            style={{ color: '#6F6F6F' }}
          >
            Meet people from around the world, practice languages together.
          </p>

          <button
            className="rounded-full px-14 py-5 text-base mt-12 animate-fade-rise-delay-2 transition-transform duration-200 hover:scale-[1.03]"
            style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
          >
            Begin Journey
          </button>
        </section>
      </div>
    </div>
  );
}
