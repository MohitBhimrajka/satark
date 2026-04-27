import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className='w-full'>
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            error
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className='mt-1 text-xs text-red-500'>{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
