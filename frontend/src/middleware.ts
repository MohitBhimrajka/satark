// frontend/src/middleware.ts
/**
 * Satark Next.js Middleware.
 * Edge-level route protection for protected paths.
 * Checks for the 'satark_auth' cookie set by the AuthContext.
 * The real auth gate is in (protected)/layout.tsx via useAuth().
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/workbench', '/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  if (isProtected) {
    // Check for auth indicator cookie (set by client-side AuthContext).
    // This is a lightweight check — the real JWT validation happens server-side.
    const hasAuth = request.cookies.get('satark_auth')
    if (!hasAuth) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon.svg).*)'],
}
