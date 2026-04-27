'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'
import { STATUS_LABELS } from '@/lib/constants'
import type { IncidentStatus } from '@/types'

const ACTIONABLE_STATUSES: IncidentStatus[] = [
  'analyzed',
  'investigating',
  'escalated',
  'resolved',
  'closed',
]

interface AnalystControlsProps {
  incidentId: string
  currentStatus: IncidentStatus
  onUpdated?: () => void
}

export function AnalystControls({ incidentId, currentStatus, onUpdated }: AnalystControlsProps) {
  const [newStatus, setNewStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async () => {
    if (!newStatus) return
    setIsUpdating(true)

    try {
      await api.patch(`/api/incidents/${incidentId}`, {
        status: newStatus,
        analyst_notes: notes || undefined,
      })
      toast.success(`Status updated to ${STATUS_LABELS[newStatus] || newStatus}`)
      setNewStatus('')
      setNotes('')
      onUpdated?.()
    } catch {
      toast.error('Failed to update status.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Don't show controls for terminal or pre-analysis states
  if (
    currentStatus === 'submitted' ||
    currentStatus === 'closed' ||
    currentStatus === 'analyzing'
  ) {
    return null
  }

  return (
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
  )
}
