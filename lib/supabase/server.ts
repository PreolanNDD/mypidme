import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  console.log('🔧 [Supabase Server Client] Creating server client...');
  
  const cookieStore = cookies()

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      cookies: {
        get(name: string) {
          const value = cookieStore.get(name)?.value;
          if (name.includes('supabase') || name.includes('auth')) {
            console.log('🍪 [Supabase Server Client] Getting cookie:', { name, hasValue: !!value });
          }
          return value;
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
}