import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AuthGlobe from '../components/auth/AuthGlobe';
import AuthMark from '../components/auth/AuthMark';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSent(true);
      setDevResetUrl(res.data?.devResetUrl ?? null);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7FCFB' }}>
      <div className="relative px-6 sm:px-10 py-8 min-h-screen">
        <div
          className="hidden lg:block absolute rounded-full pointer-events-none"
          style={{ top: -80, left: -100, width: 260, height: 260, backgroundColor: 'var(--color-aqua)', opacity: 0.4 }}
          aria-hidden="true"
        />

        <div className="relative z-10 mb-10 sm:mb-14">
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#111820' }}>
            MingoLoop<sup style={{ fontSize: '0.6rem' }}>®</sup>
          </Link>
        </div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center max-w-[1240px] mx-auto">
          <div className="max-w-md w-full">
            <div className="flex items-center gap-2 mb-5">
              <AuthMark />
              <span
                className="text-xs uppercase"
                style={{ letterSpacing: '0.18em', color: 'var(--color-turquoise)', fontFamily: 'var(--font-body)', fontWeight: 600 }}
              >
                Join the loop
              </span>
            </div>

            <h1
              className="text-5xl mb-4"
              style={{ fontFamily: 'var(--font-display)', color: '#0F2A33', lineHeight: 1.05, fontWeight: 400 }}
            >
              Forgot your
              <br />
              password?
            </h1>
            <p className="text-base mb-8" style={{ color: '#617481', fontFamily: 'var(--font-body)' }}>
              Enter your email and we&rsquo;ll send you a link to reset it.
            </p>

            {sent ? (
              <div
                className="p-6"
                style={{ backgroundColor: '#ffffff', border: '1px solid rgba(18,63,75,0.1)', borderRadius: 20 }}
              >
                <p style={{ fontFamily: 'var(--font-body)', color: '#111820' }}>
                  If an account exists for <strong>{email}</strong>, we&rsquo;ve sent a reset link to it.
                </p>
                {devResetUrl && (
                  <p className="text-xs mt-4" style={{ color: '#617481', fontFamily: 'var(--font-body)' }}>
                    Dev mode — no email service is configured yet, so here&rsquo;s the link directly:{' '}
                    <a href={devResetUrl} style={{ color: 'var(--color-turquoise)', wordBreak: 'break-all' }}>
                      {devResetUrl}
                    </a>
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div
                  className="flex items-center gap-3 px-5"
                  style={{ border: '1px solid rgba(18,63,75,0.14)', borderRadius: 9999, height: 54, backgroundColor: '#ffffff' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#8AA0A8', flexShrink: 0 }}>
                    <path d="M4 6h16v12H4V6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ fontFamily: 'var(--font-body)', color: '#111820' }}
                  />
                </div>

                {error && (
                  <p className="text-sm" style={{ color: '#B3261E', fontFamily: 'var(--font-body)' }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="friends-message-btn flex items-center justify-center gap-2 rounded-full text-base mt-1 disabled:opacity-60"
                  style={{ height: 56, backgroundColor: 'var(--color-coral)', color: '#ffffff', fontFamily: 'var(--font-body)', fontWeight: 500 }}
                >
                  {isSubmitting ? 'Sending…' : 'Send reset link'} <span aria-hidden="true">→</span>
                </button>
              </form>
            )}

            <p className="text-center text-sm mt-8" style={{ color: '#617481', fontFamily: 'var(--font-body)' }}>
              <Link to="/login" className="underline" style={{ color: '#111820' }}>
                Back to sign in
              </Link>
            </p>
          </div>

          <div className="hidden lg:block">
            <AuthGlobe />
          </div>
        </div>
      </div>
    </div>
  );
}
