import { cn } from '@/lib/utils'

interface ConfidenceMeterProps {
  confidence: number
  className?: string
}

export function ConfidenceMeter({
  confidence,
  className,
}: ConfidenceMeterProps) {
  const percent = Math.round(confidence * 100)

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium text-gray-700'>
          AI Confidence
        </span>
        <span className='text-sm font-semibold text-gray-900'>{percent}%</span>
      </div>
      <div className='h-2 w-full overflow-hidden rounded-full bg-gray-100'>
        <div
          className='h-full rounded-full bg-blue-500 transition-all duration-700 ease-out'
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
