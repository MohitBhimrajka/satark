'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div
        className={cn(
          'mx-4 w-full max-w-lg animate-fade-in rounded-xl border border-gray-200 bg-white p-6 shadow-xl',
          className
        )}
        role='dialog'
        aria-modal='true'
        aria-label={title}
      >
        {title && (
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
            <button
              onClick={onClose}
              className='rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              aria-label='Close'
            >
              <X className='h-5 w-5' strokeWidth={1.5} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
