'use client'

import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ResultCard } from '@/components/analysis/result-card'
import { AnalyzingState } from '@/components/analysis/analyzing-state'
import { EvidenceList } from '@/components/incidents/evidence-list'
import { AuditTimeline } from '@/components/incidents/audit-timeline'
import { AnalystControls } from '@/components/incidents/analyst-controls'
import { ReportDownloadButton } from '@/components/incidents/report-download-button'
import { formatDateTime } from '@/lib/utils'
import { usePolling } from '@/hooks/usePolling'
import Link from 'next/link'
import type { ThreatAnalysis, Priority, IncidentStatus } from '@/types'

export default function WorkbenchDetailPage() {
  const params = useParams()
  const incidentId = params.id as string

  const { incident, isAnalyzing, isLoading } = usePolling(incidentId, null, {
    enabled: true,
  })

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-72' />
        <Skeleton className='h-48 w-full' />
        <Skeleton className='h-64 w-full' />
      </div>
    )
  }

  if (!incident) {
    return (
      <div className='text-center py-12'>
        <h2 className='text-lg font-semibold text-gray-700'>Case not found</h2>
        <Link href='/workbench' className='mt-2 text-sm text-blue-500 hover:underline'>
          Back to Workbench
        </Link>
      </div>
    )
  }

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
    <div className='space-y-6'>
      {/* Navigation */}
      <Link
        href='/workbench'
        className='inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700'
      >
        <ArrowLeft className='h-3.5 w-3.5' strokeWidth={2} />
        Back to Workbench
      </Link>

      {/* Header */}
      <PageHeader
        title={incident.case_number}
        actions={
          <div className='flex items-center gap-2'>
            <ReportDownloadButton
              incidentId={incidentId}
              caseNumber={incident.case_number}
            />
            <StatusBadge status={incident.status} />
            {incident.priority && (
              <Badge variant={incident.priority as Priority}>
                {incident.priority.toUpperCase()}
              </Badge>
            )}
          </div>
        }
      />

      {/* Metadata grid */}
      <div className='grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-soft sm:grid-cols-4'>
        <div>
          <p className='text-xs font-medium uppercase text-gray-500'>Type</p>
          <p className='mt-0.5 font-mono text-sm text-gray-900'>{incident.input_type}</p>
        </div>
        <div>
          <p className='text-xs font-medium uppercase text-gray-500'>Score</p>
          <p className='mt-0.5 text-lg font-bold text-gray-900'>
            {incident.threat_score ?? '—'}
          </p>
        </div>
        <div>
          <p className='text-xs font-medium uppercase text-gray-500'>Classification</p>
          <p className='mt-0.5 text-sm font-medium text-gray-900'>
            {incident.classification || '—'}
          </p>
        </div>
        <div>
          <p className='text-xs font-medium uppercase text-gray-500'>Created</p>
          <p className='mt-0.5 text-sm text-gray-900'>
            {formatDateTime(incident.created_at)}
          </p>
        </div>
      </div>

      {/* Description */}
      {incident.description && (
        <div className='rounded-xl border border-gray-200 bg-white p-5 shadow-soft'>
          <h3 className='text-sm font-semibold text-gray-900'>Reporter Description</h3>
          <p className='mt-2 text-sm text-gray-600'>{incident.description}</p>
        </div>
      )}

      {/* Input content */}
      {incident.input_content && (
        <div className='rounded-xl border border-gray-200 bg-white p-5 shadow-soft'>
          <h3 className='text-sm font-semibold text-gray-900'>Submitted Content</h3>
          <pre className='mt-2 max-h-48 overflow-auto rounded-lg bg-gray-50 p-3 font-mono text-sm text-gray-700'>
            {incident.input_content}
          </pre>
        </div>
      )}

      {/* Analyzing state */}
      {isAnalyzing && <AnalyzingState />}

      {/* AI Analysis */}
      {analysis && !isAnalyzing && <ResultCard analysis={analysis} />}

      {/* Analyst Controls */}
      <AnalystControls
        incidentId={incidentId}
        currentStatus={incident.status as IncidentStatus}
      />

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
