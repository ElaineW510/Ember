import React, { useState } from 'react';
import { AuthForm } from './AuthForm';
import { useAuth } from '../contexts/AuthContext';

interface SignUpViewProps {
  onSwitchToLogin: () => void;
  onSuccess: (email?: string) => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({ onSwitchToLogin, onSuccess }) => {
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (email: string, password: string) => {
    setError(null);
    
    try {
      const result = await signUp(email, password);
      if (result.error) {
        // Format Supabase error messages for better UX
        let errorMessage = result.error.message;
        
        // Common Supabase error messages
        if (errorMessage.includes('already registered') || errorMessage.includes('already been registered')) {
          errorMessage = 'This email is already registered. Please sign in instead.';
        } else if (errorMessage.includes('Invalid email') || errorMessage.includes('invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (errorMessage.includes('Password') || errorMessage.includes('password')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (errorMessage.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in.';
        }
        
        setError(errorMessage);
        return result;
      }
      
      // Success - if email is returned, user needs to verify email
      // Otherwise, they're already authenticated
      onSuccess(result.email);
      
      return result;
    } catch (err: any) {
      console.error('Sign up error:', err);
      const errorMessage = err?.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      return { error: err instanceof Error ? err : new Error(errorMessage) };
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 md:py-20 animate-fade-in">
      <div className="text-center mb-12 max-w-2xl px-6">
        <h1 className="font-serif text-4xl md:text-5xl text-sage-900 mb-6 leading-snug">
          Start your journey with <span className="text-sage-500 italic tracking-wide">Ember</span>
        </h1>
        <p className="text-lg text-sage-600 mb-8 font-sans leading-relaxed">
          Create an account to begin transforming your therapy sessions into personal growth
        </p>
      </div>

      <div className="w-full max-w-md bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-sage-100 shadow-sm">
        <AuthForm
          mode="signup"
          onSubmit={handleSubmit}
          onSwitchMode={onSwitchToLogin}
          error={error}
        />
      </div>
    </div>
  );
};

