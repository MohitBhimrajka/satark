'use client'

import { StatusBadge } from '@/components/ui/status-badge'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { Clock } from 'lucide-react'
import type { Priority } from '@/types'

interface CaseHeaderProps {
  caseNumber: string
  status: string
  priority: string | null
  inputType: string
  createdAt: string
}

export function CaseHeader({ caseNumber, status, priority, inputType, createdAt }: CaseHeaderProps) {
  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-center gap-3'>
        <h1 className='font-mono text-2xl font-bold text-navy-900'>
          {caseNumber}
        </h1>
        <StatusBadge status={status} />
        {priority && (
          <Badge variant={priority as Priority}>
            {priority.toUpperCase()}
          </Badge>
        )}
      </div>
      <div className='flex items-center gap-4 text-sm text-gray-500'>
        <span className='flex items-center gap-1'>
          <Clock className='h-3.5 w-3.5' strokeWidth={1.5} />
          {formatDateTime(createdAt)}
        </span>
        <span className='rounded bg-gray-100 px-2 py-0.5 font-mono text-xs'>
          {inputType}
        </span>
      </div>
    </div>
  )
}
