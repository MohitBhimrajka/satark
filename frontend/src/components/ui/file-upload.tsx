'use client'

import { useState, useCallback } from 'react'
import { Upload, X, FileIcon } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'

interface FileUploadProps {
  accept?: string
  maxSize?: number // bytes
  onFileSelect: (file: File | null) => void
  className?: string
}

export function FileUpload({
  accept,
  maxSize = 25 * 1024 * 1024, // 25MB default
  onFileSelect,
  className,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    (f: File) => {
      setError(null)
      if (f.size > maxSize) {
        setError(`File exceeds ${formatFileSize(maxSize)} limit.`)
        return
      }
      setFile(f)
      onFileSelect(f)
    },
    [maxSize, onFileSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const f = e.dataTransfer.files[0]
      if (f) handleFile(f)
    },
    [handleFile]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (f) handleFile(f)
    },
    [handleFile]
  )

  const clearFile = () => {
    setFile(null)
    setError(null)
    onFileSelect(null)
  }

  if (file) {
    return (
      <div className={cn('rounded-lg border border-gray-200 bg-gray-50 p-4', className)}>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50'>
            <FileIcon className='h-5 w-5 text-blue-500' strokeWidth={1.5} />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='truncate text-sm font-medium text-gray-900'>
              {file.name}
            </p>
            <p className='text-xs text-gray-500'>{formatFileSize(file.size)}</p>
          </div>
          <button
            type='button'
            onClick={clearFile}
            className='rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
          >
            <X className='h-4 w-4' strokeWidth={2} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-1', className)}>
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
        )}
      >
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-100'>
          <Upload className='h-6 w-6 text-gray-400' strokeWidth={1.5} />
        </div>
        <div>
          <p className='text-sm font-medium text-gray-700'>
            Drop a file here or click to browse
          </p>
          <p className='mt-1 text-xs text-gray-500'>
            Max size: {formatFileSize(maxSize)}
          </p>
        </div>
        <input
          type='file'
          accept={accept}
          onChange={handleInputChange}
          className='hidden'
        />
      </label>
      {error && <p className='text-xs text-red-500'>{error}</p>}
    </div>
  )
}
