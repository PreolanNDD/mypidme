import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('🔧 [Middleware] Request intercepted:', {
    url: request.url,
    method: request.method,
    pathname: request.nextUrl.pathname,
    timestamp: new Date().toISOString()
  });

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = request.cookies.get(name)?.value;
          if (name.includes('supabase') || name.includes('auth')) {
            console.log('🍪 [Middleware] Getting cookie:', { name, hasValue: !!value });
          }
          return value;
        },
        set(name: string, value: string, options: CookieOptions) {
          if (name.includes('supabase') || name.includes('auth')) {
            console.log('🍪 [Middleware] Setting cookie:', { name, hasValue: !!value, options });
          }
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          console.log('🗑️ [Middleware] Removing cookie:', { name, options });
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    console.log('🔐 [Middleware] Checking user authentication...');
    // This will refresh the user's session cookie if it's expired
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ [Middleware] Auth error:', error);
    } else if (user) {
      console.log('✅ [Middleware] User authenticated:', { 
        userId: user.id, 
        email: user.email,
        lastSignIn: user.last_sign_in_at 
      });
    } else {
      console.log('👤 [Middleware] No authenticated user found');
    }
  } catch (error) {
    console.error('💥 [Middleware] Critical auth check error:', error);
  }

  console.log('🔧 [Middleware] Request processing complete, forwarding to app');
  return response;
}

// Ensure the middleware is only called for relevant paths.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}