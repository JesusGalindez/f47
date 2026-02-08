'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import Link from 'next/link'

function Leaderboard() {
  const getLeaderboard = useGameStore((s) => s.getLeaderboard)
  const [board, setBoard] = useState<ReturnType<typeof getLeaderboard>>([])

  useEffect(() => {
    setBoard(getLeaderboard())
  }, [getLeaderboard])

  if (board.length === 0) {
    return (
      <div className="hud-text text-xs text-[var(--text-secondary)] text-center py-4">
        NO RECORDS YET
      </div>
    )
  }

  return (
    <div className="space-y-1 max-h-48 overflow-y-auto">
      {board.map((entry, i) => (
        <div key={i} className="flex justify-between hud-text text-[10px] px-2 py-1">
          <span className="text-[var(--orange-tactical)]">#{i + 1}</span>
          <span className="text-[var(--text-primary)]">{entry.name}</span>
          <span className="text-[var(--cyan-reactive)]">{entry.score.toLocaleString()}</span>
          <span className="text-[var(--text-secondary)]">
            L{entry.level}-W{entry.wave}
          </span>
        </div>
      ))}
    </div>
  )
}

function GameOverScreen() {
  const score = useGameStore((s) => s.score)
  const level = useGameStore((s) => s.level)
  const wave = useGameStore((s) => s.wave)
  const totalKills = useGameStore((s) => s.totalKills)
  const startGame = useGameStore((s) => s.startGame)
  const saveScore = useGameStore((s) => s.saveScore)
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (name.trim()) {
      saveScore(name.trim().toUpperCase().slice(0, 8))
      setSaved(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
    >
      <div className="text-center space-y-6 max-w-md px-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <div className="hud-text text-3xl text-[var(--danger)] tracking-[0.3em]">
            MISSION FAILED
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <div className="hud-panel p-4 space-y-2">
            <div className="flex justify-between hud-text text-xs">
              <span className="text-[var(--text-secondary)]">FINAL SCORE</span>
              <span className="text-[var(--cyan-reactive)]">{score.toLocaleString()}</span>
            </div>
            <div className="flex justify-between hud-text text-xs">
              <span className="text-[var(--text-secondary)]">LEVEL / WAVE</span>
              <span className="text-[var(--orange-tactical)]">
                {level}-{wave}
              </span>
            </div>
            <div className="flex justify-between hud-text text-xs">
              <span className="text-[var(--text-secondary)]">TOTAL KILLS</span>
              <span className="text-[var(--cyan-reactive)]">{totalKills}</span>
            </div>
          </div>

          {/* Save score */}
          {!saved ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="CALLSIGN"
                maxLength={8}
                className="flex-1 bg-[var(--bg-dark)] border border-[var(--cyan-reactive)]/30 px-3 py-1.5 hud-text text-xs text-[var(--text-primary)] outline-none focus:border-[var(--cyan-reactive)]"
              />
              <button
                onClick={handleSave}
                className="px-4 py-1.5 hud-text text-xs border border-[var(--cyan-reactive)] text-[var(--cyan-reactive)] hover:bg-[var(--cyan-reactive)]/10 transition-colors"
              >
                SAVE
              </button>
            </div>
          ) : (
            <div className="hud-text text-xs text-[var(--cyan-reactive)]">SCORE RECORDED</div>
          )}

          <Leaderboard />

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={startGame}
              className="px-6 py-2 hud-text text-sm border-2 border-[var(--cyan-reactive)] text-[var(--cyan-reactive)] hover:bg-[var(--cyan-reactive)]/10 transition-colors tracking-widest"
            >
              RETRY
            </button>
            <Link
              href="/"
              className="px-6 py-2 hud-text text-sm border border-[var(--text-secondary)]/30 text-[var(--text-secondary)] hover:border-[var(--cyan-reactive)] hover:text-[var(--cyan-reactive)] transition-colors tracking-widest"
            >
              EXIT
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export function GameMenu() {
  const phase = useGameStore((s) => s.phase)
  const startGame = useGameStore((s) => s.startGame)

  if (phase === 'gameover') return <GameOverScreen />

  if (phase !== 'menu') return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, type: 'spring' }}
        >
          <div className="hud-text text-5xl text-[var(--cyan-reactive)] tracking-[0.4em]">F-47</div>
          <div className="hud-text text-xl text-[var(--orange-tactical)] tracking-[0.6em] mt-2">
            SENTINEL
          </div>
          <div className="h-px w-48 mx-auto mt-4 bg-gradient-to-r from-transparent via-[var(--cyan-reactive)] to-transparent" />
          <div className="hud-text text-[10px] text-[var(--text-secondary)] mt-3 tracking-[0.3em]">
            GALAXY ASSAULT
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="space-y-4"
        >
          <button
            onClick={startGame}
            className="block mx-auto px-10 py-3 hud-text text-sm border-2 border-[var(--cyan-reactive)] text-[var(--cyan-reactive)] hover:bg-[var(--cyan-reactive)]/10 transition-all duration-300 tracking-[0.3em] hover:tracking-[0.5em]"
          >
            START MISSION
          </button>

          <Link
            href="/"
            className="block mx-auto px-10 py-2 hud-text text-xs border border-[var(--text-secondary)]/30 text-[var(--text-secondary)] hover:border-[var(--cyan-reactive)] hover:text-[var(--cyan-reactive)] transition-colors tracking-widest"
          >
            RETURN TO HANGAR
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="space-y-2"
        >
          <div className="hud-text text-[9px] text-[var(--text-secondary)]">CONTROLS</div>
          <div className="hud-text text-[9px] text-[var(--text-secondary)] space-y-1">
            <div className="flex justify-center gap-6">
              <span>↑↓←→ MOVE</span>
              <span>ESC PAUSE</span>
            </div>
            <div className="flex justify-center gap-6">
              <span>📱 DRAG TO MOVE</span>
              <span>📐 TILT TO AIM</span>
            </div>
            <div className="text-[var(--orange-tactical)]">AUTO-FIRE ENABLED</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
          <Leaderboard />
        </motion.div>
      </div>
    </div>
  )
}
