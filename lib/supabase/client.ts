// lib/supabase.ts
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

export const createClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookieOptions: {
      secure: false, // Important for dev over http://localhost
    }
  }
)
