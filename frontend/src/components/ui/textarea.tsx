import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className='w-full'>
        <textarea
          className={cn(
            'flex min-h-[100px] w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors',
            'placeholder:text-gray-400 resize-none',
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
Textarea.displayName = 'Textarea'

export { Textarea }
