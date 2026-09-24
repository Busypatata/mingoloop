import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import AuthGlobe from '../components/auth/AuthGlobe';
import AuthMark from '../components/auth/AuthMark';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('This reset link is missing its token. Please request a new one.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
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
              Set a new
              <br />
              password.
            </h1>

            {done ? (
              <div
                className="p-6 mt-4"
                style={{ backgroundColor: '#ffffff', border: '1px solid rgba(18,63,75,0.1)', borderRadius: 20 }}
              >
                <p className="mb-4" style={{ fontFamily: 'var(--font-body)', color: '#111820' }}>
                  Your password has been reset.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="friends-message-btn px-6 py-2.5 rounded-full text-sm"
                  style={{ backgroundColor: 'var(--color-coral)', color: '#ffffff', fontFamily: 'var(--font-body)', fontWeight: 500 }}
                >
                  Go to sign in
                </button>
              </div>
            ) : (
              <>
                <p className="text-base mb-8" style={{ color: '#617481', fontFamily: 'var(--font-body)' }}>
                  Choose a new password for your account.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div
                    className="flex items-center gap-3 px-5"
                    style={{ border: '1px solid rgba(18,63,75,0.14)', borderRadius: 9999, height: 54, backgroundColor: '#ffffff' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#8AA0A8', flexShrink: 0 }}>
                      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="New password (min 8 characters)"
                      className="flex-1 bg-transparent outline-none text-sm"
                      style={{ fontFamily: 'var(--font-body)', color: '#111820' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{ color: '#8AA0A8', flexShrink: 0 }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                        {!showPassword && <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="1.6" />}
                      </svg>
                    </button>
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
                    {isSubmitting ? 'Resetting…' : 'Reset password'} <span aria-hidden="true">→</span>
                  </button>
                </form>
              </>
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
