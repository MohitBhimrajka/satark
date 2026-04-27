'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface StaggerListProps {
  children: ReactNode[]
  className?: string
  /** Delay between each child animation in ms */
  staggerMs?: number
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
}

export function StaggerList({
  children,
  className,
  staggerMs = 50,
}: StaggerListProps) {
  const containerVariants = {
    ...container,
    show: {
      ...container.show,
      transition: {
        staggerChildren: staggerMs / 1000,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='show'
      className={className}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
