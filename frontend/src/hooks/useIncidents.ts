'use client'

import useSWR from 'swr'
import api from '@/lib/api-client'
import type { ApiListResponse, IncidentFilter, IncidentListItem } from '@/types'

/**
 * SWR-based hook for fetching the incidents list with server-side filters.
 */
export function useIncidents(filters: IncidentFilter = {}) {
  const params = new URLSearchParams()

  if (filters.status) params.set('status', filters.status)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.classification) params.set('classification', filters.classification)
  if (filters.start_date) params.set('start_date', filters.start_date)
  if (filters.end_date) params.set('end_date', filters.end_date)
  if (filters.search) params.set('search', filters.search)
  if (filters.sort_by) params.set('sort_by', filters.sort_by)
  if (filters.sort_order) params.set('sort_order', filters.sort_order)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.page_size) params.set('page_size', String(filters.page_size))

  const qs = params.toString()
  const endpoint = `/api/incidents${qs ? `?${qs}` : ''}`

  const { data, error, isLoading, mutate } = useSWR<
    ApiListResponse<IncidentListItem>
  >(endpoint, (url: string) => api.get(url), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  })

  return {
    incidents: data?.data ?? [],
    pagination: data?.pagination ?? null,
    isLoading,
    error,
    mutate,
  }
}
