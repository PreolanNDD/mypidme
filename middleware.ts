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

  // Skip middleware for static files, API routes, and Next.js internals
  if (normalizedPathname.startsWith('/_next/') || 
      normalizedPathname.startsWith('/api/') ||
      normalizedPathname.includes('.') ||
      normalizedPathname.startsWith('/auth/callback') ||
      normalizedPathname.startsWith('/auth/auth-code-error') ||
      normalizedPathname.startsWith('/auth/session-expired')) {
    return response
  }

  // Check if the normalized pathname is a public route
  const isPublicRoute = publicRoutes.includes(normalizedPathname)

  // Check if the normalized pathname is a protected route
  const isProtectedRoute = protectedRoutePrefixes.some(prefix => 
    normalizedPathname.startsWith(prefix)
  )

  console.log('🔐 [Middleware] Route analysis:', {
    pathname: normalizedPathname,
    isPublicRoute,
    isProtectedRoute
  })

  // Check for recent auth activity to avoid interfering with login flow
  const authTimestamp = request.cookies.get('auth_timestamp')?.value
  const isRecentAuth = authTimestamp && (Date.now() - parseInt(authTimestamp)) < 2000 // 2 seconds

  if (isRecentAuth) {
    console.log('🕐 [Middleware] Recent auth activity detected, allowing request to proceed')
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
      isProtectedRoute,
      isRecentAuth
    })

    // Handle protected routes without valid session
    if (isProtectedRoute && (!session || error)) {
      console.log('🚨 [Middleware] Protected route without valid session, redirecting to login')
      
      // Prevent redirect loop - don't redirect if already going to login
      if (normalizedPathname === '/login') {
        return response
      }
      
      // Add a small delay for auth state to sync, then redirect
      const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
      
      // Set a cookie to track this redirect to prevent loops
      redirectResponse.cookies.set('redirect_timestamp', Date.now().toString(), {
        maxAge: 5, // 5 seconds
        httpOnly: true
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
      
      // Check for recent redirect to prevent loops
      const redirectTimestamp = request.cookies.get('redirect_timestamp')?.value
      const isRecentRedirect = redirectTimestamp && (Date.now() - parseInt(redirectTimestamp)) < 5000 // 5 seconds
      
      if (isRecentRedirect) {
        console.log('🔄 [Middleware] Recent redirect detected, allowing request to proceed')
        return response
      }
      
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
  } catch (error) {
    console.error('💥 [Middleware] Unexpected error during session check:', error)
    
    // On any unexpected error with protected routes, redirect to login
    // But only if it's not a recent auth attempt
    if (isProtectedRoute && normalizedPathname !== '/login' && !isRecentAuth) {
      return NextResponse.redirect(new URL('/login', request.url))
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