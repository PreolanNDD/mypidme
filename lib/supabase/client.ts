import { createBrowserClient } from '@supabase/ssr'

// Create a singleton client instance for the browser
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Check if we're in a build environment
  const isBuildTime = process.env.NODE_ENV === 'production' && !supabaseUrl;
  
  // During build time, provide fallback values to prevent build failures
  const fallbackUrl = 'https://placeholder.supabase.co';
  const fallbackKey = 'placeholder-anon-key';
  
  // Use actual values if available, otherwise use fallbacks during build
  const clientUrl = supabaseUrl || (isBuildTime ? fallbackUrl : '');
  const clientKey = supabaseAnonKey || (isBuildTime ? fallbackKey : '');
  
  // Only validate environment variables at runtime, not during build
  if (!isBuildTime) {
    // Validate environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
      );
    }

    // Validate URL format
    if (!supabaseUrl.startsWith('https://') || supabaseUrl.includes('your-project-id')) {
      throw new Error(
        'Invalid Supabase URL. Please replace the placeholder in .env.local with your actual Supabase project URL.'
      );
    }

    // Validate anon key format
    if (supabaseAnonKey.includes('your-anon-key-here')) {
      throw new Error(
        'Invalid Supabase anon key. Please replace the placeholder in .env.local with your actual Supabase anon key.'
      );
    }
  }
  
  const client = createBrowserClient(
    clientUrl,
    clientKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  );
  
  // Add global error handler for auth errors
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED' && !session) {
      console.log('🚨 [Supabase Client] Token refresh failed, session is null');
      // The AuthProvider will handle the cleanup and redirect
    }
  });
  
  return client;
}