'use client'

import { useExperienceStore } from '@/stores/experience'
import { motion, AnimatePresence } from 'framer-motion'

const chapters: Record<string, { title: string; subtitle: string }> = {
  hangar: { title: 'THE HANGAR', subtitle: 'Sixth Generation Air Dominance Platform' },
  tactical: { title: 'TACTICAL BREAKDOWN', subtitle: 'Exploded Systems Analysis' },
  stealth: { title: 'STEALTH VISUALIZER', subtitle: 'Radar Cross-Section Analysis' },
  telemetry: { title: 'LIVE TELEMETRY', subtitle: 'Real-Time Mission Data Feed' },
}

export function ChapterIndicator() {
  const activeChapter = useExperienceStore((s) => s.activeChapter)
  const chapter = chapters[activeChapter] || chapters.hangar

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeChapter}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="hud-text text-xs text-[var(--orange-tactical)]">{chapter.title}</div>
        <div className="hud-text text-[10px] text-[var(--text-secondary)] mt-1">
          {chapter.subtitle}
        </div>
        <div className="flex justify-center gap-2 mt-3">
          {Object.keys(chapters).map((key) => (
            <div
              key={key}
              className="w-8 h-0.5 rounded"
              style={{
                backgroundColor:
                  key === activeChapter ? 'var(--cyan-reactive)' : 'var(--grid-line)',
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
