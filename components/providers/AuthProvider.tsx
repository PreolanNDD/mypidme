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
  const initializationRef = useRef<boolean>(false);

  const fetchUserProfile = useCallback(async (userId: string, forceRefresh = false) => {
    const startTime = Date.now();
    console.log('🔍 [AuthProvider] === PROFILE FETCH STARTED ===');
    console.log('🔍 [AuthProvider] User ID:', userId);
    console.log('🔍 [AuthProvider] Force refresh:', forceRefresh);
    console.log('🔍 [AuthProvider] Current fetching user:', fetchingProfileRef.current);
    console.log('🔍 [AuthProvider] Cache has user:', profileCacheRef.current.has(userId));

    // Prevent concurrent fetches for the same user
    if (fetchingProfileRef.current === userId && !forceRefresh) {
      console.log('⚠️ [AuthProvider] Profile fetch already in progress for user:', userId);
      return profileCacheRef.current.get(userId) || null;
    }

    // Return cached profile if available and not forcing refresh
    if (!forceRefresh && profileCacheRef.current.has(userId)) {
      console.log('💾 [AuthProvider] Returning cached profile for user:', userId);
      const cachedProfile = profileCacheRef.current.get(userId);
      console.log('💾 [AuthProvider] Cached profile data:', cachedProfile);
      return cachedProfile;
    }

    fetchingProfileRef.current = userId;

    try {
      console.log('🌐 [AuthProvider] Creating Supabase client...');
      const supabase = createClient();
      console.log('✅ [AuthProvider] Supabase client created successfully');
      
      console.log('📡 [AuthProvider] Starting database query...');
      console.log('📡 [AuthProvider] Query: SELECT * FROM users WHERE id = ?', userId);
      
      // Add a timeout for better debugging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout after 10 seconds')), 10000);
      });
      
      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      console.log('⏱️ [AuthProvider] Waiting for database response...');
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      const fetchTime = Date.now() - startTime;
      console.log(`⏱️ [AuthProvider] Database query completed in ${fetchTime}ms`);
      
      if (error) {
        console.error('❌ [AuthProvider] Database query error:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Check if it's the specific "no rows returned" error
        if (error.code === 'PGRST116') {
          console.log('🆕 [AuthProvider] User profile not found, creating new profile...');
          console.log('🆕 [AuthProvider] User metadata available:', {
            hasMetadata: !!user?.user_metadata,
            metadata: user?.user_metadata
          });
          
          try {
            const insertData = {
              id: userId,
              first_name: user?.user_metadata?.first_name || null,
              last_name: user?.user_metadata?.last_name || null
            };
            
            console.log('📝 [AuthProvider] Inserting new profile with data:', insertData);
            
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert(insertData)
              .select()
              .single();
            
            if (createError) {
              console.error('❌ [AuthProvider] Error creating user profile:', {
                error: createError,
                code: createError.code,
                message: createError.message,
                details: createError.details
              });
              return null;
            }
            
            console.log('✅ [AuthProvider] User profile created successfully:', newProfile);
            // Cache the new profile
            profileCacheRef.current.set(userId, newProfile);
            return newProfile;
          } catch (createErr) {
            console.error('💥 [AuthProvider] Failed to create user profile:', createErr);
            return null;
          }
        }
        
        console.error('💥 [AuthProvider] Unhandled database error:', error);
        return null;
      }
      
      console.log('📊 [AuthProvider] Database query result:', {
        hasData: !!data,
        dataType: typeof data,
        dataKeys: data ? Object.keys(data) : 'N/A'
      });
      
      if (data) {
        console.log('✅ [AuthProvider] User profile fetched successfully:', {
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
        
        // Cache the profile
        profileCacheRef.current.set(userId, data);
        console.log('💾 [AuthProvider] Profile cached for user:', userId);
      } else {
        console.log('⚠️ [AuthProvider] Query successful but no data returned');
      }
      
      const totalTime = Date.now() - startTime;
      console.log(`🏁 [AuthProvider] === PROFILE FETCH COMPLETED in ${totalTime}ms ===`);
      
      return data;
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error('💥 [AuthProvider] === PROFILE FETCH FAILED ===');
      console.error('💥 [AuthProvider] Error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        totalTime: `${totalTime}ms`
      });
      return null;
    } finally {
      fetchingProfileRef.current = null;
      console.log('🧹 [AuthProvider] Profile fetch cleanup completed');
    }
  }, [user]);

  useEffect(() => {
    // CRITICAL FIX: Prevent multiple initializations
    if (initializationRef.current) {
      console.log('⚠️ [AuthProvider] Initialization already in progress, skipping...');
      return;
    }

    initializationRef.current = true;
    console.log("🚀 [AuthProvider] === AUTH PROVIDER INITIALIZATION ===");
    console.log("🚀 [AuthProvider] Setting up auth state listener");

    const supabase = createClient();
    console.log("🚀 [AuthProvider] Supabase client created for auth listener");

    // Set up the auth state change listener - this is our single source of truth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const eventStartTime = Date.now();
        console.log(`🔔 [AuthProvider] === AUTH EVENT: ${event} ===`);
        console.log(`🔔 [AuthProvider] Event timestamp:`, new Date().toISOString());
        console.log(`🔔 [AuthProvider] Session details:`, {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          expiresAt: session?.expires_at,
          tokenType: session?.token_type,
          userMetadata: session?.user?.user_metadata
        });

        // Handle the initial session load
        if (event === 'INITIAL_SESSION') {
          console.log('🎯 [AuthProvider] Processing initial session');
          setLoading(false);
          console.log('🎯 [AuthProvider] Loading state set to false');
        }

        // Handle invalid refresh token errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('🧹 [AuthProvider] Token refresh failed, likely invalid refresh token');
          
          try {
            await supabase.auth.signOut();
            console.log('✅ [AuthProvider] Session cleared after failed token refresh');
            router.replace('/login');
          } catch (signOutError) {
            console.log('⚠️ [AuthProvider] Error during session cleanup:', signOutError);
            router.replace('/login');
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

        console.log('📝 [AuthProvider] Updating session and user state...');
        setSession(session);
        setUser(session?.user ?? null);
        console.log('📝 [AuthProvider] Session and user state updated');
        
        if (session?.user) {
          console.log('👤 [AuthProvider] User found in session, checking profile...');
          console.log('👤 [AuthProvider] Should update profile:', shouldUpdateProfile);
          console.log('👤 [AuthProvider] Current userProfile state:', {
            hasProfile: !!userProfile,
            profileUserId: userProfile?.id,
            sessionUserId: session.user.id,
            profileMismatch: userProfile?.id !== session.user.id
          });

          // Only fetch profile in specific cases to avoid unnecessary requests
          if (shouldUpdateProfile || !userProfile || userProfile.id !== session.user.id) {
            console.log(`🔄 [AuthProvider] Fetching profile due to event: ${event}`);
            const profile = await fetchUserProfile(session.user.id);
            console.log('🔄 [AuthProvider] Profile fetch result:', {
              hasProfile: !!profile,
              profileData: profile
            });
            setUserProfile(profile);
            console.log('🔄 [AuthProvider] Profile state updated');
          } else {
            console.log(`⏭️ [AuthProvider] Skipping profile fetch for event: ${event} (profile already exists)`);
          }
        } else {
          console.log('👤 [AuthProvider] No user in session, clearing profile...');
          setUserProfile(null);
          // Clear profile cache when user logs out
          profileCacheRef.current.clear();
          console.log('👤 [AuthProvider] Profile cleared and cache emptied');
        }

        if (event === 'PASSWORD_RECOVERY') {
          console.log("🔑 [AuthProvider] Password recovery detected, redirecting...");
          router.push('/update-password');
        }

        const eventTime = Date.now() - eventStartTime;
        console.log(`🏁 [AuthProvider] === AUTH EVENT ${event} COMPLETED in ${eventTime}ms ===`);
      }
    );

    console.log("🚀 [AuthProvider] Auth state listener registered successfully");

    return () => {
      console.log("🧹 [AuthProvider] === AUTH PROVIDER CLEANUP ===");
      console.log("🧹 [AuthProvider] Unsubscribing from auth state changes");
      subscription?.unsubscribe();
      initializationRef.current = false; // Reset initialization flag
      console.log("🧹 [AuthProvider] Cleanup completed");
    };
  }, []); // CRITICAL: Empty dependency array to prevent re-initialization

  
  const refreshUserProfile = useCallback(async () => {
    console.log('🔄 [AuthProvider] === MANUAL PROFILE REFRESH REQUESTED ===');
    if (user) {
      console.log('🔄 [AuthProvider] User available, forcing profile refresh for:', user.id);
      const profile = await fetchUserProfile(user.id, true); // Force refresh
      console.log('🔄 [AuthProvider] Manual refresh result:', profile);
      setUserProfile(profile);
      console.log('🔄 [AuthProvider] Manual refresh completed');
    } else {
      console.log('⚠️ [AuthProvider] No user available for manual refresh');
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
    
    console.log('🔄 [AuthProvider] Context value updated:', {
      hasUser: !!user,
      hasSession: !!session,
      loading,
      hasUserProfile: !!userProfile,
      userProfileId: userProfile?.id,
      userEmail: user?.email,
      userMetadata: user?.user_metadata
    });
    
    return contextValue;
  }, [user, session, loading, userProfile, refreshUserProfile]);

  console.log('🎨 [AuthProvider] Rendering AuthProvider with current state:', {
    hasUser: !!user,
    hasSession: !!session,
    loading,
    hasUserProfile: !!userProfile
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}