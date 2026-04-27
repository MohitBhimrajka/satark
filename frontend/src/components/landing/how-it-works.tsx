'use client'

import { Upload, Brain, FileCheck } from 'lucide-react'
import { motion } from 'framer-motion'

const STEPS = [
  {
    icon: Upload,
    title: 'Submit',
    description:
      'Report suspicious URLs, messages, images, audio, or documents through our secure submission portal.',
  },
  {
    icon: Brain,
    title: 'AI Analyzes',
    description:
      'Our AI engine classifies the threat, extracts IOCs, assesses risk severity, and cross-references known threat databases.',
  },
  {
    icon: FileCheck,
    title: 'Get Results',
    description:
      'Receive a comprehensive threat report with classification, confidence score, and an actionable mitigation playbook.',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function HowItWorks() {
  return (
    <section className='px-4 py-20'>
      <div className='mx-auto max-w-4xl'>
        <motion.div
          className='mb-12 text-center'
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className='text-3xl font-bold tracking-tight text-navy-900'>
            How It Works
          </h2>
          <p className='mt-3 text-gray-500'>
            Three simple steps to analyze any suspicious content.
          </p>
        </motion.div>

        <motion.div
          className='grid grid-cols-1 gap-6 sm:grid-cols-3'
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.3 }}
        >
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                variants={cardVariants}
                className='relative rounded-xl border border-gray-200 bg-white p-6 shadow-soft transition-shadow hover:shadow-medium'
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                {/* Step number */}
                <span className='absolute -top-3 left-6 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white'>
                  {i + 1}
                </span>
                <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50'>
                  <Icon className='h-6 w-6 text-blue-500' strokeWidth={1.5} />
                </div>
                <h3 className='text-base font-semibold text-gray-900'>
                  {step.title}
                </h3>
                <p className='mt-2 text-sm leading-relaxed text-gray-500'>
                  {step.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
