import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  trend?: { value: number; label: string }
  className?: string
}

export function StatCard({ label, value, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-medium',
        className
      )}
    >
      <p className='text-sm font-medium text-gray-500'>{label}</p>
      <p className='mt-1 text-3xl font-bold tracking-tight text-gray-900'>
        {value}
      </p>
      {trend && (
        <div className='mt-2 flex items-center gap-1'>
          {trend.value >= 0 ? (
            <TrendingUp className='h-3.5 w-3.5 text-emerald-500' strokeWidth={2} />
          ) : (
            <TrendingDown className='h-3.5 w-3.5 text-red-500' strokeWidth={2} />
          )}
          <span
            className={cn(
              'text-xs font-medium',
              trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'
            )}
          >
            {trend.value >= 0 ? '+' : ''}
            {trend.value}% {trend.label}
          </span>
        </div>
      )}
    </div>
  )
}
