'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import api, { getToken, removeToken, setToken } from '@/lib/api-client'
import type { ApiResponse, TokenResponse, User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isAnalyst: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

/** Set or clear a lightweight cookie so the edge middleware can detect auth. */
function setAuthCookie(active: boolean) {
  if (active) {
    document.cookie = 'satark_auth=1; path=/; max-age=86400; SameSite=Lax'
  } else {
    document.cookie = 'satark_auth=; path=/; max-age=0'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount, check for existing token and fetch user
  useEffect(() => {
    const stored = getToken()
    if (stored) {
      setTokenState(stored)
      api
        .get<ApiResponse<User>>('/api/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          removeToken()
          setTokenState(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<ApiResponse<TokenResponse>>('/api/auth/login', {
      email,
      password,
    })
    setToken(res.data.access_token)
    setTokenState(res.data.access_token)
    setUser(res.data.user)
    setAuthCookie(true)
  }, [])

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      const res = await api.post<ApiResponse<TokenResponse>>(
        '/api/auth/register',
        { email, password, display_name: displayName }
      )
      setToken(res.data.access_token)
      setTokenState(res.data.access_token)
      setUser(res.data.user)
      setAuthCookie(true)
    },
    []
  )

  const logout = useCallback(() => {
    removeToken()
    setTokenState(null)
    setUser(null)
    setAuthCookie(false)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!user,
      isAnalyst: user?.role === 'analyst' || user?.role === 'admin',
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
