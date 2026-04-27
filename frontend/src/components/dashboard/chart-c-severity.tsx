'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api-client'
import type { ApiResponse, ChartData, ChartDataPoint } from '@/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface BarChartCardProps {
  chartType: string
  title: string
}

export function BarChartCard({ chartType, title }: BarChartCardProps) {
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
        <BarChart data={points}>
          <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
          <XAxis dataKey='label' tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey='value' fill='#3B82F6' radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ChartSeverity() {
  return <BarChartCard chartType='severity_distribution' title='Severity Distribution' />
}
