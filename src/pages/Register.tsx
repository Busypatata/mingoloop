import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthGlobe from '../components/auth/AuthGlobe';
import AuthMark from '../components/auth/AuthMark';

const inputWrapStyle = {
  border: '1px solid rgba(18,63,75,0.14)',
  borderRadius: 9999,
};

function FieldIcon({ variant }: { variant: 'person' | 'at' | 'mail' | 'lock' }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' } as const;
  const stroke = '#8AA0A8';
  if (variant === 'person') {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.6" stroke={stroke} strokeWidth="1.6" />
        <path d="M5 20c0-4 3.5-6.5 7-6.5s7 2.5 7 6.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (variant === 'at') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3.4" stroke={stroke} strokeWidth="1.6" />
        <path d="M15.4 12v1.4a2.6 2.6 0 005.1-.6C20.5 7.8 16.7 5 12 5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (variant === 'mail') {
    return (
      <svg {...common}>
        <path d="M4 6h16v12H4V6Z" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 7l8 6 8-6" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="5" y="10" width="14" height="10" rx="2" stroke={stroke} strokeWidth="1.6" />
      <path d="M8 10V7a4 4 0 018 0v3" stroke={stroke} strokeWidth="1.6" />
    </svg>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ name, username, email, password });
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message);
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
        <div
          className="hidden lg:block absolute rounded-full pointer-events-none"
          style={{ bottom: -100, right: -100, width: 300, height: 300, backgroundColor: 'var(--color-aqua)', opacity: 0.35 }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-center justify-between mb-10 sm:mb-14">
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#111820' }}>
            MingoLoop<sup style={{ fontSize: '0.6rem' }}>®</sup>
          </Link>
          <p className="text-sm" style={{ color: '#617481', fontFamily: 'var(--font-body)' }}>
            Already have an account?{' '}
            <Link to="/login" className="underline" style={{ color: '#111820' }}>
              Sign in
            </Link>
          </p>
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
              className="text-6xl mb-4"
              style={{ fontFamily: 'var(--font-display)', color: '#0F2A33', lineHeight: 1.05, fontWeight: 400 }}
            >
              Meet people
              <br />
              through language.
            </h1>
            <p className="text-base mb-8" style={{ color: '#617481', fontFamily: 'var(--font-body)' }}>
              Create your account and find conversations that cross borders.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-5" style={{ ...inputWrapStyle, height: 54, backgroundColor: '#ffffff' }}>
                <FieldIcon variant="person" />
                <input
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ fontFamily: 'var(--font-body)', color: '#111820' }}
                />
              </div>

              <div className="flex items-center gap-3 px-5" style={{ ...inputWrapStyle, height: 54, backgroundColor: '#ffffff' }}>
                <FieldIcon variant="at" />
                <input
                  required
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ fontFamily: 'var(--font-body)', color: '#111820' }}
                />
              </div>

              <div className="flex items-center gap-3 px-5" style={{ ...inputWrapStyle, height: 54, backgroundColor: '#ffffff' }}>
                <FieldIcon variant="mail" />
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ fontFamily: 'var(--font-body)', color: '#111820' }}
                />
              </div>

              <div className="flex items-center gap-3 px-5" style={{ ...inputWrapStyle, height: 54, backgroundColor: '#ffffff' }}>
                <FieldIcon variant="lock" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="Password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                {isSubmitting ? 'Creating account…' : 'Create Account'} <span aria-hidden="true">→</span>
              </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: '#617481', fontFamily: 'var(--font-body)' }}>
              Already have an account?{' '}
              <Link to="/login" className="underline" style={{ color: '#111820' }}>
                Sign in
              </Link>
            </p>

            <div className="flex items-center gap-4 justify-center mt-8">
              <span style={{ width: 32, height: 1, backgroundColor: 'rgba(18,63,75,0.15)' }} />
              <AuthMark />
              <p className="text-sm text-center" style={{ color: '#617481', fontFamily: 'var(--font-body)' }}>
                Your next conversation could be anywhere in the world.
              </p>
              <span style={{ width: 32, height: 1, backgroundColor: 'rgba(18,63,75,0.15)' }} />
            </div>
          </div>

          <div className="hidden lg:block">
            <AuthGlobe />
          </div>
        </div>
      </div>
    </div>
  );
}
