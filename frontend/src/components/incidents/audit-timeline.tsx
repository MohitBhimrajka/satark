'use client'

import { User, Clock } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import type { AuditLogEntry } from '@/types'

interface AuditTimelineProps {
  logs: AuditLogEntry[]
}

export function AuditTimeline({ logs }: AuditTimelineProps) {
  if (!logs.length) return null

  return (
    <div className='space-y-3'>
      <h2 className='text-lg font-semibold text-gray-900'>Audit Trail</h2>
      <div className='space-y-0 border-l-2 border-gray-200 pl-6'>
        {logs.map((log) => (
          <div key={log.id} className='relative pb-6 last:pb-0'>
            <div className='absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-blue-500'>
              <div className='h-1.5 w-1.5 rounded-full bg-white' />
            </div>
            <div>
              <p className='text-sm font-medium text-gray-900'>
                {log.action.replace(/_/g, ' ').replace(/^\w/, (c: string) => c.toUpperCase())}
              </p>
              <div className='mt-0.5 flex items-center gap-3 text-xs text-gray-500'>
                <span className='flex items-center gap-1'>
                  <User className='h-3 w-3' strokeWidth={1.5} />
                  {log.actor_label}
                </span>
                <span className='flex items-center gap-1'>
                  <Clock className='h-3 w-3' strokeWidth={1.5} />
                  {formatDateTime(log.created_at)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
