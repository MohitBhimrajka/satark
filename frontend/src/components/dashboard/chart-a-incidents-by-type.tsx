'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api-client'
import type { ChartData, ChartDataPoint } from '@/types'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

interface DonutChartProps {
  chartType: string
  title: string
}

export function DonutChart({ chartType, title }: DonutChartProps) {
  const [data, setData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.get<ChartData>(`/api/dashboard/charts/${chartType}`)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [chartType])

  if (loading) return <Skeleton className='h-72 w-full' />

  const points: ChartDataPoint[] = data?.data || []
  if (error || points.length === 0) {
    return (
      <div className='flex h-72 items-center justify-center rounded-xl border border-gray-200 bg-white'>
        <p className='text-sm text-gray-400'>{error ? 'Failed to load' : 'No data'}</p>
      </div>
    )
  }

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-5 shadow-soft'>
      <h3 className='mb-4 text-sm font-semibold text-gray-700'>{title}</h3>
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
    </div>
  )
}

export function ChartIncidentsByType() {
  return <DonutChart chartType='incidents_by_type' title='Incidents by Type' />
}
