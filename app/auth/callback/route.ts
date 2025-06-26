import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🔧 [Auth Callback] === AUTH CALLBACK STARTED ===');
  
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('🔧 [Auth Callback] Request details:', {
    hasCode: !!code,
    nextUrl: next,
    origin,
    searchParams: Object.fromEntries(searchParams.entries())
  });

  if (code) {
    console.log('🔧 [Auth Callback] Processing auth code...');
    const supabase = createClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        console.log('✅ [Auth Callback] Code exchange successful');
        
        // CHANGED: Use getUser() instead of getSession() to verify authentication
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('❌ [Auth Callback] User verification failed:', userError);
        } else {
          console.log('✅ [Auth Callback] User verified:', {
            userId: user?.id,
            email: user?.email
          });
        }
        
        const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        let redirectUrl: string;
        if (isLocalEnv) {
          // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
          redirectUrl = `${origin}${next}`;
        } else if (forwardedHost) {
          redirectUrl = `https://${forwardedHost}${next}`;
        } else {
          redirectUrl = `${origin}${next}`;
        }
        
        console.log('🎯 [Auth Callback] Redirecting to:', redirectUrl);
        return NextResponse.redirect(redirectUrl);
      } else {
        console.error('❌ [Auth Callback] Code exchange failed:', error);
      }
    } catch (exchangeError) {
      console.error('❌ [Auth Callback] Unexpected error during code exchange:', exchangeError);
    }
  } else {
    console.log('⚠️ [Auth Callback] No auth code provided');
  }

  // return the user to an error page with instructions
  const errorUrl = `${origin}/auth/auth-code-error`;
  console.log('🔄 [Auth Callback] Redirecting to error page:', errorUrl);
  return NextResponse.redirect(errorUrl);
}