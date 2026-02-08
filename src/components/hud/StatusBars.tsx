'use client'

import { motion } from 'framer-motion'

const systems = [
  { label: 'ENG', value: 98, color: 'var(--cyan-reactive)' },
  { label: 'WPN', value: 100, color: 'var(--cyan-reactive)' },
  { label: 'AVI', value: 95, color: 'var(--cyan-reactive)' },
  { label: 'STL', value: 92, color: 'var(--orange-tactical)' },
  { label: 'AI', value: 100, color: 'var(--cyan-reactive)' },
]

export function StatusBars() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 1 }}
      className="hud-panel p-3 space-y-2 w-32"
    >
      <div className="hud-text text-[10px] text-[var(--text-secondary)] mb-2">SYS INTEGRITY</div>
      {systems.map((sys) => (
        <div key={sys.label}>
          <div className="flex justify-between hud-text text-[9px]">
            <span className="text-[var(--text-secondary)]">{sys.label}</span>
            <span style={{ color: sys.color }}>{sys.value}%</span>
          </div>
          <div className="h-1 bg-[var(--bg-dark)] rounded mt-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${sys.value}%` }}
              transition={{ duration: 1.5, delay: 1.2 }}
              className="h-full rounded"
              style={{ backgroundColor: sys.color }}
            />
          </div>
        </div>
      ))}
    </motion.div>
  )
}
