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

  // Normalize pathname by removing trailing slash (except for root)
  const pathname = request.nextUrl.pathname === '/' 
    ? '/' 
    : request.nextUrl.pathname.replace(/\/$/, '')
  
  console.log('🔍 [Middleware] Processing request:', {
    originalPathname: request.nextUrl.pathname,
    normalizedPathname: pathname
  })
  
  // Skip middleware for static files, API routes, and Next.js internals
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/api/') ||
      pathname.includes('.') ||
      pathname.startsWith('/auth/')) {
    return response
  }

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

  const isPublicRoute = publicRoutes.includes(pathname)
  const isProtectedRoute = protectedRoutePrefixes.some(prefix => 
    pathname.startsWith(prefix)
  )

  console.log('🔍 [Middleware] Route classification:', {
    pathname,
    isPublicRoute,
    isProtectedRoute
  })

  // Check for recent auth activity to avoid interfering with login flow
  const authTimestamp = request.cookies.get('auth_timestamp')?.value
  const isRecentAuth = authTimestamp && (Date.now() - parseInt(authTimestamp)) < 3000 // 3 seconds

  if (isRecentAuth) {
    console.log('🕐 [Middleware] Recent auth activity detected, skipping checks')
    return response
  }

  // Only check session for protected routes
  if (isProtectedRoute) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('🔐 [Middleware] Protected route check:', {
        pathname,
        hasSession: !!session,
        hasError: !!error
      })

      if (!session || error) {
        console.log('🚨 [Middleware] No session for protected route, redirecting to login')
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      console.error('💥 [Middleware] Session check failed:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // For authenticated users on auth pages (except root and update-password)
  if (isPublicRoute && pathname !== '/' && pathname !== '/update-password') {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        console.log('🔄 [Middleware] Authenticated user on auth page, redirecting to dashboard')
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      // If session check fails on public routes, just continue
      console.log('⚠️ [Middleware] Session check failed on public route, continuing')
    }
  }

  console.log('✅ [Middleware] Request allowed to proceed')
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}