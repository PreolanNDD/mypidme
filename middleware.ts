import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('🔧 [Middleware] === REQUEST PROCESSING STARTED ===');
  console.log('🔧 [Middleware] Request details:', {
    url: request.url,
    pathname: request.nextUrl.pathname,
    method: request.method,
    userAgent: request.headers.get('user-agent')?.substring(0, 100) + '...',
    hasAuthCookies: request.cookies.getAll().some(cookie => 
      cookie.name.includes('supabase') || cookie.name.includes('auth')
    )
  });

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  console.log('🔧 [Middleware] Creating Supabase server client...');

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = request.cookies.get(name)?.value;
          if (name.includes('supabase') || name.includes('auth')) {
            console.log('🍪 [Middleware] Getting cookie:', { 
              name, 
              hasValue: !!value,
              valueLength: value?.length || 0
            });
          }
          return value;
        },
        set(name: string, value: string, options: CookieOptions) {
          if (name.includes('supabase') || name.includes('auth')) {
            console.log('🍪 [Middleware] Setting cookie:', { 
              name, 
              hasValue: !!value,
              valueLength: value?.length || 0,
              options: {
                ...options,
                // Don't log the actual value for security
                value: value ? '[REDACTED]' : 'empty'
              }
            });
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
          console.log('✅ [Middleware] Cookie set in response:', name);
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
          console.log('✅ [Middleware] Cookie removed from response:', name);
        },
      },
    }
  )

  console.log('🔧 [Middleware] Checking authentication state...');
  
  // FIXED: Handle auth session missing gracefully - this is expected for unauthenticated users
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      // Check if it's the expected "Auth session missing" error for unauthenticated users
      if (error.message === 'Auth session missing!' || error.name === 'AuthSessionMissingError') {
        console.log('🔧 [Middleware] No auth session found (user not authenticated) - this is normal for public pages');
        console.log('🔧 [Middleware] User authentication result:', {
          hasUser: false,
          authenticated: false,
          reason: 'No session'
        });
      } else {
        // Log other types of auth errors
        console.error('❌ [Middleware] Unexpected authentication error:', {
          error: error.message,
          name: error.name,
          status: error.status
        });
      }
    } else {
      // Successfully got user (or confirmed no user)
      console.log('🔧 [Middleware] User authentication result:', {
        hasUser: !!user,
        userId: user?.id,
        email: user?.email,
        lastSignIn: user?.last_sign_in_at,
        authenticated: !!user
      });
    }
  } catch (authError) {
    console.error('❌ [Middleware] Unexpected error during user authentication:', authError);
  }

  console.log('🔧 [Middleware] === REQUEST PROCESSING COMPLETED ===');
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}