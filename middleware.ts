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

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/signup', 
    '/forgot-password',
    '/update-password',
    '/auth/callback',
    '/auth/auth-code-error',
    '/auth/session-expired',
    '/'
  ]

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/log',
    '/data',
    '/lab',
    '/community',
    '/settings'
  ]

  const pathname = request.nextUrl.pathname
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/auth/')
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  try {
    // Attempt to refresh session - this is critical for Server Components
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('🔐 [Middleware] Session check:', {
      pathname,
      hasSession: !!session,
      hasError: !!error,
      isPublicRoute,
      isProtectedRoute
    })

    // Handle protected routes without valid session
    if (isProtectedRoute && (!session || error)) {
      console.log('🚨 [Middleware] Protected route without valid session, redirecting to login')
      
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
      
      return redirectResponse
    }
    
    // Handle authenticated users on auth pages (except root and update-password)
    if (session && isPublicRoute && pathname !== '/' && pathname !== '/update-password') {
      console.log('🔄 [Middleware] Authenticated user on auth page, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
  } catch (error) {
    console.error('💥 [Middleware] Unexpected error during session check:', error)
    
    // On any unexpected error with protected routes, redirect to login
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