import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '../services/api';
import type { User } from '../types/user';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  register: (data: { name: string; username: string; email: string; password: string }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'mingoloop_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  async function register(data: { name: string; username: string; email: string; password: string }) {
    setError(null);
    try {
      const res = await api.post('/auth/register', data);
      localStorage.setItem(TOKEN_KEY, res.data.token);
      setUser(res.data.user);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
      throw new Error(message);
    }
  }

  async function login(data: { email: string; password: string }) {
    setError(null);
    try {
      const res = await api.post('/auth/login', data);
      localStorage.setItem(TOKEN_KEY, res.data.token);
      setUser(res.data.user);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
      throw new Error(message);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, error, register, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
