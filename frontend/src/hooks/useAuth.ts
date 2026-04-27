'use client'

import { useAuth as useAuthContext } from '@/contexts/AuthContext'

/**
 * Re-export useAuth from AuthContext for convenience.
 * Import from hooks/ for consistency across the codebase.
 */
export function useAuth() {
  return useAuthContext()
}
