import React, { useState } from 'react';
import { AuthForm } from './AuthForm';
import { useAuth } from '../contexts/AuthContext';

interface LoginViewProps {
  onSwitchToSignUp: () => void;
  onSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSwitchToSignUp, onSuccess }) => {
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (email: string, password: string) => {
    setError(null);
    
    try {
      const result = await signIn(email, password);
      if (result.error) {
        // Format Supabase error messages for better UX
        let errorMessage = result.error.message;
        
        // Common Supabase error messages
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Please check your email to confirm your account.';
        } else if (errorMessage.includes('User not found')) {
          errorMessage = 'No account found with this email. Please sign up instead.';
        }
        
        setError(errorMessage);
        return result;
      }
      
      // Success - redirect to home
      onSuccess();
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      return { error: err instanceof Error ? err : new Error(errorMessage) };
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 md:py-20 animate-fade-in">
      <div className="text-center mb-12 max-w-2xl px-6">
        <h1 className="font-serif text-4xl md:text-5xl text-sage-900 mb-6 leading-snug">
          Welcome back to <span className="text-sage-500 italic tracking-wide">Ember</span>
        </h1>
        <p className="text-lg text-sage-600 mb-8 font-sans leading-relaxed">
          Sign in to continue your journey of personal growth
        </p>
      </div>

      <div className="w-full max-w-md bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-sage-100 shadow-sm">
        <AuthForm
          mode="login"
          onSubmit={handleSubmit}
          onSwitchMode={onSwitchToSignUp}
          error={error}
        />
      </div>
    </div>
  );
};

