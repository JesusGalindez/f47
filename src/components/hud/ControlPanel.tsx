'use client'

import { useExperienceStore } from '@/stores/experience'
import { motion } from 'framer-motion'

export function ControlPanel() {
  const { isRadarView, isExplodedView, toggleRadarView, toggleExplodedView } = useExperienceStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.5 }}
      className="hud-panel p-3 space-y-3 w-full max-w-[200px] @container"
    >
      <div className="hud-text text-[var(--text-xs)] text-[var(--text-secondary)] mb-2">
        VIEW CONTROLS
      </div>
      <button
        onClick={toggleRadarView}
        className={`w-full touch-target hud-text text-[var(--text-xs)] border transition-all duration-300 ${isRadarView
            ? 'border-[var(--cyan-reactive)] bg-[var(--cyan-reactive)]/10 text-[var(--cyan-reactive)]'
            : 'border-[var(--text-secondary)]/30 text-[var(--text-secondary)] hover:border-[var(--cyan-reactive)]/50'
          }`}
      >
        {isRadarView ? '◉' : '○'} RADAR VISION
      </button>
      <button
        onClick={toggleExplodedView}
        className={`w-full touch-target hud-text text-[var(--text-xs)] border transition-all duration-300 ${isExplodedView
            ? 'border-[var(--orange-tactical)] bg-[var(--orange-tactical)]/10 text-[var(--orange-tactical)]'
            : 'border-[var(--text-secondary)]/30 text-[var(--text-secondary)] hover:border-[var(--orange-tactical)]/50'
          }`}
      >
        {isExplodedView ? '◉' : '○'} EXPLODED VIEW
      </button>
    </motion.div>
  )
}
