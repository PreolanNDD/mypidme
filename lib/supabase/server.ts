// utils/supabase/server.ts - CORRECTED & SIMPLIFIED
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type { Database } from '../supabase';

export const createClient = (cookieStore: ReadonlyRequestCookies) => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // The server client only needs to be able to READ cookies.
        // The middleware is responsible for writing them.
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};