// frontend/src/middleware.ts
/**
 * Satark Next.js Middleware.
 * Route protection will be added in Phase 4 for (protected) route group.
 */
import { NextResponse } from 'next/server'

export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
