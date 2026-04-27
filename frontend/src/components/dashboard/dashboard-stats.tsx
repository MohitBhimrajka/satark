'use client'

import { StatCard } from '@/components/ui/stat-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardStats } from '@/types'

interface DashboardStatsBarProps {
  stats: DashboardStats | null
  isLoading: boolean
}

export function DashboardStatsBar({ stats, isLoading }: DashboardStatsBarProps) {
  const totalActive = stats
    ? (stats.by_status.analyzing || 0) + (stats.by_status.investigating || 0)
    : 0

  const totalThreats = stats
    ? stats.total_incidents - (stats.by_classification.safe || 0)
    : 0

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-28' />
        ))}
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      <StatCard label='Total Incidents' value={stats?.total_incidents ?? 0} />
      <StatCard label='Active Cases' value={totalActive} />
      <StatCard label='Threats Detected' value={totalThreats} />
      <StatCard label='Avg Threat Score' value={stats?.avg_threat_score ?? '—'} />
    </div>
  )
}
