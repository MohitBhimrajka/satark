'use client'

import useSWR from 'swr'
import api from '@/lib/api-client'
import type { ApiResponse, Incident } from '@/types'

interface UsePollingOptions {
  /** Polling interval in milliseconds. Default: 2000 */
  interval?: number
  /** Whether to enable polling. Default: true */
  enabled?: boolean
}

/**
 * Poll GET /api/incidents/:id every 2s.
 * Automatically stops when status !== 'analyzing'.
 */
export function usePolling(
  incidentId: string | null,
  token?: string | null,
  options: UsePollingOptions = {}
) {
  const { interval = 2000, enabled = true } = options

  const queryParam = token ? `?token=${token}` : ''
  const endpoint = incidentId
    ? `/api/incidents/${incidentId}${queryParam}`
    : null

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Incident>>(
    enabled && endpoint ? endpoint : null,
    (url: string) => api.get<ApiResponse<Incident>>(url),
    {
      refreshInterval: (latestData) => {
        const status = latestData?.data?.status
        if (status === 'analyzing' || status === 'submitted') {
          return interval
        }
        return 0 // Stop polling
      },
      revalidateOnFocus: false,
    }
  )

  const incident = data?.data ?? null
  const isAnalyzing =
    incident?.status === 'analyzing' || incident?.status === 'submitted'

  return { incident, isAnalyzing, isLoading, error, mutate }
}
