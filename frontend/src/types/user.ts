/**
 * Satark — User types mirroring app/schemas/user.py
 */

export interface User {
  id: string
  email: string
  display_name: string
  role: 'guest' | 'analyst' | 'admin'
  is_active: boolean
  created_at: string
}

export interface UserCreate {
  email: string
  password: string
  display_name: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}
