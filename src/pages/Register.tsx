import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen flex items-center justify-center px-6 bg-white py-16">
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
          Say hello.
        </h1>
        <p className="text-center text-sm mb-8" style={{ color: '#6F6F6F' }}>
          Create your account and find your language people.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            required
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-3 rounded-full text-sm border outline-none focus:border-black transition-colors"
            style={{ borderColor: 'rgba(0,0,0,0.08)' }}
          />
          <input
            required
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-5 py-3 rounded-full text-sm border outline-none focus:border-black transition-colors"
            style={{ borderColor: 'rgba(0,0,0,0.08)' }}
          />
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
            minLength={8}
            placeholder="Password (min 8 characters)"
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
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-8" style={{ color: '#6F6F6F' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#000000' }} className="underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
