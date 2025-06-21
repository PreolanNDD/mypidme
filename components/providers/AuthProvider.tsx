'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
  
  // Track if we're currently fetching a profile to prevent concurrent requests
  const fetchingProfileRef = useRef<string | null>(null);
  const profileCacheRef = useRef<Map<string, any>>(new Map());

  const fetchUserProfile = useCallback(async (userId: string, forceRefresh = false) => {
    // Prevent concurrent fetches for the same user
    if (fetchingProfileRef.current === userId && !forceRefresh) {
      console.log('AuthProvider: Profile fetch already in progress for user:', userId);
      return profileCacheRef.current.get(userId) || null;
    }

    // Return cached profile if available and not forcing refresh
    if (!forceRefresh && profileCacheRef.current.has(userId)) {
      console.log('AuthProvider: Returning cached profile for user:', userId);
      return profileCacheRef.current.get(userId);
    }

    fetchingProfileRef.current = userId;

    try {
      console.log('AuthProvider: Fetching user profile for:', userId);
      const supabase = createClient();
      
      // Add a shorter timeout for better UX
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
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
          console.log('AuthProvider: User profile not found, creating new profile...');
          // For new users, create a profile
          try {
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
            // Cache the new profile
            profileCacheRef.current.set(userId, newProfile);
            return newProfile;
          } catch (createErr) {
            console.error('AuthProvider: Failed to create user profile:', createErr);
            return null;
          }
        }
        throw error;
      }
      
      console.log('AuthProvider: User profile fetched successfully');
      // Cache the profile
      profileCacheRef.current.set(userId, data);
      return data;
    } catch (error) {
      console.error('AuthProvider: Error fetching user profile:', error);
      // Don't throw the error, just return null and continue
      return null;
    } finally {
      fetchingProfileRef.current = null;
    }
  }, []);

  useEffect(() => {
    console.log("AuthProvider: Main useEffect starting up");

    const supabase = createClient();
    let isInitialized = false;

    // Get initial session with timeout
    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Getting initial session...');
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session fetch timeout')), 3000);
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
        
        isInitialized = true;
      } catch (error) {
        console.error('AuthProvider: Failed to initialize auth:', error);
        isInitialized = true;
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`AuthProvider: Auth event received: ${event}`, session ? 'with session.' : 'without session.');

        // Skip processing if we haven't finished initialization
        if (!isInitialized) {
          console.log('AuthProvider: Skipping auth state change - not yet initialized');
          return;
        }

        // Handle specific events that should trigger profile updates
        const shouldUpdateProfile = [
          'SIGNED_IN',
          'TOKEN_REFRESHED',
          'USER_UPDATED'
        ].includes(event);

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Only fetch profile in specific cases to avoid unnecessary requests
          if (shouldUpdateProfile || !userProfile || userProfile.id !== session.user.id) {
            console.log(`AuthProvider: Fetching profile due to event: ${event}`);
            const profile = await fetchUserProfile(session.user.id);
            setUserProfile(profile);
          } else {
            console.log(`AuthProvider: Skipping profile fetch for event: ${event} (profile already exists)`);
          }
        } else {
          setUserProfile(null);
          // Clear profile cache when user logs out
          profileCacheRef.current.clear();
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
      console.log('AuthProvider: Refreshing user profile (forced).');
      const profile = await fetchUserProfile(user.id, true); // Force refresh
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