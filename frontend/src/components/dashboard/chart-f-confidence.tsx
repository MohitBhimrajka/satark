'use client'

import { BarChartCard } from './chart-c-severity'

export function ChartConfidence() {
  return <BarChartCard chartType='confidence_distribution' title='AI Confidence Distribution' />
}
