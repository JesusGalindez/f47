'use client'

import { useExperienceStore } from '@/stores/experience'
import { motion } from 'framer-motion'

export function Compass() {
  const scrollProgress = useExperienceStore((s) => s.scrollProgress)
  const heading = Math.round(scrollProgress * 360)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
      className="hud-panel p-3 w-28"
    >
      <div className="hud-text text-[10px] text-[var(--text-secondary)] mb-1">HDG</div>
      <div className="hud-text text-lg text-[var(--cyan-reactive)]">
        {String(heading).padStart(3, '0')}°
      </div>
      <div className="mt-2 h-px bg-[var(--cyan-reactive)] opacity-20" />
      <div className="mt-2 flex justify-between hud-text text-[8px] text-[var(--text-secondary)]">
        <span>N</span>
        <span>E</span>
        <span>S</span>
        <span>W</span>
      </div>
      <div className="relative h-1 mt-1 bg-[var(--bg-dark)] rounded">
        <div
          className="absolute top-0 left-0 h-full bg-[var(--cyan-reactive)] rounded transition-all duration-300"
          style={{ width: `${(heading / 360) * 100}%` }}
        />
      </div>
    </motion.div>
  )
}
