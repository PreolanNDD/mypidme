import { createBrowserClient } from '@supabase/ssr'

// Create a singleton client instance for the browser
export const createClient = () => {
  console.log('🔧 [Supabase Client] Creating browser client...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('🔧 [Supabase Client] Environment check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined',
    keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined'
  });
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ [Supabase Client] Missing environment variables');
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
        flowType: 'pkce'
      }
    }
  );
  
  console.log('✅ [Supabase Client] Browser client created successfully');
  return client;
}