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
}

export function ReportDownloadButton({
  incidentId,
  caseNumber,
}: ReportDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const token = getToken()

  if (!token) return null

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `${API_URL}/api/incidents/${incidentId}/report`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `satark-${caseNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
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
