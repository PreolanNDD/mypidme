'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: any | null;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Create a stable supabase client instance
  const supabase = useMemo(() => createClient(), []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('AuthProvider: Fetching user profile for:', userId);
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
      
      if (error) {
        // Check if it's the specific "no rows returned" error
        if (error.code === 'PGRST116') {
          console.log('AuthProvider: User profile not found, returning null');
          return null;
        }
        throw error;
      }
      
      console.log('AuthProvider: User profile fetched successfully.');
      return data;
    } catch (error) {
      console.error('AuthProvider: Error fetching user profile:', error);
      return null;
    }
  }, [supabase]);

  useEffect(() => {
    console.log("AuthProvider: Main useEffect starting up (should run only once).");

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error getting initial session:', error);
        } else {
          console.log('AuthProvider: Initial session retrieved:', session ? 'with session' : 'without session');
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const profile = await fetchUserProfile(session.user.id);
            setUserProfile(profile);
          }
        }
      } catch (error) {
        console.error('AuthProvider: Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log(`AuthProvider: Auth event received: ${event}`, session ? 'with session.' : 'without session.');

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Only fetch profile if it's a new user or the user has changed
          if (!userProfile || userProfile.id !== session.user.id) {
            console.log("AuthProvider: Fetching profile for new or changed user...");
            const profile = await fetchUserProfile(session.user.id);
            setUserProfile(profile);
          }
        } else {
          setUserProfile(null);
        }
        
        // Loading is already false from initial session fetch
        if (loading) {
          setLoading(false);
        }

        if (event === 'PASSWORD_RECOVERY') {
          console.log("AuthProvider: Password recovery detected, redirecting...");
          router.push('/update-password');
        }
      }
    );

    return () => {
      console.log("AuthProvider: Cleaning up auth subscription.");
      subscription?.unsubscribe();
    };
  }, [supabase, fetchUserProfile, router, userProfile, loading]);

  const refreshUserProfile = useCallback(async () => {
    if (user) {
      console.log('AuthProvider: Refreshing user profile.');
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
    }
  }, [user, fetchUserProfile]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    userProfile,
    refreshUserProfile,
  }), [user, session, loading, userProfile, refreshUserProfile]);

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-secondary-text">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}