import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  console.log('🔧 [Supabase Server Client] Creating server client...');
  
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ [Supabase Server Client] Missing environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      nodeEnv: process.env.NODE_ENV
    });
    throw new Error('Missing Supabase environment variables. Please check your deployment configuration.');
  }

  // Validate URL format
  if (!supabaseUrl.startsWith('https://') || supabaseUrl.includes('your-project-id')) {
    console.error('❌ [Supabase Server Client] Invalid Supabase URL format:', supabaseUrl);
    throw new Error('Invalid Supabase URL format. Please check your environment variables.');
  }

  // Validate key format (basic check)
  if (supabaseAnonKey.length < 100 || supabaseAnonKey.includes('your-anon-key')) {
    console.error('❌ [Supabase Server Client] Invalid Supabase anon key format');
    throw new Error('Invalid Supabase anon key format. Please check your environment variables.');
  }
  
  console.log('✅ [Supabase Server Client] Environment variables validated successfully');
  
  let cookieStore;
  try {
    cookieStore = cookies();
  } catch (cookieError) {
    console.error('❌ [Supabase Server Client] Failed to access cookies:', cookieError);
    throw new Error('Failed to access request cookies. This function must be called in a server context.');
  }

  try {
    const client = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        },
        cookies: {
          get(name: string) {
            try {
              const value = cookieStore.get(name)?.value;
              if (name.includes('supabase') || name.includes('auth')) {
                console.log('🍪 [Supabase Server Client] Getting cookie:', { name, hasValue: !!value });
              }
              return value;
            } catch (error) {
              console.error('❌ [Supabase Server Client] Error getting cookie:', { name, error });
              return undefined;
            }
          },
          set(name: string, value: string, options: CookieOptions) {
            if (name.includes('supabase') || name.includes('auth')) {
              console.log('🍪 [Supabase Server Client] Setting cookie:', { name, hasValue: !!value, options });
            }
            try {
              cookieStore.set({ 
                name, 
                value, 
                ...options,
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
              })
            } catch (error) { 
              console.error('❌ [Supabase Server Client] Error setting cookie:', { name, error });
            }
          },
          remove(name: string, options: CookieOptions) {
            console.log('🗑️ [Supabase Server Client] Removing cookie:', { name, options });
            try {
              cookieStore.set({ 
                name, 
                value: '', 
                ...options,
                maxAge: 0,
                expires: new Date(0)
              })
            } catch (error) { 
              console.error('❌ [Supabase Server Client] Error removing cookie:', { name, error });
            }
          },
        },
      }
    );

    console.log('✅ [Supabase Server Client] Server client created successfully');
    return client;
  } catch (clientError) {
    console.error('❌ [Supabase Server Client] Failed to create Supabase client:', clientError);
    throw new Error(`Failed to create Supabase client: ${clientError instanceof Error ? clientError.message : 'Unknown error'}`);
  }
}