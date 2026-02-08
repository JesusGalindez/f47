'use client'

import { motion } from 'framer-motion'

export function Reticle() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <motion.div
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 1.5, delay: 1 }}
        className="relative w-16 h-16"
      >
        {/* Outer ring */}
        <div className="absolute inset-0 border border-[var(--cyan-reactive)] rounded-full opacity-30" />
        {/* Inner cross */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-[var(--cyan-reactive)] opacity-20" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-[var(--cyan-reactive)] opacity-20" />
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[var(--cyan-reactive)] rounded-full" />
      </motion.div>
    </div>
  )
}
