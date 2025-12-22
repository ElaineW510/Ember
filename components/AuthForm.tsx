import React, { useState } from 'react';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSubmit: (email: string, password: string) => Promise<{ error: Error | null }>;
  onSwitchMode: () => void;
  error: string | null;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, onSwitchMode, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (mode === 'signup') {
      if (!confirmPassword) {
        setLocalError('Please confirm your password');
        return;
      }

      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await onSubmit(email, password);
      setIsLoading(false);

      if (error) {
        setLocalError(error.message);
      }
    } catch (err: any) {
      setIsLoading(false);
      setLocalError(err?.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-sage-700 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-sage-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sage-200 focus:border-sage-400 transition text-sage-900"
          placeholder="you@example.com"
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-sage-700 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-sage-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sage-200 focus:border-sage-400 transition text-sage-900"
          placeholder="••••••••"
          disabled={isLoading}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
      </div>

      {mode === 'signup' && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-sage-700 mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-sage-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sage-200 focus:border-sage-400 transition text-sage-900"
            placeholder="••••••••"
            disabled={isLoading}
            autoComplete="new-password"
          />
        </div>
      )}

      {displayError && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          {displayError}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-6 bg-sage-600 text-white font-medium rounded-xl hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-200 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
      </button>

      <div className="text-center text-sm text-sage-600">
        {mode === 'login' ? (
          <>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchMode}
              className="text-sage-700 font-medium hover:text-sage-900 underline"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchMode}
              className="text-sage-700 font-medium hover:text-sage-900 underline"
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </form>
  );
};

