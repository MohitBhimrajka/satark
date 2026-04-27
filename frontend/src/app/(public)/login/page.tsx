'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, LogIn, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiClientError } from '@/lib/api-client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4'>
      <div className='w-full max-w-md animate-fade-in'>
        <div className='rounded-xl border border-gray-200 bg-white p-8 shadow-soft'>
          {/* Header */}
          <div className='mb-8 text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500'>
              <Shield className='h-6 w-6 text-white' strokeWidth={1.5} />
            </div>
            <h1 className='text-2xl font-semibold text-gray-900'>Sign In</h1>
            <p className='mt-1 text-sm text-gray-500'>
              Access the analyst dashboard and workbench.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className='mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700'>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-1.5'>
              <label htmlFor='email' className='text-sm font-medium text-gray-700'>
                Email
              </label>
              <Input
                id='email'
                type='email'
                placeholder='analyst@satark.mil'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className='space-y-1.5'>
              <label htmlFor='password' className='text-sm font-medium text-gray-700'>
                Password
              </label>
              <Input
                id='password'
                type='password'
                placeholder='Min 8 characters'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <LogIn className='mr-2 h-4 w-4' strokeWidth={1.5} />
              )}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Footer */}
          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-500'>
              Don&apos;t have an account?{' '}
              <Link
                href='/register'
                className='font-medium text-blue-500 hover:text-blue-600'
              >
                Create one
              </Link>
            </p>
            <Link
              href='/'
              className='mt-2 inline-block text-xs text-gray-400 hover:text-gray-500'
            >
              Continue as guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
