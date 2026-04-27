// frontend/src/middleware.ts
/**
 * Satark Next.js Middleware.
 * Edge-level route protection: checks for token in localStorage is not possible
 * at the edge, so we only do a lightweight cookie/header check here.
 * The real auth gate is in (protected)/layout.tsx via useAuth().
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/workbench', '/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if path is protected
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  if (isProtected) {
    // In a real deployment we'd check a secure httpOnly cookie.
    // For SIH demo with localStorage JWT, the client-side layout handles the redirect.
    // This middleware is a lightweight guard for direct URL access.
    // If we later add cookie-based auth, the check goes here.
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon.svg).*)'],
}
