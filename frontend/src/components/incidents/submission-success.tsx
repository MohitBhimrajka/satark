'use client'

import { CheckCircle, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import Link from 'next/link'

interface SubmissionSuccessProps {
  caseNumber: string
  incidentId: string
  guestToken: string | null
}

export function SubmissionSuccess({
  caseNumber,
  incidentId,
  guestToken,
}: SubmissionSuccessProps) {
  const { copy } = useCopyToClipboard()

  const shareableUrl = guestToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/case/${incidentId}?token=${guestToken}`
    : `${typeof window !== 'undefined' ? window.location.origin : ''}/case/${incidentId}`

  return (
    <div className='mx-auto max-w-md animate-fade-in space-y-6 text-center'>
      {/* Success icon */}
      <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50'>
        <CheckCircle className='h-8 w-8 text-emerald-500' strokeWidth={1.5} />
      </div>

      <div className='space-y-2'>
        <h2 className='text-2xl font-semibold text-gray-900'>
          Incident Submitted
        </h2>
        <p className='text-gray-500'>
          Your case has been created and AI analysis has begun.
        </p>
      </div>

      {/* Case number */}
      <div className='rounded-lg border border-gray-200 bg-gray-50 px-4 py-3'>
        <p className='text-xs font-medium uppercase tracking-wide text-gray-500'>
          Case Number
        </p>
        <p className='mt-1 font-mono text-xl font-bold text-navy-900'>
          {caseNumber}
        </p>
      </div>

      {/* Shareable link */}
      {guestToken && (
        <div className='space-y-2'>
          <p className='text-sm text-gray-500'>Shareable tracking link:</p>
          <div className='flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2'>
            <input
              readOnly
              value={shareableUrl}
              className='flex-1 truncate bg-transparent font-mono text-xs text-gray-600 outline-none'
            />
            <button
              onClick={() => copy(shareableUrl)}
              className='rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              title='Copy link'
            >
              <Copy className='h-4 w-4' strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
        <Link href={`/case/${incidentId}${guestToken ? `?token=${guestToken}` : ''}`}>
          <Button className='w-full sm:w-auto'>
            <ExternalLink className='mr-2 h-4 w-4' strokeWidth={1.5} />
            View Case
          </Button>
        </Link>
        <Link href='/submit'>
          <Button variant='outline' className='w-full sm:w-auto'>
            Submit Another
          </Button>
        </Link>
      </div>
    </div>
  )
}
