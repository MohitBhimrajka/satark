'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { usePolling } from '@/hooks/usePolling'
import { useAuth } from '@/hooks/useAuth'
import { AnalyzingState } from '@/components/analysis/analyzing-state'
import { ResultCard } from '@/components/analysis/result-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EvidenceList } from '@/components/incidents/evidence-list'
import { AuditTimeline } from '@/components/incidents/audit-timeline'
import { AnalystControls } from '@/components/incidents/analyst-controls'
import { formatDateTime } from '@/lib/utils'
import { Clock } from 'lucide-react'
import type { ThreatAnalysis, Priority, IncidentStatus } from '@/types'

export default function CaseDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const incidentId = params.id as string
  const token = searchParams.get('token')
  const { isAnalyst } = useAuth()

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

      {/* Analyst Controls — only for authenticated analysts */}
      {isAnalyst && (
        <AnalystControls
          incidentId={incidentId}
          currentStatus={incident.status as IncidentStatus}
        />
      )}

      {/* Evidence Files */}
      {incident.evidence_files && incident.evidence_files.length > 0 && (
        <EvidenceList files={incident.evidence_files} />
      )}

      {/* Audit Trail */}
      {incident.audit_logs && incident.audit_logs.length > 0 && (
        <AuditTimeline logs={incident.audit_logs} />
      )}
    </div>
  )
}
