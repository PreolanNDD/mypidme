import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
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
    // Attempt to refresh session - this is critical for Server Components
    const { data: { session }, error } = await supabase.auth.getSession()
    
    // If there's an error or no session, and we're on a protected route
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                            request.nextUrl.pathname.startsWith('/log') ||
                            request.nextUrl.pathname.startsWith('/data') ||
                            request.nextUrl.pathname.startsWith('/lab') ||
                            request.nextUrl.pathname.startsWith('/community') ||
                            request.nextUrl.pathname.startsWith('/settings')
    
    if (error || (!session && isProtectedRoute)) {
      console.log('🚨 [Middleware] Session error or missing session for protected route:', {
        error: error?.message,
        hasSession: !!session,
        pathname: request.nextUrl.pathname,
        isProtectedRoute
      })
      
      // Clear all auth cookies to ensure clean state
      const authCookieNames = [
        'sb-access-token',
        'sb-refresh-token',
        'supabase-auth-token',
        'supabase.auth.token'
      ]
      
      // Create response that redirects to login
      const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
      
      // Clear all potential auth cookies
      authCookieNames.forEach(cookieName => {
        redirectResponse.cookies.set({
          name: cookieName,
          value: '',
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
      })
      
      // Also clear any cookies that start with 'sb-'
      request.cookies.getAll().forEach(cookie => {
        if (cookie.name.startsWith('sb-')) {
          redirectResponse.cookies.set({
            name: cookie.name,
            value: '',
            expires: new Date(0),
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          })
        }
      })
      
      console.log('🔄 [Middleware] Redirecting to login and clearing auth cookies')
      return redirectResponse
    }
    
    // If we're on auth pages but have a valid session, redirect to dashboard
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                       request.nextUrl.pathname.startsWith('/signup') ||
                       request.nextUrl.pathname.startsWith('/forgot-password') ||
                       request.nextUrl.pathname === '/'
    
    if (session && isAuthRoute && request.nextUrl.pathname !== '/') {
      console.log('🔄 [Middleware] Authenticated user on auth page, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
  } catch (error) {
    console.error('💥 [Middleware] Unexpected error during session check:', error)
    
    // On any unexpected error, clear cookies and redirect to login if on protected route
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                            request.nextUrl.pathname.startsWith('/log') ||
                            request.nextUrl.pathname.startsWith('/data') ||
                            request.nextUrl.pathname.startsWith('/lab') ||
                            request.nextUrl.pathname.startsWith('/community') ||
                            request.nextUrl.pathname.startsWith('/settings')
    
    if (isProtectedRoute) {
      const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
      
      // Clear auth cookies on error
      const authCookieNames = [
        'sb-access-token',
        'sb-refresh-token',
        'supabase-auth-token',
        'supabase.auth.token'
      ]
      
      authCookieNames.forEach(cookieName => {
        redirectResponse.cookies.set({
          name: cookieName,
          value: '',
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
      })
      
      return redirectResponse
    }
  }

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