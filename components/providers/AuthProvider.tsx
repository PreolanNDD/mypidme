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

interface InitialAuthData {
  user: User | null;
  userProfile: any | null;
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
  const [userProfile, setUserProfile] = useState<any | null>(initialAuthData.userProfile);
  const [loading, setLoading] = useState(false); // Start with false since we have initial data
  const router = useRouter();

  // Enhanced refs for better state management
  const fetchingProfileRef = useRef<string | null>(null);
  const profileCacheRef = useRef<Map<string, any>>(new Map());
  const initializationRef = useRef<boolean>(false);
  const subscriptionRef = useRef<any>(null);
  const mountedRef = useRef<boolean>(true);
  const profileFetchPromiseRef = useRef<Map<string, Promise<any>>>(new Map());
  const retryCountRef = useRef<Map<string, number>>(new Map());
  const initialDataProcessedRef = useRef<boolean>(false);

  console.log('🔐 [AuthProvider] Component rendered with initial data:', {
    hasUser: !!user,
    userId: user?.id,
    hasSession: !!session,
    hasProfile: !!userProfile,
    profileUserId: userProfile?.id,
    loading,
    isInitialized: initializationRef.current,
    initialDataProcessed: initialDataProcessedRef.current
  });

  // Cache the initial profile data if provided
  useEffect(() => {
    if (initialAuthData.userProfile && initialAuthData.user && !initialDataProcessedRef.current) {
      profileCacheRef.current.set(initialAuthData.user.id, initialAuthData.userProfile);
      initialDataProcessedRef.current = true;
      console.log('🔐 [AuthProvider] Cached initial profile data for user:', initialAuthData.user.id);
    }
  }, [initialAuthData]);

  // ENHANCED: More robust profile fetching with retry logic and better error handling
  const fetchUserProfile = useCallback(async (userId: string, forceRefresh = false) => {
    console.log('👤 [AuthProvider] fetchUserProfile called:', {
      userId,
      forceRefresh,
      currentlyFetching: fetchingProfileRef.current,
      hasCachedProfile: profileCacheRef.current.has(userId),
      isMounted: mountedRef.current,
      hasActivePromise: profileFetchPromiseRef.current.has(userId),
      retryCount: retryCountRef.current.get(userId) || 0
    });

    // Check if component is still mounted
    if (!mountedRef.current) {
      console.log('👤 [AuthProvider] Component unmounted, skipping profile fetch');
      return null;
    }

    // FIXED: Return existing promise if already fetching for this user
    if (profileFetchPromiseRef.current.has(userId) && !forceRefresh) {
      console.log('👤 [AuthProvider] Profile fetch already in progress, returning existing promise');
      try {
        return await profileFetchPromiseRef.current.get(userId);
      } catch (error) {
        console.error('👤 [AuthProvider] Error waiting for existing profile fetch:', error);
        // Continue with new fetch attempt
      }
    }

    // Return cached profile if available and not forcing refresh
    if (!forceRefresh && profileCacheRef.current.has(userId)) {
      const cachedProfile = profileCacheRef.current.get(userId);
      console.log('👤 [AuthProvider] Returning cached profile:', {
        userId,
        hasCachedProfile: !!cachedProfile,
        profileData: cachedProfile ? { id: cachedProfile.id, firstName: cachedProfile.first_name } : null
      });
      return cachedProfile;
    }

    // ENHANCED: Create a promise for this fetch operation
    const fetchPromise = (async () => {
      fetchingProfileRef.current = userId;
      const currentRetryCount = retryCountRef.current.get(userId) || 0;
      
      console.log('👤 [AuthProvider] Starting profile fetch for user:', {
        userId,
        attempt: currentRetryCount + 1,
        forceRefresh
      });

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

        const { data, error } = await fetchWithTimeout as any;
        
        // Check if component is still mounted before proceeding
        if (!mountedRef.current) {
          console.log('👤 [AuthProvider] Component unmounted during fetch, aborting');
          return null;
        }
        
        if (error) {
          console.log('👤 [AuthProvider] Profile fetch error:', {
            error,
            code: error.code,
            message: error.message,
            userId
          });
          
          if (error.code === 'PGRST116') {
            console.log('👤 [AuthProvider] No profile found, creating new profile...');
            
            // ENHANCED: Get user metadata more safely
            const userMetadata = user?.user_metadata || {};
            const insertData = {
              id: userId,
              first_name: userMetadata.first_name || null,
              last_name: userMetadata.last_name || null
            };
            
            console.log('👤 [AuthProvider] Creating profile with data:', insertData);
            
            try {
              const { data: newProfile, error: createError } = await supabase
                .from('users')
                .insert(insertData)
                .select()
                .single();
              
              // Check if component is still mounted before updating state
              if (!mountedRef.current) {
                console.log('👤 [AuthProvider] Component unmounted during profile creation, aborting');
                return null;
              }
              
              if (createError) {
                console.error('👤 [AuthProvider] Error creating profile:', createError);
                throw createError;
              }
              
              console.log('👤 [AuthProvider] Profile created successfully:', {
                id: newProfile.id,
                firstName: newProfile.first_name,
                lastName: newProfile.last_name
              });
              
              // Cache the new profile
              profileCacheRef.current.set(userId, newProfile);
              retryCountRef.current.delete(userId); // Reset retry count on success
              return newProfile;
              
            } catch (createErr) {
              console.error('👤 [AuthProvider] Error creating profile:', createErr);
              throw createErr;
            }
          } else {
            // For other errors, throw to trigger retry logic
            throw error;
          }
        }
        
        if (data) {
          console.log('👤 [AuthProvider] Profile fetched successfully:', {
            userId: data.id,
            firstName: data.first_name,
            lastName: data.last_name,
            createdAt: data.created_at
          });
          
          // Cache the profile
          profileCacheRef.current.set(userId, data);
          retryCountRef.current.delete(userId); // Reset retry count on success
          return data;
        } else {
          console.log('👤 [AuthProvider] No profile data returned, but no error');
          return null;
        }
        
      } catch (error) {
        console.error('👤 [AuthProvider] Error in fetchUserProfile:', {
          error,
          userId,
          attempt: currentRetryCount + 1,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
        
        // ENHANCED: Implement retry logic for transient errors
        const maxRetries = 2; // Reduced from 3 to 2 for faster failure
        if (currentRetryCount < maxRetries && mountedRef.current) {
          const newRetryCount = currentRetryCount + 1;
          retryCountRef.current.set(userId, newRetryCount);
          
          console.log(`👤 [AuthProvider] Retrying profile fetch (${newRetryCount}/${maxRetries}) in 1 second...`);
          
          // Wait 1 second before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (mountedRef.current) {
            // Recursive retry
            return fetchUserProfile(userId, forceRefresh);
          }
        } else {
          console.error('👤 [AuthProvider] Max retries exceeded or component unmounted, giving up');
          retryCountRef.current.delete(userId);
        }
        
        return null;
      } finally {
        fetchingProfileRef.current = null;
        profileFetchPromiseRef.current.delete(userId);
        console.log('👤 [AuthProvider] Profile fetch completed for user:', userId);
      }
    })();

    // Store the promise for potential reuse
    profileFetchPromiseRef.current.set(userId, fetchPromise);
    
    return fetchPromise;
  }, [user]);

  // ENHANCED: Initialize auth state and listener with better error handling
  useEffect(() => {
    console.log('🔐 [AuthProvider] === INITIALIZING AUTH PROVIDER ===');
    
    // Prevent multiple initializations
    if (initializationRef.current) {
      console.log('🔐 [AuthProvider] Already initialized, skipping...');
      return;
    }

    initializationRef.current = true;
    mountedRef.current = true;

    let supabase: any;
    
    try {
      supabase = createClient();
      console.log('🔐 [AuthProvider] Supabase client created successfully');
    } catch (clientError) {
      console.error('🔐 [AuthProvider] Failed to create Supabase client:', clientError);
      setLoading(false);
      return;
    }

    // ENHANCED: Set up the auth state change listener with better error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 [AuthProvider] === AUTH STATE CHANGE ===');
        console.log('🔐 [AuthProvider] Event:', event);
        console.log('🔐 [AuthProvider] Session details:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          email: session?.user?.email,
          expiresAt: session?.expires_at,
          tokenType: session?.token_type,
          userMetadata: session?.user?.user_metadata
        });

        // Check if component is still mounted before updating state
        if (!mountedRef.current) {
          console.log('🔐 [AuthProvider] Component unmounted, ignoring auth state change');
          return;
        }

        try {
          // ENHANCED: Handle token refresh failures gracefully
          if (event === 'TOKEN_REFRESHED' && !session) {
            console.log('🔐 [AuthProvider] Token refresh failed, signing out and redirecting');
            try {
              await supabase.auth.signOut();
              if (mountedRef.current) {
                router.replace('/login');
              }
            } catch (signOutError) {
              console.error('🔐 [AuthProvider] Error during signout:', signOutError);
              if (mountedRef.current) {
                router.replace('/login');
              }
            }
            return;
          }

          // CRITICAL FIX: Be much more selective about when to fetch profiles
          // Only fetch profile in very specific cases where we absolutely need fresh data
          const shouldUpdateProfile = event === 'USER_UPDATED'; // Only when user data is explicitly updated

          console.log('🔐 [AuthProvider] Should update profile:', {
            shouldUpdateProfile,
            event,
            hasUser: !!session?.user,
            currentProfileUserId: userProfile?.id,
            sessionUserId: session?.user?.id,
            hasInitialProfile: !!initialAuthData.userProfile
          });

          // ENHANCED: Update session and user state atomically
          if (mountedRef.current) {
            setSession(session);
            setUser(session?.user ?? null);
          }
          
          if (session?.user && mountedRef.current) {
            console.log('🔐 [AuthProvider] User authenticated:', {
              userId: session.user.id,
              email: session.user.email,
              shouldUpdateProfile,
              hasCurrentProfile: !!userProfile,
              profileUserId: userProfile?.id,
              profileMatchesUser: userProfile?.id === session.user.id
            });
            
            // CRITICAL FIX: Only fetch profile if we absolutely need to
            // 1. If shouldUpdateProfile is true (USER_UPDATED event)
            // 2. If we have no profile at all AND no cached profile
            // 3. If the profile user ID doesn't match the session user ID
            const hasCachedProfile = profileCacheRef.current.has(session.user.id);
            const needsProfileFetch = shouldUpdateProfile || 
                                    (!userProfile && !hasCachedProfile) || 
                                    (userProfile && userProfile.id !== session.user.id);
            
            if (needsProfileFetch) {
              console.log('🔐 [AuthProvider] Fetching user profile...', {
                reason: shouldUpdateProfile ? 'shouldUpdateProfile' : 
                       (!userProfile && !hasCachedProfile) ? 'noProfile' : 
                       'userMismatch'
              });
              
              try {
                const profile = await fetchUserProfile(session.user.id, shouldUpdateProfile);
                if (mountedRef.current && profile) {
                  console.log('🔐 [AuthProvider] Setting user profile:', {
                    profileId: profile.id,
                    firstName: profile.first_name,
                    lastName: profile.last_name
                  });
                  setUserProfile(profile);
                } else if (mountedRef.current && !profile) {
                  console.warn('🔐 [AuthProvider] Profile fetch returned null, user may appear as public');
                }
              } catch (profileError) {
                console.error('🔐 [AuthProvider] Error fetching profile:', profileError);
                // Don't clear the profile on error, keep existing one if available
              }
            } else {
              console.log('🔐 [AuthProvider] Skipping profile fetch - already have current profile or cached data');
              
              // If we have cached profile but no current profile, use the cached one
              if (!userProfile && hasCachedProfile) {
                const cachedProfile = profileCacheRef.current.get(session.user.id);
                if (cachedProfile && mountedRef.current) {
                  console.log('🔐 [AuthProvider] Using cached profile data');
                  setUserProfile(cachedProfile);
                }
              }
            }
          } else if (!session?.user && mountedRef.current) {
            console.log('🔐 [AuthProvider] No user session, clearing profile and cache');
            setUserProfile(null);
            profileCacheRef.current.clear();
            profileFetchPromiseRef.current.clear();
            retryCountRef.current.clear();
          }

          // ENHANCED: Handle password recovery properly
          if (event === 'PASSWORD_RECOVERY' && mountedRef.current) {
            console.log('🔐 [AuthProvider] Password recovery detected, redirecting to update-password');
            router.push('/update-password');
          }

          console.log('🔐 [AuthProvider] Auth state change processing completed');
          
        } catch (stateChangeError) {
          console.error('🔐 [AuthProvider] Error processing auth state change:', stateChangeError);
          // Don't break the auth flow on errors
        }
      }
    );

    // Store subscription reference for cleanup
    subscriptionRef.current = subscription;
    console.log('🔐 [AuthProvider] Auth subscription created and stored');

    // ENHANCED: Cleanup function to prevent memory leaks
    return () => {
      console.log('🔐 [AuthProvider] === CLEANING UP AUTH PROVIDER ===');
      mountedRef.current = false;
      
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
        } catch (unsubError) {
          console.error('🔐 [AuthProvider] Error unsubscribing:', unsubError);
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
      console.log('🔐 [AuthProvider] Cleanup completed');
    };
  }, []); // Empty dependency array to ensure this runs only once

  // ENHANCED: Refresh user profile with better error handling
  const refreshUserProfile = useCallback(async () => {
    if (user && mountedRef.current) {
      console.log('🔐 [AuthProvider] Refreshing user profile for:', user.id);
      try {
        const profile = await fetchUserProfile(user.id, true);
        if (mountedRef.current && profile) {
          setUserProfile(profile);
          console.log('🔐 [AuthProvider] Profile refresh completed successfully');
        } else {
          console.warn('🔐 [AuthProvider] Profile refresh returned null');
        }
      } catch (refreshError) {
        console.error('🔐 [AuthProvider] Error refreshing profile:', refreshError);
      }
    } else {
      console.log('🔐 [AuthProvider] Cannot refresh profile - no user or component unmounted');
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
    
    console.log('🔐 [AuthProvider] Context value updated:', {
      hasUser: !!contextValue.user,
      userId: contextValue.user?.id,
      hasSession: !!contextValue.session,
      hasProfile: !!contextValue.userProfile,
      profileUserId: contextValue.userProfile?.id,
      loading: contextValue.loading,
      profileMatchesUser: contextValue.userProfile?.id === contextValue.user?.id
    });
    
    return contextValue;
  }, [user, session, loading, userProfile, refreshUserProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```