// utils/supabase/server.ts - CORRECTED & SIMPLIFIED
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // The server client only needs to be ableto READ cookies.
        // The middleware is responsible for writing them.
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};