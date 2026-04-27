'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, UserPlus, Loader2, Check, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiClientError } from '@/lib/api-client'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains a number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains uppercase', test: (p: string) => /[A-Z]/.test(p) },
]

const registerSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Password must contain a number')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter'),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { register: authRegister } = useAuth()

  const {
    register: registerField,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', email: '', password: '' },
    mode: 'onChange',
  })

  const password = watch('password', '')
  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(password)).length
  const isPasswordValid = passwordStrength === PASSWORD_RULES.length

  const onSubmit = async (data: RegisterForm) => {
    if (!isPasswordValid) return

    try {
      await authRegister(data.email, data.password, data.displayName)
      toast.success('Account created!')
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
            <h1 className='text-2xl font-semibold text-gray-900'>
              Create Account
            </h1>
            <p className='mt-1 text-sm text-gray-500'>
              Register to access incident management tools.
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
              <label htmlFor='displayName' className='text-sm font-medium text-gray-700'>
                Display Name
              </label>
              <Input
                id='displayName'
                type='text'
                placeholder='Your name'
                autoFocus
                {...registerField('displayName')}
              />
              {errors.displayName && (
                <p className='text-xs text-red-500'>{errors.displayName.message}</p>
              )}
            </div>

            <div className='space-y-1.5'>
              <label htmlFor='email' className='text-sm font-medium text-gray-700'>
                Email
              </label>
              <Input
                id='email'
                type='email'
                placeholder='analyst@satark.mil'
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
              {/* Password strength */}
              {password.length > 0 && (
                <div className='mt-2 space-y-1.5'>
                  <div className='flex gap-1'>
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors',
                          passwordStrength >= level
                            ? level <= 1
                              ? 'bg-red-400'
                              : level <= 2
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            : 'bg-gray-200'
                        )}
                      />
                    ))}
                  </div>
                  <ul className='space-y-0.5'>
                    {PASSWORD_RULES.map((rule) => {
                      const passes = rule.test(password)
                      return (
                        <li
                          key={rule.label}
                          className={cn(
                            'flex items-center gap-1.5 text-xs',
                            passes ? 'text-emerald-600' : 'text-gray-400'
                          )}
                        >
                          {passes ? (
                            <Check className='h-3 w-3' strokeWidth={2} />
                          ) : (
                            <X className='h-3 w-3' strokeWidth={2} />
                          )}
                          {rule.label}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>

            <Button
              type='submit'
              className='w-full'
              disabled={isSubmitting || !isPasswordValid}
            >
              {isSubmitting ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <UserPlus className='mr-2 h-4 w-4' strokeWidth={1.5} />
              )}
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Footer */}
          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-500'>
              Already have an account?{' '}
              <Link
                href='/login'
                className='font-medium text-blue-500 hover:text-blue-600'
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
