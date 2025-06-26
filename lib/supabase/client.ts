import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../supabase'

// Create a singleton client instance for the browser
export const createClient = () => {
  console.log('🔧 [Supabase Client] Creating browser client...');
  
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
  
  console.log('🔧 [Supabase Client] Environment check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isBuildTime,
    nodeEnv: process.env.NODE_ENV
  });
  
  // Only validate environment variables at runtime, not during build
  if (!isBuildTime) {
    // Validate environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ [Supabase Client] Missing environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
      });
      throw new Error(
        'Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
      );
    }

    // Validate URL format
    if (!supabaseUrl.startsWith('https://') || supabaseUrl.includes('your-project-id')) {
      console.error('❌ [Supabase Client] Invalid URL format:', supabaseUrl);
      throw new Error(
        'Invalid Supabase URL. Please replace the placeholder in .env.local with your actual Supabase project URL.'
      );
    }

    // Validate anon key format
    if (supabaseAnonKey.includes('your-anon-key-here')) {
      console.error('❌ [Supabase Client] Invalid anon key format');
      throw new Error(
        'Invalid Supabase anon key. Please replace the placeholder in .env.local with your actual Supabase anon key.'
      );
    }
  }
  
  console.log('✅ [Supabase Client] Environment variables validated successfully');
  
  const client = createBrowserClient<Database>(
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
  
  console.log('✅ [Supabase Client] Browser client created successfully with config:', {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  });
  
  return client;
}