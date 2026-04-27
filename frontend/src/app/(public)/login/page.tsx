'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, LogIn, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiClientError } from '@/lib/api-client'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password)
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError('root', { message: err.message })
      } else {
        setError('root', { message: 'An unexpected error occurred.' })
      }
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

          {/* Root Error */}
          {errors.root && (
            <div className='mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700'>
              {errors.root.message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-1.5'>
              <label htmlFor='email' className='text-sm font-medium text-gray-700'>
                Email
              </label>
              <Input
                id='email'
                type='email'
                placeholder='analyst@satark.mil'
                autoFocus
                {...registerField('email')}
              />
              {errors.email && (
                <p className='text-xs text-red-500'>{errors.email.message}</p>
              )}
            </div>

            <div className='space-y-1.5'>
              <label htmlFor='password' className='text-sm font-medium text-gray-700'>
                Password
              </label>
              <Input
                id='password'
                type='password'
                placeholder='Min 8 characters'
                {...registerField('password')}
              />
              {errors.password && (
                <p className='text-xs text-red-500'>{errors.password.message}</p>
              )}
            </div>

            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <LogIn className='mr-2 h-4 w-4' strokeWidth={1.5} />
              )}
              {isSubmitting ? 'Signing in...' : 'Sign In'}
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
