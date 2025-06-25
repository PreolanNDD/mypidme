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

  const pathname = request.nextUrl.pathname
  // Normalize pathname by removing trailing slash (except for root)
  const normalizedPathname = pathname === '/' ? pathname : pathname.replace(/\/$/, '')
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup', 
    '/forgot-password',
    '/update-password'
  ]

  // Define protected route prefixes that require authentication
  const protectedRoutePrefixes = [
    '/dashboard',
    '/log',
    '/data',
    '/lab',
    '/community',
    '/settings'
  ]

  // Check if the normalized pathname is a public route
  const isPublicRoute = publicRoutes.includes(normalizedPathname) || 
                       normalizedPathname.startsWith('/auth/') ||
                       normalizedPathname.startsWith('/_next/') ||
                       normalizedPathname.includes('.')

  // Check if the normalized pathname is a protected route
  const isProtectedRoute = protectedRoutePrefixes.some(prefix => 
    normalizedPathname.startsWith(prefix)
  )

  console.log('🔐 [Middleware] Route analysis:', {
    pathname,
    normalizedPathname,
    isPublicRoute,
    isProtectedRoute
  })

  // Skip middleware for static files and Next.js internals
  if (normalizedPathname.startsWith('/_next/') || 
      normalizedPathname.includes('.') || 
      normalizedPathname.startsWith('/api/')) {
    return response
  }

  try {
    // Attempt to refresh session - this is critical for Server Components
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('🔐 [Middleware] Session check:', {
      pathname: normalizedPathname,
      hasSession: !!session,
      hasError: !!error,
      isPublicRoute,
      isProtectedRoute
    })

    // Handle protected routes without valid session
    if (isProtectedRoute && (!session || error)) {
      console.log('🚨 [Middleware] Protected route without valid session, redirecting to login')
      
      // Prevent redirect loop - don't redirect if already going to login
      if (normalizedPathname === '/login') {
        return response
      }
      
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
    if (session && isPublicRoute && normalizedPathname !== '/' && normalizedPathname !== '/update-password') {
      console.log('🔄 [Middleware] Authenticated user on auth page, redirecting to dashboard')
      
      // Prevent redirect loop - don't redirect if already going to dashboard
      if (normalizedPathname === '/dashboard') {
        return response
      }
      
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
  } catch (error) {
    console.error('💥 [Middleware] Unexpected error during session check:', error)
    
    // On any unexpected error with protected routes, redirect to login
    if (isProtectedRoute && normalizedPathname !== '/login') {
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