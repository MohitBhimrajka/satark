'use client'

import { cn } from '@/lib/utils'
import { ThreatScore } from '@/components/ui/threat-score'
import { ClassificationBadge } from './classification-badge'
import { ConfidenceMeter } from './confidence-meter'
import { IOCList } from './ioc-list'
import { MitigationPlaybook } from './mitigation-playbook'
import { motion } from 'framer-motion'
import type { ThreatAnalysis } from '@/types'

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

interface ResultCardProps {
  analysis: ThreatAnalysis
  className?: string
}

export function ResultCard({ analysis, className }: ResultCardProps) {
  return (
    <motion.div
      className={cn(
        'space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-soft',
        className
      )}
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      {/* Header: Score + Classification */}
      <motion.div
        className='flex flex-col items-center gap-4 sm:flex-row sm:items-start'
        variants={sectionVariants}
      >
        <ThreatScore score={analysis.threat_score} size='md' />
        <div className='flex-1 space-y-3'>
          <div className='flex items-center gap-2'>
            <ClassificationBadge classification={analysis.classification} />
          </div>
          <p className='text-sm leading-relaxed text-gray-700'>
            {analysis.summary}
          </p>
          <ConfidenceMeter confidence={analysis.confidence} />
        </div>
      </motion.div>

      {/* Risk Factors */}
      {analysis.risk_factors?.length > 0 && (
        <motion.div className='space-y-2' variants={sectionVariants}>
          <h4 className='text-sm font-semibold text-gray-900'>Risk Factors</h4>
          <ul className='space-y-1'>
            {analysis.risk_factors.map((factor, i) => (
              <li
                key={i}
                className='flex items-start gap-2 text-sm text-gray-600'
              >
                <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400' />
                {factor}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* IOCs */}
      <motion.div variants={sectionVariants}>
        <IOCList indicators={analysis.indicators} />
      </motion.div>

      {/* Mitigations */}
      <motion.div variants={sectionVariants}>
        <MitigationPlaybook steps={analysis.mitigation_steps} />
      </motion.div>
    </motion.div>
  )
}
