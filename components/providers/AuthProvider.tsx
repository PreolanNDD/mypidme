'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
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

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('AuthProvider: Fetching user profile for:', userId);
      const supabase = createClient();
      
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000); // 10 second timeout
      });
      
      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      if (error) {
        // Check if it's the specific "no rows returned" error
        if (error.code === 'PGRST116') {
          console.log('AuthProvider: User profile not found, this might be a new user');
          // For new users, we might need to create a profile
          try {
            console.log('AuthProvider: Attempting to create user profile...');
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert({
                id: userId,
                first_name: null,
                last_name: null
              })
              .select()
              .single();
            
            if (createError) {
              console.error('AuthProvider: Error creating user profile:', createError);
              return null;
            }
            
            console.log('AuthProvider: User profile created successfully');
            return newProfile;
          } catch (createErr) {
            console.error('AuthProvider: Failed to create user profile:', createErr);
            return null;
          }
        }
        throw error;
      }
      
      console.log('AuthProvider: User profile fetched successfully');
      return data;
    } catch (error) {
      console.error('AuthProvider: Error fetching user profile:', error);
      // Don't throw the error, just return null and continue
      return null;
    }
  }, []);

  useEffect(() => {
    console.log("AuthProvider: Main useEffect starting up");

    const supabase = createClient();

    // Get initial session with timeout
    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Getting initial session...');
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session fetch timeout')), 5000); // 5 second timeout
        });
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (error) {
          console.error('AuthProvider: Error getting initial session:', error);
        } else {
          console.log('AuthProvider: Initial session retrieved:', !!session);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('AuthProvider: Fetching profile for authenticated user...');
            const profile = await fetchUserProfile(session.user.id);
            setUserProfile(profile);
          }
        }
      } catch (error) {
        console.error('AuthProvider: Failed to initialize auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`AuthProvider: Auth event received: ${event}`, session ? 'with session.' : 'without session.');

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Only fetch profile if we don't have one or it's for a different user
          if (!userProfile || userProfile.id !== session.user.id) {
            console.log("AuthProvider: Fetching profile for new or changed user...");
            const profile = await fetchUserProfile(session.user.id);
            setUserProfile(profile);
          }
        } else {
          setUserProfile(null);
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
  }, [fetchUserProfile, router]);

  
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