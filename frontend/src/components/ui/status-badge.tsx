import { cn } from '@/lib/utils'
import type { IncidentStatus } from '@/types'
import { STATUS_LABELS } from '@/lib/constants'

const statusStyles: Record<string, string> = {
  submitted: 'bg-gray-100 text-gray-700 border-gray-200',
  analyzing: 'bg-blue-50 text-blue-700 border-blue-300 animate-pulse-border',
  analyzed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  analysis_failed: 'bg-red-50 text-red-700 border-red-200',
  investigating: 'bg-amber-50 text-amber-700 border-amber-200',
  escalated: 'bg-red-50 text-red-700 border-red-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-gray-100 text-gray-500 border-gray-200',
}

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: IncidentStatus | string
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status] || statusStyles.submitted,
        className
      )}
      {...props}
    >
      {STATUS_LABELS[status] || status}
    </span>
  )
}
