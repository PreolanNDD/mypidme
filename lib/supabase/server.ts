import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createClient = () => {
  console.log('🔧 [Supabase Server Client] Creating server client...');
  
  const client = createServerComponentClient({ 
    cookies,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });

  console.log('✅ [Supabase Server Client] Server client created successfully');
  return client;
}