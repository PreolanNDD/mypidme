'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface UserProfileRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: UserProfileRow | null;
  refreshUserProfile: () => Promise<void>;
}

interface InitialAuthData {
  user: User | null;
  userProfile: UserProfileRow | null;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({
  children,
  initialAuthData,
}: {
  children: React.ReactNode;
  initialAuthData: InitialAuthData;
}) {
  // Initialize state with server-provided data
  const [session, setSession] = useState<Session | null>(initialAuthData.session);
  const [user, setUser] = useState<User | null>(initialAuthData.user);
  const [userProfile, setUserProfile] = useState<UserProfileRow | null>(initialAuthData.userProfile);
  const [loading, setLoading] = useState(false); // Start with false since we have initial data
  const router = useRouter();

  // Enhanced refs for better state management
  const fetchingProfileRef = useRef<string | null>(null);
  const profileCacheRef = useRef<Map<string, UserProfileRow>>(new Map());
  const initializationRef = useRef<boolean>(false);
  const subscriptionRef = useRef<any>(null);
  const mountedRef = useRef<boolean>(true);
  const profileFetchPromiseRef = useRef<Map<string, Promise<UserProfileRow | null>>>(new Map());
  const retryCountRef = useRef<Map<string, number>>(new Map());
  const initialDataProcessedRef = useRef<boolean>(false);

  // Cache the initial profile data if provided
  useEffect(() => {
    if (initialAuthData.userProfile && initialAuthData.user && !initialDataProcessedRef.current) {
      profileCacheRef.current.set(initialAuthData.user.id, initialAuthData.userProfile);
      initialDataProcessedRef.current = true;
    }
  }, [initialAuthData]);

  // ENHANCED: More robust profile fetching with retry logic and better error handling
  const fetchUserProfile = useCallback(async (userId: string, forceRefresh = false): Promise<UserProfileRow | null> => {
    // Check if component is still mounted
    if (!mountedRef.current) {
      return null;
    }

    // FIXED: Return existing promise if already fetching for this user
    if (profileFetchPromiseRef.current.has(userId) && !forceRefresh) {
      try {
        return await profileFetchPromiseRef.current.get(userId)!;
      } catch (error) {
        // Continue with new fetch attempt
      }
    }

    // Return cached profile if available and not forcing refresh
    if (!forceRefresh && profileCacheRef.current.has(userId)) {
      const cachedProfile = profileCacheRef.current.get(userId)!;
      return cachedProfile;
    }

    // ENHANCED: Create a promise for this fetch operation
    const fetchPromise = (async (): Promise<UserProfileRow | null> => {
      fetchingProfileRef.current = userId;
      const currentRetryCount = retryCountRef.current.get(userId) || 0;

      try {
        const supabase = createClient();
        
        // ENHANCED: Add timeout to prevent hanging requests - reduced to 5 seconds for faster failure
        const fetchWithTimeout = Promise.race([
          supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .maybeSingle(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
          )
        ]);

        const { data: userProfile, error: profileError } = await fetchWithTimeout as any;
        
        // Check if component is still mounted before proceeding
        if (!mountedRef.current) {
          return null;
        }
        
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // ENHANCED: Get user metadata more safely
            const userMetadata = user?.user_metadata || {};
            const insertData = {
              id: userId,
              first_name: userMetadata.first_name || null,
              last_name: userMetadata.last_name || null
            };
            
            try {
              const { data: newProfile, error: createError } = await supabase
                .from('users')
                .insert(insertData)
                .select()
                .single();
              
              // Check if component is still mounted before updating state
              if (!mountedRef.current) {
                return null;
              }
              
              if (createError) {
                throw createError;
              }
              
              // Cache the new profile
              profileCacheRef.current.set(userId, newProfile);
              retryCountRef.current.delete(userId); // Reset retry count on success
              return newProfile;
              
            } catch (createErr) {
              throw createErr;
            }
          } else {
            // For other errors, throw to trigger retry logic
            throw profileError;
          }
        }
        
        if (userProfile) {
          // Cache the profile
          profileCacheRef.current.set(userId, userProfile);
          retryCountRef.current.delete(userId); // Reset retry count on success
          return userProfile;
        } else {
          return null;
        }
        
      } catch (error) {
        // ENHANCED: Implement retry logic for transient errors
        const maxRetries = 2; // Reduced from 3 to 2 for faster failure
        if (currentRetryCount < maxRetries && mountedRef.current) {
          const newRetryCount = currentRetryCount + 1;
          retryCountRef.current.set(userId, newRetryCount);
          
          // Wait 1 second before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (mountedRef.current) {
            // Recursive retry
            return fetchUserProfile(userId, forceRefresh);
          }
        } else {
          retryCountRef.current.delete(userId);
        }
        
        return null;
      } finally {
        fetchingProfileRef.current = null;
        profileFetchPromiseRef.current.delete(userId);
      }
    })();

    // Store the promise for potential reuse
    profileFetchPromiseRef.current.set(userId, fetchPromise);
    
    return fetchPromise;
  }, [user]);

  // ENHANCED: Initialize auth state and listener with better error handling
  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current) {
      return;
    }

    initializationRef.current = true;
    mountedRef.current = true;

    let supabase: any;
    
    try {
      supabase = createClient();
    } catch (clientError) {
      setLoading(false);
      return;
    }

    // ENHANCED: Set up the auth state change listener with better error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        // Check if component is still mounted before updating state
        if (!mountedRef.current) {
          return;
        }

        try {
          // ENHANCED: Handle token refresh failures gracefully
          if (event === 'TOKEN_REFRESHED' && !session) {
            try {
              await supabase.auth.signOut();
              if (mountedRef.current) {
                router.replace('/login');
              }
            } catch (signOutError) {
              if (mountedRef.current) {
                router.replace('/login');
              }
            }
            return;
          }

          // CRITICAL FIX: Be much more selective about when to fetch profiles
          // Only fetch profile in very specific cases where we absolutely need fresh data
          const shouldUpdateProfile = event === 'USER_UPDATED'; // Only when user data is explicitly updated

          // ENHANCED: Update session and user state atomically
          if (mountedRef.current) {
            setSession(session);
            setUser(session?.user ?? null);
          }
          
          if (session?.user && mountedRef.current) {
            // CRITICAL FIX: Only fetch profile if we absolutely need to
            // 1. If shouldUpdateProfile is true (USER_UPDATED event)
            // 2. If we have no profile at all AND no cached profile
            // 3. If the profile user ID doesn't match the session user ID
            const hasCachedProfile = profileCacheRef.current.has(session.user.id);
            const needsProfileFetch = shouldUpdateProfile || 
                                    (!userProfile && !hasCachedProfile) || 
                                    (userProfile && userProfile.id !== session.user.id);
            
            if (needsProfileFetch) {
              try {
                const profile = await fetchUserProfile(session.user.id, shouldUpdateProfile);
                if (mountedRef.current && profile) {
                  setUserProfile(profile);
                }
              } catch (profileError) {
                // Don't clear the profile on error, keep existing one if available
              }
            } else {
              // If we have cached profile but no current profile, use the cached one
              if (!userProfile && hasCachedProfile) {
                const cachedProfile = profileCacheRef.current.get(session.user.id);
                if (cachedProfile && mountedRef.current) {
                  setUserProfile(cachedProfile);
                }
              }
            }
          } else if (!session?.user && mountedRef.current) {
            setUserProfile(null);
            profileCacheRef.current.clear();
            profileFetchPromiseRef.current.clear();
            retryCountRef.current.clear();
          }

          // ENHANCED: Handle password recovery properly
          if (event === 'PASSWORD_RECOVERY' && mountedRef.current) {
            router.push('/update-password');
          }
        } catch (stateChangeError) {
          // Don't break the auth flow on errors
        }
      }
    );

    // Store subscription reference for cleanup
    subscriptionRef.current = subscription;

    // ENHANCED: Cleanup function to prevent memory leaks
    return () => {
      mountedRef.current = false;
      
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
        } catch (unsubError) {
          // Handle unsubscribe error silently
        }
        subscriptionRef.current = null;
      }
      
      // Clear all refs
      profileCacheRef.current.clear();
      profileFetchPromiseRef.current.clear();
      retryCountRef.current.clear();
      fetchingProfileRef.current = null;
      
      // Reset initialization flag for potential remount
      initializationRef.current = false;
    };
  }, []); // Empty dependency array to ensure this runs only once

  // ENHANCED: Refresh user profile with better error handling
  const refreshUserProfile = useCallback(async () => {
    if (user && mountedRef.current) {
      try {
        const profile = await fetchUserProfile(user.id, true);
        if (mountedRef.current && profile) {
          setUserProfile(profile);
        }
      } catch (refreshError) {
        // Handle refresh error silently
      }
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