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
  const authStateChangeCountRef = useRef<number>(0);

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

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        console.log('🔐 [AuthProvider] Initializing auth state...');
        
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        console.log('🔐 [AuthProvider] Initial session check:', { 
          hasSession: !!initialSession, 
          hasError: !!error,
          userId: initialSession?.user?.id
        });
        
        if (error) {
          console.error('❌ [AuthProvider] Initial session error:', error);
          setLoading(false);
          return;
        }

        // Set initial state
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        // Fetch profile if we have a user
        if (initialSession?.user) {
          const profile = await fetchUserProfile(initialSession.user.id);
          setUserProfile(profile);
        }
        
        setLoading(false);
        
      } catch (error) {
        console.error('❌ [AuthProvider] Auth initialization error:', error);
        setLoading(false);
      }
    };

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Track auth state changes to help debug issues
        authStateChangeCountRef.current += 1;
        const changeCount = authStateChangeCountRef.current;
        
        console.log(`🔐 [AuthProvider] Auth state change #${changeCount}:`, { 
          event, 
          hasSession: !!session,
          userId: session?.user?.id
        });
        
        // Set a timestamp cookie to help middleware avoid interfering with auth flow
        document.cookie = `auth_timestamp=${Date.now()}; path=/; max-age=5`;
        
        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log(`✅ [AuthProvider] User signed in (change #${changeCount})`);
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              const profile = await fetchUserProfile(session.user.id);
              setUserProfile(profile);
            }
            break;
            
          case 'SIGNED_OUT':
            console.log(`👋 [AuthProvider] User signed out (change #${changeCount})`);
            setSession(null);
            setUser(null);
            setUserProfile(null);
            profileCacheRef.current.clear();
            
            // Redirect to login page on sign out
            window.location.href = '/login';
            break;
            
          case 'TOKEN_REFRESHED':
            if (session) {
              console.log(`🔄 [AuthProvider] Token refreshed successfully (change #${changeCount})`);
              setSession(session);
              setUser(session.user);
            } else {
              console.log(`🚨 [AuthProvider] Token refresh failed, clearing state (change #${changeCount})`);
              setSession(null);
              setUser(null);
              setUserProfile(null);
              profileCacheRef.current.clear();
              
              // Redirect to session expired page
              window.location.href = '/auth/session-expired';
            }
            break;
            
          case 'PASSWORD_RECOVERY':
            console.log(`🔑 [AuthProvider] Password recovery initiated (change #${changeCount})`);
            // Use window.location instead of router to avoid RSC issues
            window.location.href = '/update-password';
            break;
            
          case 'USER_UPDATED':
            console.log(`👤 [AuthProvider] User updated (change #${changeCount})`);
            if (session?.user) {
              setUser(session.user);
              // Refresh profile data
              const profile = await fetchUserProfile(session.user.id, true);
              setUserProfile(profile);
            }
            break;
            
          case 'INITIAL_SESSION':
            console.log(`🔍 [AuthProvider] Initial session (change #${changeCount})`);
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              const profile = await fetchUserProfile(session.user.id);
              setUserProfile(profile);
            }
            
            setLoading(false);
            break;
        }
      }
    );

    // Initialize auth state
    initializeAuth();

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