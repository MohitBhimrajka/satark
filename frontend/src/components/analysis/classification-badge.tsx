import { cn } from '@/lib/utils'
import { CLASSIFICATION_LABELS } from '@/lib/constants'

const classStyles: Record<string, string> = {
  phishing: 'bg-red-50 text-red-700 border-red-200',
  malware: 'bg-red-50 text-red-700 border-red-200',
  fraud: 'bg-amber-50 text-amber-700 border-amber-200',
  espionage: 'bg-purple-50 text-purple-700 border-purple-200',
  opsec_risk: 'bg-orange-50 text-orange-700 border-orange-200',
  safe: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

interface ClassificationBadgeProps {
  classification: string
  className?: string
}

export function ClassificationBadge({
  classification,
  className,
}: ClassificationBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        classStyles[classification] || 'bg-gray-50 text-gray-700 border-gray-200',
        className
      )}
    >
      {CLASSIFICATION_LABELS[classification] || classification}
    </span>
  )
}
