'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Filter, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import api from '@/lib/api-client'
import type { Incident, Priority, ApiListResponse } from '@/types'

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'analyzing', label: 'Analyzing' },
  { value: 'analyzed', label: 'Analyzed' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

export function WorkbenchList() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchIncidents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('page_size', '20')
      if (statusFilter) params.set('status', statusFilter)
      if (search.trim()) params.set('search', search.trim())

      const res = await api.get<ApiListResponse<Incident>>(
        `/api/incidents?${params.toString()}`
      )
      setIncidents(res.data)
      setTotalPages(res.pagination.total_pages)
    } catch {
      setIncidents([])
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search])

  useEffect(() => {
    fetchIncidents()
  }, [fetchIncidents])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchIncidents()
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Workbench'
        description='Manage and triage incident cases.'
        actions={
          <Button variant='outline' size='sm' onClick={fetchIncidents}>
            <RefreshCw className='mr-2 h-3.5 w-3.5' strokeWidth={2} />
            Refresh
          </Button>
        }
      />

      {/* Filters */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <form onSubmit={handleSearch} className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' strokeWidth={1.5} />
            <Input
              placeholder='Search by case number, description...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-10'
            />
          </div>
        </form>
        <div className='flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1'>
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                setStatusFilter(s.value)
                setPage(1)
              }}
              className={cn(
                'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                statusFilter === s.value
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className='rounded-xl border border-gray-200 bg-white shadow-soft'>
        {loading ? (
          <div className='space-y-0'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className='flex items-center gap-4 border-b border-gray-100 px-5 py-3'>
                <Skeleton className='h-5 w-28' />
                <Skeleton className='h-5 flex-1' />
                <Skeleton className='h-5 w-20' />
                <Skeleton className='h-5 w-16' />
              </div>
            ))}
          </div>
        ) : incidents.length === 0 ? (
          <EmptyState
            icon={Filter}
            title='No incidents found'
            description='Try adjusting your search or filter criteria.'
            className='border-none rounded-xl'
          />
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-100'>
                  <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Case
                  </th>
                  <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Type
                  </th>
                  <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Status
                  </th>
                  <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Score
                  </th>
                  <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Priority
                  </th>
                  <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr
                    key={incident.id}
                    className='border-b border-gray-50 transition-colors hover:bg-gray-50/50'
                  >
                    <td className='px-5 py-3.5'>
                      <Link
                        href={`/workbench/${incident.id}`}
                        className='font-mono text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline'
                      >
                        {incident.case_number}
                      </Link>
                    </td>
                    <td className='px-5 py-3.5'>
                      <span className='rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600'>
                        {incident.input_type}
                      </span>
                    </td>
                    <td className='px-5 py-3.5'>
                      <StatusBadge status={incident.status} />
                    </td>
                    <td className='px-5 py-3.5'>
                      {incident.threat_score !== null && incident.threat_score !== undefined ? (
                        <span
                          className={cn(
                            'text-sm font-bold',
                            incident.threat_score >= 81
                              ? 'text-red-600'
                              : incident.threat_score >= 61
                                ? 'text-orange-600'
                                : incident.threat_score >= 31
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                          )}
                        >
                          {incident.threat_score}
                        </span>
                      ) : (
                        <span className='text-xs text-gray-400'>—</span>
                      )}
                    </td>
                    <td className='px-5 py-3.5'>
                      {incident.priority ? (
                        <Badge variant={incident.priority as Priority}>
                          {incident.priority}
                        </Badge>
                      ) : (
                        <span className='text-xs text-gray-400'>—</span>
                      )}
                    </td>
                    <td className='px-5 py-3.5 text-sm text-gray-500'>
                      {formatDateTime(incident.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className='text-sm text-gray-500'>
            Page {page} of {totalPages}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
