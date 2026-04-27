'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { usePolling } from '@/hooks/usePolling'
import { AnalyzingState } from '@/components/analysis/analyzing-state'
import { ResultCard } from '@/components/analysis/result-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime, formatFileSize } from '@/lib/utils'
import { FileIcon, Clock, User } from 'lucide-react'
import type { ThreatAnalysis, Priority } from '@/types'

export default function CaseDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const incidentId = params.id as string
  const token = searchParams.get('token')

  const { incident, isAnalyzing, isLoading, error } = usePolling(
    incidentId,
    token,
    { enabled: true }
  )

  if (isLoading) {
    return (
      <div className='mx-auto max-w-4xl space-y-6 px-4 py-12'>
        <Skeleton className='h-10 w-72' />
        <Skeleton className='h-48 w-full' />
        <Skeleton className='h-32 w-full' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='mx-auto max-w-4xl px-4 py-12'>
        <div className='rounded-xl border border-red-200 bg-red-50 p-8 text-center'>
          <h2 className='text-lg font-semibold text-red-700'>Access Denied</h2>
          <p className='mt-2 text-sm text-red-600'>
            You don&apos;t have permission to view this case, or the case does not exist.
          </p>
        </div>
      </div>
    )
  }

  if (!incident) return null

  const analysis: ThreatAnalysis | null =
    incident.ai_analysis && incident.classification
      ? {
          classification: incident.classification as ThreatAnalysis['classification'],
          threat_score: incident.threat_score ?? 0,
          confidence: incident.confidence ?? 0,
          summary: (incident.ai_analysis as Record<string, string>).summary || '',
          indicators: (incident.ai_analysis as Record<string, string[]>).indicators || [],
          mitigation_steps: (incident.ai_analysis as Record<string, string[]>).mitigation_steps || [],
          risk_factors: (incident.ai_analysis as Record<string, string[]>).risk_factors || [],
        }
      : null

  return (
    <div className='mx-auto max-w-4xl space-y-8 px-4 py-12'>
      {/* Header */}
      <div className='space-y-3'>
        <div className='flex flex-wrap items-center gap-3'>
          <h1 className='font-mono text-2xl font-bold text-navy-900'>
            {incident.case_number}
          </h1>
          <StatusBadge status={incident.status} />
          {incident.priority && (
            <Badge variant={incident.priority as Priority}>
              {incident.priority.toUpperCase()}
            </Badge>
          )}
        </div>
        <div className='flex items-center gap-4 text-sm text-gray-500'>
          <span className='flex items-center gap-1'>
            <Clock className='h-3.5 w-3.5' strokeWidth={1.5} />
            {formatDateTime(incident.created_at)}
          </span>
          <span className='rounded bg-gray-100 px-2 py-0.5 font-mono text-xs'>
            {incident.input_type}
          </span>
        </div>
      </div>

      {/* Analyzing state */}
      {isAnalyzing && <AnalyzingState />}

      {/* AI Analysis */}
      {analysis && !isAnalyzing && <ResultCard analysis={analysis} />}

      {/* Analysis failed */}
      {incident.status === 'analysis_failed' && (
        <div className='rounded-xl border border-red-200 bg-red-50 p-6 text-center'>
          <h3 className='text-base font-semibold text-red-700'>
            Analysis Failed
          </h3>
          <p className='mt-1 text-sm text-red-600'>
            The AI engine was unable to analyze this content. An analyst will review it manually.
          </p>
        </div>
      )}

      {/* Evidence Files */}
      {incident.evidence_files && incident.evidence_files.length > 0 && (
        <div className='space-y-3'>
          <h2 className='text-lg font-semibold text-gray-900'>Evidence Files</h2>
          <div className='space-y-2'>
            {incident.evidence_files.map((file) => (
              <div
                key={file.id}
                className='flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3'
              >
                <FileIcon className='h-5 w-5 text-blue-500' strokeWidth={1.5} />
                <div className='flex-1 min-w-0'>
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
      )}

      {/* Audit Trail */}
      {incident.audit_logs && incident.audit_logs.length > 0 && (
        <div className='space-y-3'>
          <h2 className='text-lg font-semibold text-gray-900'>Audit Trail</h2>
          <div className='space-y-0 border-l-2 border-gray-200 pl-6'>
            {incident.audit_logs.map((log) => (
              <div key={log.id} className='relative pb-6 last:pb-0'>
                <div className='absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-blue-500'>
                  <div className='h-1.5 w-1.5 rounded-full bg-white' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-900'>
                    {log.action}
                  </p>
                  <div className='mt-0.5 flex items-center gap-2 text-xs text-gray-500'>
                    <span className='flex items-center gap-1'>
                      <User className='h-3 w-3' strokeWidth={1.5} />
                      {log.actor_label}
                    </span>
                    <span>{formatDateTime(log.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
