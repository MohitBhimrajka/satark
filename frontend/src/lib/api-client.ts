/**
 * Satark API Client — fetch wrapper with JWT auth headers and typed helpers.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const TOKEN_KEY = 'satark_token'

// ── Token Management ─────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// ── Core Fetch Wrapper ───────────────────────────────────────────────────────

interface ApiErrorPayload {
  error: {
    code: string
    message: string
    details: unknown[]
  }
}

export class ApiClientError extends Error {
  code: string
  status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.name = 'ApiClientError'
    this.code = code
    this.status = status
  }
}

async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData: ApiErrorPayload = await response.json().catch(() => ({
      error: {
        code: 'UNKNOWN',
        message: response.statusText || 'An API error occurred.',
        details: [],
      },
    }))
    throw new ApiClientError(
      errorData.error?.message || 'An API error occurred.',
      errorData.error?.code || 'UNKNOWN',
      response.status
    )
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

// ── Typed Helper Methods ─────────────────────────────────────────────────────

const api = {
  get<T = unknown>(endpoint: string): Promise<T> {
    return request<T>(endpoint)
  },

  post<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  patch<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  /** Upload a file via FormData. Do NOT set Content-Type — browser handles it. */
  upload<T = unknown>(endpoint: string, formData: FormData): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: formData,
    })
  },
}

export default api
