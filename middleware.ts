// middleware.ts (Temporary Test Code)
import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // This is the only line that matters for this test.
  console.log('✅ PING! MIDDLEWARE IS ALIVE! Path:', request.nextUrl.pathname);

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}