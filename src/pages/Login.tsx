import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="text-3xl tracking-tight block text-center mb-10"
          style={{ fontFamily: 'var(--font-display)', color: '#000000' }}
        >
          MingoLoop<sup className="text-base align-super">®</sup>
        </Link>

        <h1
          className="text-4xl text-center mb-2"
          style={{ fontFamily: 'var(--font-display)', color: '#000000' }}
        >
          Welcome back.
        </h1>
        <p className="text-center text-sm mb-8" style={{ color: '#6F6F6F' }}>
          Pick up your conversations where you left off.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3 rounded-full text-sm border outline-none focus:border-black transition-colors"
            style={{ borderColor: 'rgba(0,0,0,0.08)' }}
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 rounded-full text-sm border outline-none focus:border-black transition-colors"
            style={{ borderColor: 'rgba(0,0,0,0.08)' }}
          />

          {error && (
            <p className="text-sm text-center" style={{ color: '#B3261E' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full py-3 text-sm mt-2 transition-transform duration-200 hover:scale-[1.02] disabled:opacity-50"
            style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm mt-8" style={{ color: '#6F6F6F' }}>
          New here?{' '}
          <Link to="/register" style={{ color: '#000000' }} className="underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
