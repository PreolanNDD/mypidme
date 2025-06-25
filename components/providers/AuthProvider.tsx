'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

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
  const pathname = usePathname();
  
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

  // Global error handler for 401 responses
  const handleAuthError = useCallback(async () => {
    console.log('🚨 [AuthProvider] Handling authentication error - signing out user');
    
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error('❌ [AuthProvider] Error during signout:', error);
    }
    
    // Clear all state
    setUser(null);
    setSession(null);
    setUserProfile(null);
    profileCacheRef.current.clear();
    
    // Only redirect if we're not already on a public route
    const publicRoutes = ['/login', '/signup', '/forgot-password', '/update-password', '/'];
    if (!publicRoutes.includes(pathname)) {
      router.replace('/login');
    }
  }, [router, pathname]);

  // Set up global fetch interceptor for 401 errors
  useEffect(() => {
    // Store original fetch
    const originalFetch = window.fetch;
    
    // Create interceptor
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Check if this is a Supabase API call that returned 401
        let url: string | undefined;
        if (typeof args[0] === 'string') {
          url = args[0];
        } else if (args[0] instanceof Request) {
          url = args[0].url;
        } else if (args[0] instanceof URL) {
          url = args[0].toString();
        }
        
        const isSupabaseCall = url?.includes(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
        
        if (isSupabaseCall && response.status === 401) {
          console.log('🚨 [AuthProvider] Intercepted 401 from Supabase API, triggering auth error handler');
          handleAuthError();
        }
        
        return response;
      } catch (error) {
        throw error;
      }
    };
    
    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, [handleAuthError]);

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
        hasError: !!error,
        pathname 
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

    // Set up the auth state change listener - this is our single source of truth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 [AuthProvider] Auth state change:', { event, hasSession: !!session, pathname });
        
        // Handle invalid refresh token errors or session errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('🚨 [AuthProvider] Token refresh failed, signing out');
          try {
            await supabase.auth.signOut();
            // Don't redirect here - let the SIGNED_OUT event handle it
          } catch (signOutError) {
            console.error('❌ [AuthProvider] Error during signout:', signOutError);
            handleAuthError();
          }
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
          
          // Only redirect if we're not already on a public route
          const publicRoutes = ['/login', '/signup', '/forgot-password', '/update-password', '/'];
          if (!publicRoutes.includes(pathname)) {
            router.replace('/login');
          }
          return;
        }

        if (event === 'PASSWORD_RECOVERY') {
          router.push('/update-password');
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