// frontend/src/lib/api-client.ts
/**
 * Satark API Client — fetch wrapper with auth headers and error handling.
 * JWT token management will be added in Phase 4 (useAuth hook).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ApiError {
  error: {
    code: string
    message: string
    details: unknown[]
  }
}

async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {})

  // Default to JSON content type unless multipart (file upload)
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  // JWT token will be added here in Phase 4
  // const token = getToken()
  // if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: {
        code: 'UNKNOWN',
        message: response.statusText || 'An API error occurred.',
        details: [],
      },
    }))
    throw new Error(errorData.error?.message || 'An API error occurred.')
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

export default apiClient
