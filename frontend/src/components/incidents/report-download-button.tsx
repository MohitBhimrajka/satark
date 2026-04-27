'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getToken } from '@/lib/api-client'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ReportDownloadButtonProps {
  incidentId: string
  caseNumber: string
  /** Guest token for unauthenticated access */
  guestToken?: string | null
}

export function ReportDownloadButton({
  incidentId,
  caseNumber,
  guestToken,
}: ReportDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const jwtToken = getToken()

  // Must have either a JWT (logged in) or a guest token
  if (!jwtToken && !guestToken) return null

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const headers: HeadersInit = {}
      let url = `${API_URL}/api/incidents/${incidentId}/report`

      if (jwtToken) {
        headers.Authorization = `Bearer ${jwtToken}`
      } else if (guestToken) {
        url += `?token=${encodeURIComponent(guestToken)}`
      }

      const response = await fetch(url, { headers })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `satark-${caseNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
      toast.success('Report downloaded')
    } catch {
      toast.error('Failed to generate report. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleDownload}
      disabled={isLoading}
      id='download-report-btn'
      aria-label={`Download PDF report for case ${caseNumber}`}
    >
      {isLoading ? (
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
      ) : (
        <Download className='mr-2 h-4 w-4' strokeWidth={1.5} />
      )}
      {isLoading ? 'Generating...' : 'Download Report'}
    </Button>
  )
}
