import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'

// Create a singleton client instance for the browser
export const createClient = () =>
  createBrowserSupabaseClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  })