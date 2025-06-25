'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

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
  
  // Track if we're currently fetching a profile to prevent concurrent requests
  const fetchingProfileRef = useRef<string | null>(null);
  const profileCacheRef = useRef<Map<string, any>>(new Map());
  const initializationRef = useRef<boolean>(false);

  const fetchUserProfile = useCallback(async (userId: string, forceRefresh = false) => {
    // Prevent concurrent fetches for the same user
    if (fetchingProfileRef.current === userId && !forceRefresh) {
      return profileCacheRef.current.get(userId) || null;
    }

    // Return cached profile if available and not forcing refresh
    if (!forceRefresh && profileCacheRef.current.has(userId)) {
      const cachedProfile = profileCacheRef.current.get(userId);
      return cachedProfile;
    }

    fetchingProfileRef.current = userId;

    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        // Check if it's the specific "no rows returned" error
        if (error.code === 'PGRST116') {
          try {
            const insertData = {
              id: userId,
              first_name: user?.user_metadata?.first_name || null,
              last_name: user?.user_metadata?.last_name || null
            };
            
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert(insertData)
              .select()
              .single();
            
            if (createError) {
              return null;
            }
            
            // Cache the new profile
            profileCacheRef.current.set(userId, newProfile);
            return newProfile;
          } catch (createErr) {
            return null;
          }
        }
        
        return null;
      }
      
      if (data) {
        // Cache the profile
        profileCacheRef.current.set(userId, data);
      }
      
      return data;
    } catch (error) {
      return null;
    } finally {
      fetchingProfileRef.current = null;
    }
  }, [user]);

  useEffect(() => {
    // CRITICAL FIX: Prevent multiple initializations
    if (initializationRef.current) {
      return;
    }

    initializationRef.current = true;

    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔐 [AuthProvider] Initial session check:', { 
        hasSession: !!session, 
        hasError: !!error
      });
      
      if (error) {
        console.error('❌ [AuthProvider] Initial session error:', error);
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          setUserProfile(profile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 [AuthProvider] Auth state change:', { event, hasSession: !!session });
        
        // Handle invalid refresh token errors or session errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('🚨 [AuthProvider] Token refresh failed, clearing state');
          setSession(null);
          setUser(null);
          setUserProfile(null);
          profileCacheRef.current.clear();
          return;
        }

        // Handle specific events that should trigger profile updates
        const shouldUpdateProfile = [
          'INITIAL_SESSION',
          'SIGNED_IN',
          'TOKEN_REFRESHED',
          'USER_UPDATED'
        ].includes(event);

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Only fetch profile in specific cases to avoid unnecessary requests
          if (shouldUpdateProfile || !userProfile || userProfile.id !== session.user.id) {
            const profile = await fetchUserProfile(session.user.id);
            setUserProfile(profile);
          }
        } else {
          setUserProfile(null);
          // Clear profile cache when user logs out
          profileCacheRef.current.clear();
        }

        // Handle sign out events
        if (event === 'SIGNED_OUT') {
          console.log('👋 [AuthProvider] User signed out');
          setSession(null);
          setUser(null);
          setUserProfile(null);
          profileCacheRef.current.clear();
        }

        if (event === 'PASSWORD_RECOVERY') {
          // Use window.location instead of router to avoid RSC issues
          window.location.href = '/update-password';
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
      initializationRef.current = false; // Reset initialization flag
    };
  }, []); // CRITICAL: Empty dependency array to prevent re-initialization

  
  const refreshUserProfile = useCallback(async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id, true); // Force refresh
      setUserProfile(profile);
    }
  }, [user, fetchUserProfile]);

  const value = useMemo(() => {
    const contextValue = {
      user,
      session,
      loading,
      userProfile,
      refreshUserProfile,
    };
    
    return contextValue;
  }, [user, session, loading, userProfile, refreshUserProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}