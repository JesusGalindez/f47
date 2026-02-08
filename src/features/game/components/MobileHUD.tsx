'use client'

import { useGameStore } from '../stores/gameStore'
import { useIsMobile } from '../hooks/useIsMobile'

export function MobileHUD() {
  const isMobile = useIsMobile()
  const phase = useGameStore((s) => s.phase)
  const pauseGame = useGameStore((s) => s.pauseGame)
  const resumeGame = useGameStore((s) => s.resumeGame)

  if (!isMobile) return null
  if (phase !== 'playing' && phase !== 'paused') return null

  return (
    <>
      {/* Pause button */}
      <button
        onClick={() => {
          if (phase === 'playing') pauseGame()
          else if (phase === 'paused') resumeGame()
        }}
        className="fixed top-4 right-4 z-30 w-10 h-10 flex items-center justify-center border border-[var(--cyan-reactive)]/50 bg-[var(--bg-panel)] active:bg-[var(--cyan-reactive)]/20"
      >
        <span className="hud-text text-sm text-[var(--cyan-reactive)]">
          {phase === 'paused' ? '▶' : '❚❚'}
        </span>
      </button>

      {/* Auto-fire indicator */}
      <div className="fixed top-4 left-4 z-30 pointer-events-none">
        <div className="hud-text text-[8px] text-[var(--orange-tactical)] animate-pulse">
          AUTO-FIRE ●
        </div>
      </div>

      {/* Control hint on first play */}
      {phase === 'playing' && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none opacity-40">
          <div className="hud-text text-[9px] text-[var(--text-secondary)] text-center">
            DRAG TO MOVE · TILT TO AIM
          </div>
        </div>
      )}
    </>
  )
}
