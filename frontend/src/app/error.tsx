'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-red-50'>
      <div className='w-full max-w-md space-y-6 rounded-xl border border-red-100 bg-white p-8 text-center shadow-soft'>
        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50'>
          <AlertCircle className='h-8 w-8 text-red-500' strokeWidth={1.5} />
        </div>
        <div className='space-y-2'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Something went wrong
          </h2>
          <p className='text-sm text-gray-500'>
            {error.message || 'An unexpected error occurred.'}
          </p>
        </div>
        <Button onClick={reset}>
          <RefreshCw className='mr-2 h-4 w-4' strokeWidth={1.5} />
          Try Again
        </Button>
      </div>
    </div>
  )
}
