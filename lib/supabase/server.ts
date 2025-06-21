import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createClient = () => {
  console.log('🔧 [Supabase Server Client] Creating server client...');
  
  const cookieStore = cookies()

  const client = createServerComponentClient({ 
    cookies: () => cookieStore,
  });

  console.log('✅ [Supabase Server Client] Server client created successfully');
  return client;
}