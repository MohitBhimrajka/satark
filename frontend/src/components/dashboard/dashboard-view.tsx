'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'
import type { ApiResponse, DashboardStats, ChartData, ChartDataPoint } from '@/types'
import {
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { StaggerList } from '@/components/ui/stagger-list'

const CHART_TYPES = [
  'incidents_by_type',
  'classification_breakdown',
  'severity_distribution',
  'status_overview',
  'trend_line',
  'confidence_distribution',
] as const

type ChartType = (typeof CHART_TYPES)[number]

const CHART_TITLES: Record<ChartType, string> = {
  incidents_by_type: 'Incidents by Type',
  classification_breakdown: 'Classification Breakdown',
  severity_distribution: 'Severity Distribution',
  status_overview: 'Status Overview',
  trend_line: 'Incident Trend (30d)',
  confidence_distribution: 'AI Confidence Distribution',
}

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

function ChartCard({ chartType }: { chartType: ChartType }) {
  const [data, setData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.get<ApiResponse<ChartData>>(`/api/dashboard/charts/${chartType}`)
      .then((res) => setData(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [chartType])

  if (loading) return <Skeleton className='h-72 w-full' />

  if (error) {
    return (
      <div className='flex h-72 items-center justify-center rounded-xl border border-gray-200 bg-white'>
        <p className='text-sm text-gray-400'>Failed to load chart data</p>
      </div>
    )
  }

  const points: ChartDataPoint[] = data?.data || []
  if (points.length === 0) {
    return (
      <div className='flex h-72 items-center justify-center rounded-xl border border-gray-200 bg-white'>
        <p className='text-sm text-gray-400'>No data available</p>
      </div>
    )
  }

  const renderChart = () => {
    if (chartType === 'incidents_by_type' || chartType === 'classification_breakdown') {
      return (
        <ResponsiveContainer width='100%' height={220}>
          <PieChart>
            <Pie
              data={points}
              dataKey='value'
              nameKey='label'
              cx='50%'
              cy='50%'
              outerRadius={80}
              innerRadius={40}
              paddingAngle={2}
              label={({ name, percent }: { name?: string; percent?: number }) =>
                `${name || ''} (${((percent || 0) * 100).toFixed(0)}%)`
              }
              labelLine={false}
              fontSize={11}
            >
              {points.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )
    }

    if (chartType === 'trend_line') {
      return (
        <ResponsiveContainer width='100%' height={220}>
          <AreaChart data={points}>
            <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
            <XAxis dataKey='label' tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Area type='monotone' dataKey='value' stroke='#3B82F6' fill='#DBEAFE' strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )
    }

    // Bar chart for everything else
    return (
      <ResponsiveContainer width='100%' height={220}>
        <BarChart data={points}>
          <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
          <XAxis dataKey='label' tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey='value' fill='#3B82F6' radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-5 shadow-soft'>
      <h3 className='mb-4 text-sm font-semibold text-gray-700'>
        {CHART_TITLES[chartType]}
      </h3>
      {renderChart()}
    </div>
  )
}

export function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ApiResponse<DashboardStats>>('/api/dashboard/stats')
      .then((res) => setStats(res.data))
      .catch(() => toast.error('Failed to load dashboard stats'))
      .finally(() => setLoading(false))
  }, [])

  const totalActive = stats
    ? (stats.by_status.analyzing || 0) + (stats.by_status.investigating || 0)
    : 0

  const totalThreats = stats
    ? stats.total_incidents - (stats.by_classification.safe || 0)
    : 0

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Dashboard'
        description='Platform analytics and incident intelligence overview.'
      />

      {/* Stats cards */}
      {loading ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-28' />
          ))}
        </div>
      ) : (
        <StaggerList className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {[
            <StatCard key='total' label='Total Incidents' value={stats?.total_incidents ?? 0} />,
            <StatCard key='active' label='Active Cases' value={totalActive} />,
            <StatCard key='threats' label='Threats Detected' value={totalThreats} />,
            <StatCard
              key='avg'
              label='Avg Threat Score'
              value={stats?.avg_threat_score ?? '—'}
            />,
          ]}
        </StaggerList>
      )}

      {/* Charts */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {CHART_TYPES.map((type) => (
          <ChartCard key={type} chartType={type} />
        ))}
      </div>
    </div>
  )
}
