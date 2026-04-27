'use client'

import { useEffect, useState, useRef } from 'react'
import { Shield, Zap, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatDef {
  icon: LucideIcon
  value: number
  suffix: string
  label: string
  prefix: string
}

const STATS: StatDef[] = [
  { icon: Shield, value: 10000, suffix: '+', label: 'Incidents Analyzed', prefix: '' },
  { icon: Zap, value: 85, suffix: '%', label: 'Threats Detected', prefix: '' },
  { icon: Clock, value: 15, suffix: 's', label: 'Avg Response Time', prefix: '<' },
]

function StatItem({ stat }: { stat: StatDef }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)
  const Icon = stat.icon

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = performance.now()

          const animate = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / 1500, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * stat.value))

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [stat.value])

  return (
    <div ref={ref} className='flex flex-col items-center gap-2 text-center'>
      <Icon className='h-6 w-6 text-blue-500' strokeWidth={1.5} />
      <p className='text-3xl font-bold tracking-tight text-navy-900'>
        {stat.prefix}
        {count.toLocaleString()}
        {stat.suffix}
      </p>
      <p className='text-sm font-medium text-gray-500'>{stat.label}</p>
    </div>
  )
}

export function StatsBar() {
  return (
    <section className='border-y border-gray-100 bg-white px-4 py-12'>
      <div className='mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3'>
        {STATS.map((stat) => (
          <StatItem key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  )
}
