'use client'

import { Copy, Check } from 'lucide-react'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { cn } from '@/lib/utils'

interface IOCListProps {
  indicators: string[]
  className?: string
}

export function IOCList({ indicators, className }: IOCListProps) {
  const { copy, copiedText } = useCopyToClipboard()

  if (!indicators.length) return null

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className='text-sm font-semibold text-gray-900'>
        Indicators of Compromise ({indicators.length})
      </h4>
      <div className='flex flex-wrap gap-2'>
        {indicators.map((ioc) => {
          const isCopied = copiedText === ioc
          return (
            <button
              key={ioc}
              onClick={() => copy(ioc)}
              className='group flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50'
              title='Click to copy'
            >
              <span className='max-w-[200px] truncate'>{ioc}</span>
              {isCopied ? (
                <Check className='h-3 w-3 text-emerald-500' strokeWidth={2} />
              ) : (
                <Copy className='h-3 w-3 text-gray-400 group-hover:text-blue-500' strokeWidth={2} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
