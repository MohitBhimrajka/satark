import { cn } from '@/lib/utils'

interface MitigationPlaybookProps {
  steps: string[]
  className?: string
}

export function MitigationPlaybook({
  steps,
  className,
}: MitigationPlaybookProps) {
  if (!steps.length) return null

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className='text-sm font-semibold text-gray-900'>
        Mitigation Playbook
      </h4>
      <ol className='space-y-2'>
        {steps.map((step, i) => (
          <li
            key={i}
            className='flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3'
          >
            <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600'>
              {i + 1}
            </span>
            <span className='text-sm text-gray-700'>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
