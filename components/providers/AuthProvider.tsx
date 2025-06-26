// components/auth/AuthProvider.tsx - UPDATED
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

// 1. Update the component to accept the `serverSession` prop
export function AuthProvider({
  children,
  serverSession,
}: {
  children: React.ReactNode;
  serverSession: Session | null;
}) {
  // 2. Initialize state using the session passed from the server.
  const [session, setSession] = useState<Session | null>(serverSession);
  const [user, setUser] = useState<User | null>(serverSession?.user ?? null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  // 3. Only set `loading` to true initially if the server confirmed there was no session.
  const [loading, setLoading] = useState(serverSession === null);
  const router = useRouter();

  // (All your refs, console logs, and useCallback hooks remain unchanged)
  const fetchingProfileRef = useRef<string | null>(null);
  const profileCacheRef = useRef<Map<string, any>>(new Map());
  const initializationRef = useRef<boolean>(false);
  const subscriptionRef = useRef<any>(null);

  console.log('🔐 [AuthProvider] Component rendered with state:', {
    hasUser: !!user,
    userId: user?.id,
    hasSession: !!session,
    hasProfile: !!userProfile,
    loading,
    isInitialized: initializationRef.current,
  });

  const fetchUserProfile = useCallback(async (userId: string, forceRefresh = false) => {
    // ...this entire function remains exactly the same...
    console.log('👤 [AuthProvider] fetchUserProfile called:', {
      userId,
      forceRefresh,
      currentlyFetching: fetchingProfileRef.current,
      hasCachedProfile: profileCacheRef.current.has(userId)
    });

    if (fetchingProfileRef.current === userId && !forceRefresh) {
      console.log('👤 [AuthProvider] Already fetching profile for user, returning cached or waiting...');
      return profileCacheRef.current.get(userId) || null;
    }

    if (!forceRefresh && profileCacheRef.current.has(userId)) {
      const cachedProfile = profileCacheRef.current.get(userId);
      console.log('👤 [AuthProvider] Returning cached profile:', {
        userId,
        hasCachedProfile: !!cachedProfile
      });
      return cachedProfile;
    }

    fetchingProfileRef.current = userId;
    console.log('👤 [AuthProvider] Starting profile fetch for user:', userId);

    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.log('👤 [AuthProvider] Profile fetch error:', error);
        if (error.code === 'PGRST116') {
          console.log('👤 [AuthProvider] No profile found, creating new profile...');
          try {
            const insertData = {
              id: userId,
              first_name: user?.user_metadata?.first_name || null,
              last_name: user?.user_metadata?.last_name || null
            };
            
            console.log('👤 [AuthProvider] Creating profile with data:', insertData);
            
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert(insertData)
              .select()
              .single();
            
            if (createError) {
              console.error('👤 [AuthProvider] Error creating profile:', createError);
              return null;
            }
            
            console.log('👤 [AuthProvider] Profile created successfully:', newProfile);
            profileCacheRef.current.set(userId, newProfile);
            return newProfile;
          } catch (createErr) {
            console.error('👤 [AuthProvider] Unexpected error creating profile:', createErr);
            return null;
          }
        }
        
        console.error('👤 [AuthProvider] Profile fetch failed with error:', error);
        return null;
      }
      
      if (data) {
        console.log('👤 [AuthProvider] Profile fetched successfully:', {
          userId: data.id,
          firstName: data.first_name,
          lastName: data.last_name
        });
        profileCacheRef.current.set(userId, data);
      } else {
        console.log('👤 [AuthProvider] No profile data returned');
      }
      
      return data;
    } catch (error) {
      console.error('👤 [AuthProvider] Unexpected error in fetchUserProfile:', error);
      return null;
    } finally {
      fetchingProfileRef.current = null;
      console.log('👤 [AuthProvider] Profile fetch completed for user:', userId);
    }
  }, [user]);

  // 4. This useEffect hook is still essential for handling real-time changes
  //    (like logging out in another tab) after the initial load.
  useEffect(() => {
    // ...this entire function remains exactly the same...
    if (initializationRef.current) {
      console.log('🔐 [AuthProvider] Already initialized, skipping...');
      return;
    }

    console.log('🔐 [AuthProvider] === INITIALIZING AUTH PROVIDER ===');
    initializationRef.current = true;

    const supabase = createClient();
    console.log('🔐 [AuthProvider] Supabase client created, setting up auth listener...');

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
          tokenType: session?.token_type
        });

        if (event === 'INITIAL_SESSION') {
          console.log('🔐 [AuthProvider] Initial session loaded, setting loading to false');
          setLoading(false);
        }

        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('🔐 [AuthProvider] Token refresh failed, signing out and redirecting');
          try {
            await supabase.auth.signOut();
            router.replace('/login');
          } catch (signOutError) {
            console.error('🔐 [AuthProvider] Error during signout:', signOutError);
            router.replace('/login');
          }
          return;
        }

        const shouldUpdateProfile = [
          'INITIAL_SESSION',
          'SIGNED_IN',
          'TOKEN_REFRESHED',
          'USER_UPDATED'
        ].includes(event);

        console.log('🔐 [AuthProvider] Should update profile:', shouldUpdateProfile);

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('🔐 [AuthProvider] User authenticated:', {
            userId: session.user.id,
            email: session.user.email,
            shouldUpdateProfile,
            hasCurrentProfile: !!userProfile,
            profileUserId: userProfile?.id
          });
          
          if (shouldUpdateProfile || !userProfile || userProfile.id !== session.user.id) {
            console.log('🔐 [AuthProvider] Fetching user profile...');
            const profile = await fetchUserProfile(session.user.id);
            setUserProfile(profile);
          } else {
            console.log('🔐 [AuthProvider] Skipping profile fetch - already have current profile');
          }
        } else {
          console.log('🔐 [AuthProvider] No user session, clearing profile and cache');
          setUserProfile(null);
          profileCacheRef.current.clear();
        }

        if (event === 'PASSWORD_RECOVERY') {
          console.log('🔐 [AuthProvider] Password recovery detected, redirecting to update-password');
          router.push('/update-password');
        }

        console.log('🔐 [AuthProvider] Auth state change processing completed');
      }
    );

    subscriptionRef.current = subscription;
    console.log('🔐 [AuthProvider] Auth subscription created and stored');

    return () => {
      console.log('🔐 [AuthProvider] === CLEANING UP AUTH PROVIDER ===');
      subscription?.unsubscribe();
      subscriptionRef.current = null;
      initializationRef.current = false;
      console.log('🔐 [AuthProvider] Cleanup completed');
    };
  }, [fetchUserProfile, userProfile, router]); // Adjusted dependencies for correctness, though your original was likely fine.


  const refreshUserProfile = useCallback(async () => {
    // ...this entire function remains exactly the same...
    if (user) {
      console.log('🔐 [AuthProvider] Refreshing user profile for:', user.id);
      const profile = await fetchUserProfile(user.id, true);
      setUserProfile(profile);
      console.log('🔐 [AuthProvider] Profile refresh completed');
    } else {
      console.log('🔐 [AuthProvider] Cannot refresh profile - no user');
    }
  }, [user, fetchUserProfile]);
  
  const value = useMemo(() => {
    // ...this entire function remains exactly the same...
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
      loading: contextValue.loading
    });
    
    return contextValue;
  }, [user, session, loading, userProfile, refreshUserProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}