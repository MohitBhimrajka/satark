'use client'

import { Link2, MessageSquare, Image, Mic, Video, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InputType } from '@/types'
import type { LucideIcon } from 'lucide-react'

interface InputTypeDef {
  id: InputType
  label: string
  description: string
  icon: LucideIcon
}

const INPUT_TYPE_OPTIONS: InputTypeDef[] = [
  { id: 'url', label: 'URL / Link', description: 'Suspicious website or link', icon: Link2 },
  { id: 'text', label: 'Text Message', description: 'SMS, email, or chat message', icon: MessageSquare },
  { id: 'image', label: 'Image', description: 'Screenshot or photo evidence', icon: Image },
  { id: 'audio', label: 'Audio', description: 'Voice message or call recording', icon: Mic },
  { id: 'video', label: 'Video', description: 'Screen recording or video clip', icon: Video },
  { id: 'document', label: 'Document', description: 'PDF, Word, or other document', icon: FileText },
]

interface InputTypeSelectorProps {
  selected: InputType | null
  onSelect: (type: InputType) => void
}

export function InputTypeSelector({ selected, onSelect }: InputTypeSelectorProps) {
  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
      {INPUT_TYPE_OPTIONS.map((opt) => {
        const Icon = opt.icon
        const isSelected = selected === opt.id

        return (
          <button
            key={opt.id}
            type='button'
            onClick={() => onSelect(opt.id)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all',
              isSelected
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                isSelected ? 'bg-blue-100' : 'bg-gray-100'
              )}
            >
              <Icon
                className={cn('h-5 w-5', isSelected ? 'text-blue-600' : 'text-gray-500')}
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p className={cn('text-sm font-medium', isSelected ? 'text-blue-700' : 'text-gray-900')}>
                {opt.label}
              </p>
              <p className='text-xs text-gray-500'>{opt.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
