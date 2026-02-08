'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Compass } from './Compass'
import { StatusBars } from './StatusBars'
import { Reticle } from './Reticle'
import { ChapterIndicator } from './ChapterIndicator'
import { useExperienceStore } from '@/stores/experience'

export function HudRoot() {
  const { isRadarView, toggleRadarView } = useExperienceStore()

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col p-[var(--space-md)]">
      {/* Corner brackets - responsive sizing */}
      <div className="absolute top-[var(--space-sm)] left-[var(--space-sm)] w-[var(--space-lg)] h-[var(--space-lg)] border-t-2 border-l-2 border-[var(--cyan-reactive)] opacity-30" />
      <div className="absolute top-[var(--space-sm)] right-[var(--space-sm)] w-[var(--space-lg)] h-[var(--space-lg)] border-t-2 border-r-2 border-[var(--cyan-reactive)] opacity-30" />
      <div className="absolute bottom-[var(--space-sm)] left-[var(--space-sm)] w-[var(--space-lg)] h-[var(--space-lg)] border-b-2 border-l-2 border-[var(--cyan-reactive)] opacity-30" />
      <div className="absolute bottom-[var(--space-sm)] right-[var(--space-sm)] w-[var(--space-lg)] h-[var(--space-lg)] border-b-2 border-r-2 border-[var(--cyan-reactive)] opacity-30" />

      {/* Header bar - fluid layout */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="w-full flex items-center justify-center gap-4 py-4"
      >
        <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-[var(--cyan-reactive)] hidden sm:block" />
        <span className="hud-text text-[var(--text-xs)] text-[var(--cyan-reactive)] text-center">
          F-47 SENTINEL // SIXTH GEN AIR DOMINANCE
        </span>
        <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-[var(--cyan-reactive)] hidden sm:block" />
      </motion.div>

      {/* Main Content Area - Grid for better distribution */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Right panel (Compass) - hidden on very small screens or moved */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 responsive-hide">
          <Compass />
        </div>

        {/* Center reticle */}
        <Reticle />
      </div>

      {/* Footer Area - Adaptive layout */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-6 pb-4">
        <div className="flex-1 flex justify-center sm:justify-start">
          <ChapterIndicator />
        </div>

        <div className="pointer-events-auto flex flex-col gap-3 w-full sm:w-auto">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            onClick={toggleRadarView}
            className={`w-full p-3 touch-target hud-text text-[var(--text-xs)] border transition-all duration-300 ${isRadarView
              ? 'border-[var(--cyan-reactive)] bg-[var(--cyan-reactive)]/10 text-[var(--cyan-reactive)]'
              : 'border-[var(--text-secondary)]/30 text-[var(--text-secondary)] hover:border-[var(--cyan-reactive)]/50'
              }`}
          >
            {isRadarView ? '◉' : '○'} RADAR VISION
          </motion.button>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          >
            <Link
              href="/game"
              className="group relative block w-full touch-target hud-text text-[var(--text-xs)] text-center border-l-2 border-[var(--orange-tactical)] bg-black/40 text-[var(--orange-tactical)] transition-all duration-300 hover:bg-[var(--orange-tactical)]/20 hover:shadow-[0_0_15px_rgba(255,106,0,0.3)] hover:translate-x-1"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                ◈ LAUNCH MISSION ◈
              </span>
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-[var(--orange-tactical)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
