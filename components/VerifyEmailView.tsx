import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface VerifyEmailViewProps {
  email: string;
  onVerified: () => void;
}

export const VerifyEmailView: React.FC<VerifyEmailViewProps> = ({ email, onVerified }) => {
  const { resendVerificationEmail, checkEmailVerification } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Periodically check if email is verified
  useEffect(() => {
    const interval = setInterval(async () => {
      const verified = await checkEmailVerification();
      if (verified) {
        onVerified();
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResend = async () => {
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const result = await resendVerificationEmail(email);
      if (result.error) {
        setResendError(result.error.message);
      } else {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 5000);
      }
    } catch (err: any) {
      setResendError('Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    try {
      const verified = await checkEmailVerification();
      if (verified) {
        onVerified();
      } else {
        setResendError('Email not yet verified. Please check your inbox and click the verification link.');
      }
    } catch (err: any) {
      setResendError('Failed to check verification status. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 md:py-20 animate-fade-in">
      <div className="text-center mb-12 max-w-2xl px-6">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-sage-600"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-sage-900 mb-6 leading-snug">
          Check your email
        </h1>
        <p className="text-lg text-sage-600 mb-4 font-sans leading-relaxed">
          We've sent a verification link to
        </p>
        <p className="text-lg text-sage-700 mb-8 font-sans font-medium">
          {email}
        </p>
        <p className="text-sm text-sage-500 mb-8 font-sans leading-relaxed max-w-md mx-auto">
          Click the link in the email to verify your account and start your journey with Ember.
        </p>
      </div>

      <div className="w-full max-w-md bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-sage-100 shadow-sm space-y-4">
        {resendSuccess && (
          <div className="p-4 bg-green-50 text-green-600 rounded-xl text-sm border border-green-100">
            Verification email sent! Please check your inbox.
          </div>
        )}

        {resendError && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {resendError}
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={isResending}
          className="w-full py-3 px-6 bg-sage-100 text-sage-700 font-medium rounded-xl hover:bg-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-200 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResending ? 'Sending...' : 'Resend verification email'}
        </button>

        <button
          onClick={handleCheckVerification}
          disabled={isChecking}
          className="w-full py-3 px-6 bg-sage-600 text-white font-medium rounded-xl hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-200 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isChecking ? 'Checking...' : "I've verified my email"}
        </button>
      </div>
    </div>
  );
};

