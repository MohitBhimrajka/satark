'use client'

import Link from 'next/link'
import { Shield, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function Hero() {
  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-20 sm:py-28 lg:py-36'>
      {/* Subtle bg pattern */}
      <div className='pointer-events-none absolute inset-0 opacity-[0.03]' style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #3B82F6 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />

      <motion.div
        className='relative mx-auto max-w-4xl text-center'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {/* Shield icon */}
        <motion.div
          className='mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-200'
          variants={itemVariants}
        >
          <Shield className='h-10 w-10 text-white' strokeWidth={1.5} />
        </motion.div>

        {/* Headline */}
        <motion.h1
          className='text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl lg:text-6xl'
          variants={itemVariants}
        >
          AI-Powered Cyber
          <br />
          <span className='text-blue-500'>Incident Intelligence</span>
        </motion.h1>

        <motion.p
          className='mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-500'
          variants={itemVariants}
        >
          Report suspicious messages, URLs, images, and files. Our AI engine
          instantly classifies threats, extracts indicators of compromise, and
          generates actionable mitigation playbooks.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className='mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row'
          variants={itemVariants}
        >
          <Link href='/submit'>
            <Button size='lg' className='gap-2 px-8 text-base shadow-md shadow-blue-100'>
              Report an Incident
              <ArrowRight className='h-4 w-4' strokeWidth={2} />
            </Button>
          </Link>
          <a href='#try-it-now'>
            <Button variant='outline' size='lg' className='gap-2 px-8 text-base'>
              Try It Now
            </Button>
          </a>
        </motion.div>
      </motion.div>
    </section>
  )
}
