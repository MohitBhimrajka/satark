import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Sign In — Satark',
  description: 'Sign in to access the Satark analyst dashboard, workbench, and admin tools.',
}

export default function LoginPage() {
  return <LoginForm />
}
