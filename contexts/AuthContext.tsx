import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
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
      
      // After sign-up, check for session immediately
      // If email confirmation is disabled, user will be logged in immediately
      const session = await authService.getSession();
      if (session?.user) {
        // User is immediately authenticated (email confirmation disabled)
        setUser(session.user);
        return { error: null };
      }
      
      // If email confirmation is required, newUser will be set but no session
      // The auth state change listener will handle the session when email is confirmed
      // For now, we'll still return success but the user won't be logged in until they confirm
      if (newUser) {
        // Note: If email confirmation is required, user won't be logged in yet
        // But we return success so the UI can show a message
        setUser(newUser);
        return { error: null };
      }
      
      return { error: new Error('Sign up completed but no user was created') };
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

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

