import { Shield, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyzingStateProps {
  className?: string
}

export function AnalyzingState({ className }: AnalyzingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-blue-200 bg-blue-50/30 px-8 py-16 text-center animate-pulse-border',
        className
      )}
    >
      <div className='relative'>
        <div className='flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100'>
          <Shield className='h-10 w-10 text-blue-500' strokeWidth={1.5} />
        </div>
        <div className='absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500'>
          <Loader2 className='h-4 w-4 animate-spin text-white' strokeWidth={2} />
        </div>
      </div>
      <div className='space-y-2'>
        <h3 className='text-lg font-semibold text-gray-900'>
          AI is analyzing your content...
        </h3>
        <p className='max-w-sm text-sm text-gray-500'>
          Our AI engine is performing deep analysis including threat classification,
          IOC extraction, and generating mitigation recommendations. This usually
          takes 10-30 seconds.
        </p>
      </div>
      <div className='flex gap-1.5'>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className='h-2 w-2 animate-bounce rounded-full bg-blue-400'
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
