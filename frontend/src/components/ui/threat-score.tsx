'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ThreatScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function getScoreColor(score: number): string {
  if (score >= 81) return '#EF4444'  // red-500
  if (score >= 61) return '#F97316'  // orange-500
  if (score >= 31) return '#F59E0B'  // amber-500
  return '#10B981'                    // emerald-500
}

function getScoreLabel(score: number): string {
  if (score >= 81) return 'Critical'
  if (score >= 61) return 'High'
  if (score >= 31) return 'Medium'
  return 'Low'
}

const SIZES = {
  sm: { svgSize: 80, strokeWidth: 6, fontSize: 'text-lg', labelSize: 'text-[10px]' },
  md: { svgSize: 120, strokeWidth: 8, fontSize: 'text-3xl', labelSize: 'text-xs' },
  lg: { svgSize: 160, strokeWidth: 10, fontSize: 'text-4xl', labelSize: 'text-sm' },
}

export function ThreatScore({ score, size = 'md', className }: ThreatScoreProps) {
  const { svgSize, strokeWidth, fontSize, labelSize } = SIZES[size]
  const radius = (svgSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(Math.max(score, 0), 100)
  const offset = circumference - (progress / 100) * circumference
  const color = getScoreColor(score)

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className='-rotate-90'
      >
        {/* Background circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill='none'
          stroke='#F1F5F9'
          strokeWidth={strokeWidth}
        />
        {/* Animated progress circle */}
        <motion.circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill='none'
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap='round'
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </svg>
      {/* Score text centered */}
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <motion.span
          className={cn('font-bold', fontSize)}
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5, type: 'spring', stiffness: 200 }}
        >
          {score}
        </motion.span>
        <motion.span
          className={cn('font-medium text-gray-500', labelSize)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          {getScoreLabel(score)}
        </motion.span>
      </div>
    </div>
  )
}
