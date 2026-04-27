'use client'

import { cn } from '@/lib/utils'

interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
}

interface TabsProps {
  items: TabItem[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ items, active, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1',
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            active === item.id
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  )
}
