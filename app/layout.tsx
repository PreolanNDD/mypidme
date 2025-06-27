import './globals.css';
import type { Metadata } from 'next';
import { Inter, DM_Serif_Display } from 'next/font/google';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { createClient } from '@/lib/supabase/server';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const dmSerifDisplay = DM_Serif_Display({ 
  weight: ['400'], 
  subsets: ['latin'],
  variable: '--font-dm-serif',
});

export const metadata: Metadata = {
  title: 'PIDMe - Tune Your Life',
  description: 'A personal optimization platform inspired by PID controllers',
};

async function getInitialAuthData() {
  console.log('🔧 [RootLayout] === FETCHING INITIAL AUTH DATA ON SERVER ===');
  
  try {
    const supabase = createClient();
    
    // Get the current user session
    console.log('🔧 [RootLayout] Fetching user session...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      if (userError.message === 'Auth session missing!' || userError.name === 'AuthSessionMissingError') {
        console.log('🔧 [RootLayout] No auth session found (user not authenticated)');
        return { user: null, userProfile: null, session: null };
      } else {
        console.error('❌ [RootLayout] Unexpected authentication error:', userError);
        return { user: null, userProfile: null, session: null };
      }
    }

    if (!user) {
      console.log('🔧 [RootLayout] No user found');
      return { user: null, userProfile: null, session: null };
    }

    console.log('✅ [RootLayout] User found:', {
      userId: user.id,
      email: user.email
    });

    // Get the session data
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ [RootLayout] Error fetching session:', sessionError);
    }

    // Fetch the user profile from the users table
    console.log('👤 [RootLayout] Fetching user profile...');
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.log('👤 [RootLayout] No profile found, creating new profile...');
        
        // Create a new profile using user metadata
        const userMetadata = user.user_metadata || {};
        const insertData = {
          id: user.id,
          first_name: userMetadata.first_name || null,
          last_name: userMetadata.last_name || null
        };
        
        console.log('👤 [RootLayout] Creating profile with data:', insertData);
        
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert(insertData)
          .select()
          .single();
        
        if (createError) {
          console.error('❌ [RootLayout] Error creating profile:', createError);
          // Return a fallback profile
          const fallbackProfile = {
            id: user.id,
            first_name: userMetadata.first_name || null,
            last_name: userMetadata.last_name || null,
            created_at: user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          console.log('🔧 [RootLayout] Using fallback profile:', fallbackProfile);
          return { user, userProfile: fallbackProfile, session };
        }
        
        console.log('✅ [RootLayout] Profile created successfully:', newProfile);
        return { user, userProfile: newProfile, session };
      } else {
        console.error('❌ [RootLayout] Error fetching profile:', profileError);
        return { user, userProfile: null, session };
      }
    }

    console.log('✅ [RootLayout] Profile fetched successfully:', {
      profileId: userProfile?.id,
      firstName: userProfile?.first_name,
      lastName: userProfile?.last_name
    });

    console.log('🔧 [RootLayout] === INITIAL AUTH DATA FETCH COMPLETED ===');
    return { user, userProfile, session };

  } catch (error) {
    console.error('💥 [RootLayout] Unexpected error fetching initial auth data:', error);
    
    // Check if this is a cookies-related error (happens during build/static generation)
    if (error instanceof Error && error.message.includes('cookies')) {
      console.log('🔧 [RootLayout] Cookies error detected - returning null auth data for build');
      return { user: null, userProfile: null, session: null };
    }
    
    return { user: null, userProfile: null, session: null };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch initial auth data on the server
  const initialAuthData = await getInitialAuthData();

  console.log('🔧 [RootLayout] Rendering with initial auth data:', {
    hasUser: !!initialAuthData.user,
    hasProfile: !!initialAuthData.userProfile,
    hasSession: !!initialAuthData.session
  });

  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSerifDisplay.variable} bg-background text-primary-text font-sans antialiased`}>
        <QueryProvider>
          <AuthProvider initialAuthData={initialAuthData}>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}