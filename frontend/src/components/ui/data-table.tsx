'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { FileX } from 'lucide-react'

interface Column<T> {
  key: string
  header: string
  className?: string
  render: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  emptyMessage?: string
  rowKey: (item: T) => string
  onRowClick?: (item: T) => void
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data found',
  rowKey,
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-gray-200 bg-white shadow-soft', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='flex items-center gap-4 border-b border-gray-100 px-5 py-3'>
            {columns.map((col) => (
              <Skeleton key={col.key} className='h-5 flex-1' />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={FileX}
        title={emptyMessage}
        description='Try adjusting your filters.'
        className={cn('rounded-xl border border-gray-200', className)}
      />
    )
  }

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-soft', className)}>
      <table className='w-full'>
        <thead>
          <tr className='border-b border-gray-100'>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={rowKey(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'border-b border-gray-50 transition-colors hover:bg-gray-50/50',
                onRowClick && 'cursor-pointer'
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-5 py-3.5', col.className)}>
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
