import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Create Account — Satark',
  description: 'Register for a Satark account to access incident management and AI-powered threat analysis tools.',
}

export default function RegisterPage() {
  return <RegisterForm />
}
