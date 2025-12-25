import { supabase } from './supabaseClient';
import type { User, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  error: AuthError | null;
}

export const authService = {
  /**
   * Sign up a new user with email and password
   */
  signUp: async (email: string, password: string): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    // If sign-up is successful, check if we have a session
    // (email confirmation might be disabled, allowing immediate login)
    if (data.user && !error) {
      // Try to get the session - if email confirmation is disabled, we'll have a session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is immediately authenticated
        return {
          user: data.user,
          error: null,
        };
      }
      // If no session, email confirmation is likely required
      // Return the user anyway - the app can handle this
    }

    return {
      user: data.user,
      error,
    };
  },

  /**
   * Sign in an existing user with email and password
   */
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: data.user,
      error,
    };
  },

  /**
   * Sign out the current user
   */
  signOut: async (): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Get the current authenticated user
   */
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  /**
   * Get the current session
   */
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  },
};

