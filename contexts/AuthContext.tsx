import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isEmailVerified: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; email?: string }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<{ error: Error | null }>;
  checkEmailVerification: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isEmailVerified = user ? authService.isEmailVerified(user) : false;

  useEffect(() => {
    // Check for existing session on mount
    authService.getSession().then((session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { user: newUser, error } = await authService.signUp(email, password);
      if (error) {
        console.error('Sign up error:', error);
        return { error: new Error(error.message) };
      }
      
      if (!newUser) {
        return { error: new Error('Sign up completed but no user was created') };
      }
      
      // After sign-up, wait a moment for Supabase to establish the session
      // Then check for session - if email confirmation is disabled, user will be logged in immediately
      await new Promise(resolve => setTimeout(resolve, 500));
      const session = await authService.getSession();
      
      if (session?.user && authService.isEmailVerified(session.user)) {
        // User is immediately authenticated and verified (email confirmation disabled)
        setUser(session.user);
        return { error: null };
      }
      
      // If email confirmation is required, return the email so we can show verification screen
      // Don't set the user state - wait for email confirmation
      return { error: null, email: newUser.email || email };
    } catch (err: any) {
      console.error('Sign up exception:', err);
      return { error: err instanceof Error ? err : new Error('Sign up failed') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user: signedInUser, error } = await authService.signIn(email, password);
      if (error) {
        return { error: new Error(error.message) };
      }
      setUser(signedInUser);
      return { error: null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error('Sign in failed') };
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const { error } = await authService.resendVerificationEmail(email);
      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error('Failed to resend verification email') };
    }
  };

  const checkEmailVerification = async (): Promise<boolean> => {
    try {
      const session = await authService.getSession();
      if (session?.user) {
        const verified = authService.isEmailVerified(session.user);
        if (verified) {
          setUser(session.user);
        }
        return verified;
      }
      return false;
    } catch (err) {
      console.error('Error checking email verification:', err);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isEmailVerified,
    signUp,
    signIn,
    signOut,
    resendVerificationEmail,
    checkEmailVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

