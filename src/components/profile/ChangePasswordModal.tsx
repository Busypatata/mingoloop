import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';

const inputStyle = {
  border: '1px solid rgba(17,17,15,0.12)',
  borderRadius: 10,
};

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(17,17,15,0.35)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 relative"
        style={{ boxShadow: '0 20px 60px rgba(17,17,15,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex items-center justify-center rounded-full"
          style={{ width: 28, height: 28, color: 'var(--color-app-text-muted)' }}
        >
          <X size={18} />
        </button>

        <h3 className="text-xl mb-1" style={{ fontFamily: 'var(--font-display)', color: '#11110f' }}>
          Change password
        </h3>

        {success ? (
          <>
            <p className="text-sm mt-3 mb-6" style={{ color: 'var(--color-app-text-secondary)' }}>
              Your password has been updated.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-full text-sm text-white"
              style={{ backgroundColor: '#11110f' }}
            >
              Done
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full px-4 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full px-4 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full px-4 py-2.5 text-sm outline-none"
              style={inputStyle}
            />

            {error && (
              <p className="text-sm" style={{ color: '#B3261E' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-full text-sm text-white disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-coral)' }}
            >
              {isSubmitting ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
