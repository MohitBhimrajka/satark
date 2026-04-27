import { cn } from '@/lib/utils'

type BadgeVariant =
  | 'default'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'safe'
  | 'outline'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  safe: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  outline: 'bg-transparent text-gray-700 border-gray-300',
}

export function Badge({
  variant = 'default',
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
