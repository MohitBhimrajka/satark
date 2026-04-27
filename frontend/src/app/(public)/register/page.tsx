'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, UserPlus, Loader2, Check, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiClientError } from '@/lib/api-client'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains a number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains uppercase', test: (p: string) => /[A-Z]/.test(p) },
]

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(password)).length
  const isPasswordValid = passwordStrength === PASSWORD_RULES.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid) return
    setError('')
    setIsLoading(true)

    try {
      await register(email, password, displayName)
      toast.success('Account created!')
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
            <h1 className='text-2xl font-semibold text-gray-900'>
              Create Account
            </h1>
            <p className='mt-1 text-sm text-gray-500'>
              Register to access incident management tools.
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
              <label
                htmlFor='displayName'
                className='text-sm font-medium text-gray-700'
              >
                Display Name
              </label>
              <Input
                id='displayName'
                type='text'
                placeholder='Your name'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
                autoFocus
              />
            </div>

            <div className='space-y-1.5'>
              <label
                htmlFor='email'
                className='text-sm font-medium text-gray-700'
              >
                Email
              </label>
              <Input
                id='email'
                type='email'
                placeholder='analyst@satark.mil'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className='space-y-1.5'>
              <label
                htmlFor='password'
                className='text-sm font-medium text-gray-700'
              >
                Password
              </label>
              <Input
                id='password'
                type='password'
                placeholder='Min 8 characters'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              disabled={isLoading || !isPasswordValid}
            >
              {isLoading ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <UserPlus className='mr-2 h-4 w-4' strokeWidth={1.5} />
              )}
              {isLoading ? 'Creating account...' : 'Create Account'}
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
