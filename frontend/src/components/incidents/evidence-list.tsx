'use client'

import { FileIcon } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'
import type { EvidenceFile } from '@/types'

interface EvidenceListProps {
  files: EvidenceFile[]
}

export function EvidenceList({ files }: EvidenceListProps) {
  if (!files.length) return null

  return (
    <div className='space-y-3'>
      <h2 className='text-lg font-semibold text-gray-900'>Evidence Files</h2>
      <div className='space-y-2'>
        {files.map((file) => (
          <div
            key={file.id}
            className='flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50'
          >
            <FileIcon className='h-5 w-5 text-blue-500' strokeWidth={1.5} />
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium text-gray-900'>
                {file.original_filename}
              </p>
              <p className='text-xs text-gray-500'>
                {file.mime_type} &bull; {formatFileSize(file.file_size)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
