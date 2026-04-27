import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-8 py-16 text-center',
        className
      )}
    >
      <div className='flex h-14 w-14 items-center justify-center rounded-full bg-gray-100'>
        <Icon className='h-7 w-7 text-gray-400' strokeWidth={1.5} />
      </div>
      <div className='space-y-1'>
        <h3 className='text-base font-semibold text-gray-900'>{title}</h3>
        <p className='max-w-sm text-sm text-gray-500'>{description}</p>
      </div>
      {action && <div className='mt-2'>{action}</div>}
    </div>
  )
}
