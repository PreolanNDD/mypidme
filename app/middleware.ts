import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

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

  const supabase = createMiddlewareClient({ req: request, res: response })

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