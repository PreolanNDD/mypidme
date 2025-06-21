import { createBrowserClient } from '@supabase/ssr'

// Create a singleton client instance for the browser
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  const client = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'supabase.auth.token'
      },
      cookies: {
        get(key: string) {
          if (typeof document === 'undefined') return undefined;
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === key) return decodeURIComponent(value);
          }
          return undefined;
        },
        set(key: string, value: string, options: any) {
          if (typeof document === 'undefined') return;
          let cookieString = `${key}=${encodeURIComponent(value)}`;
          if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`;
          if (options?.path) cookieString += `; path=${options.path}`;
          if (options?.domain) cookieString += `; domain=${options.domain}`;
          if (options?.secure) cookieString += '; secure';
          if (options?.sameSite) cookieString += `; samesite=${options.sameSite}`;
          document.cookie = cookieString;
        },
        remove(key: string, options: any) {
          if (typeof document === 'undefined') return;
          let cookieString = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          if (options?.path) cookieString += `; path=${options.path}`;
          if (options?.domain) cookieString += `; domain=${options.domain}`;
          document.cookie = cookieString;
        }
      }
    }
  );
  
  return client;
}