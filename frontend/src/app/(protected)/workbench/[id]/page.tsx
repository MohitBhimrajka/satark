'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { ResultCard } from '@/components/analysis/result-card'
import { AnalyzingState } from '@/components/analysis/analyzing-state'
import { formatDateTime, formatFileSize } from '@/lib/utils'
import { usePolling } from '@/hooks/usePolling'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'
import Link from 'next/link'
import type { ThreatAnalysis, Priority, IncidentStatus } from '@/types'
import { STATUS_LABELS } from '@/lib/constants'

const ACTIONABLE_STATUSES: IncidentStatus[] = [
  'analyzed',
  'investigating',
  'escalated',
  'resolved',
  'closed',
]

export default function WorkbenchDetailPage() {
  const params = useParams()
  const incidentId = params.id as string

  const { incident, isAnalyzing, isLoading } = usePolling(incidentId, null, {
    enabled: true,
  })

  const [newStatus, setNewStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async () => {
    if (!newStatus) return
    setIsUpdating(true)

    try {
      await api.patch(`/api/incidents/${incidentId}`, {
        status: newStatus,
        notes: notes || undefined,
      })
      toast.success(`Status updated to ${STATUS_LABELS[newStatus] || newStatus}`)
      setNewStatus('')
      setNotes('')
    } catch {
      toast.error('Failed to update status.')
    } finally {
      setIsUpdating(false)
    }
  }

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

      {/* Status Update (analyst action) */}
      {!isAnalyzing &&
        incident.status !== 'submitted' &&
        incident.status !== 'closed' && (
          <div className='rounded-xl border border-gray-200 bg-white p-5 shadow-soft'>
            <h3 className='text-sm font-semibold text-gray-900'>Update Status</h3>
            <div className='mt-3 flex flex-col gap-3 sm:flex-row'>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className='h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
              >
                <option value=''>Choose status...</option>
                {ACTIONABLE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <Textarea
                placeholder='Add analyst notes (optional)...'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className='flex-1'
              />
              <Button
                onClick={handleStatusUpdate}
                disabled={!newStatus || isUpdating}
                className='self-end'
              >
                {isUpdating ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : null}
                {isUpdating ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        )}

      {/* Evidence Files */}
      {incident.evidence_files && incident.evidence_files.length > 0 && (
        <div className='rounded-xl border border-gray-200 bg-white p-5 shadow-soft'>
          <h3 className='text-sm font-semibold text-gray-900'>Evidence Files</h3>
          <div className='mt-3 space-y-2'>
            {incident.evidence_files.map((file) => (
              <div
                key={file.id}
                className='flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3'
              >
                <div>
                  <p className='text-sm font-medium text-gray-900'>{file.original_filename}</p>
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
        <div className='rounded-xl border border-gray-200 bg-white p-5 shadow-soft'>
          <h3 className='text-sm font-semibold text-gray-900'>Audit Trail</h3>
          <div className='mt-3 space-y-3'>
            {incident.audit_logs.map((log) => (
              <div
                key={log.id}
                className='flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5'
              >
                <div>
                  <p className='text-sm font-medium text-gray-900'>{log.action}</p>
                  <p className='text-xs text-gray-500'>{log.actor_label}</p>
                </div>
                <p className='text-xs text-gray-400'>{formatDateTime(log.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
