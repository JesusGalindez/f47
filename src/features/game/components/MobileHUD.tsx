'use client'

import { useGameStore } from '../stores/gameStore'
import { useIsMobile } from '../hooks/useIsMobile'
import { useEffect, useState } from 'react'

export function MobileHUD() {
  const isMobile = useIsMobile()
  const phase = useGameStore((s) => s.phase)
  const pauseGame = useGameStore((s) => s.pauseGame)
  const resumeGame = useGameStore((s) => s.resumeGame)
  const specialAttackCharge = useGameStore((s) => s.specialAttackCharge)
  const bulletTimeMeter = useGameStore((s) => s.bulletTimeMeter)
  const activateSpecial = useGameStore((s) => s.activateSpecial)
  const setKey = useGameStore((s) => s.setKey)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isMobile) return null
  if (phase !== 'playing' && phase !== 'paused') return null

  return (
    <>
      {/* Pause button */}
      <button
        data-ui-button="true"
        onClick={() => {
          if (phase === 'playing') pauseGame()
          else if (phase === 'paused') resumeGame()
        }}
        className="fixed top-4 right-4 z-40 w-10 h-10 flex items-center justify-center border border-[var(--cyan-reactive)]/50 bg-[var(--bg-panel)] active:bg-[var(--cyan-reactive)]/20"
      >
        <span className="hud-text text-sm text-[var(--cyan-reactive)] pointer-events-none">
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
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-30 pointer-events-none opacity-40">
          <div className="hud-text text-[9px] text-[var(--text-secondary)] text-center">
            DRAG TO MOVE · TILT TO AIM
          </div>
        </div>
      )}

      {/* Mobile Action Buttons */}
      {phase === 'playing' && (
        <>
          {/* Special Attack Button */}
          <button
            data-ui-button="true"
            className={`fixed bottom-8 left-6 z-40 w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center transition-opacity ${specialAttackCharge >= 100
                ? 'border-[var(--orange-tactical)] bg-[var(--orange-tactical)]/20 text-[var(--orange-tactical)] opacity-100 animate-pulse'
                : 'border-[var(--text-secondary)]/30 bg-black/50 text-[var(--text-secondary)]/50 opacity-50'
              }`}
            onClick={() => activateSpecial()}
          >
            <span className="hud-text text-[10px] pointer-events-none">SPECIAL</span>
            <span className="hud-text text-[8px] mt-1 pointer-events-none">{Math.floor(specialAttackCharge)}%</span>
          </button>

          {/* Bullet Time / Focus Button */}
          <button
            data-ui-button="true"
            className={`fixed bottom-8 right-6 z-40 w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center transition-opacity ${bulletTimeMeter > 0
                ? 'border-[#aa44ff] bg-[#aa44ff]/20 text-[#aa44ff] opacity-100'
                : 'border-[var(--text-secondary)]/30 bg-black/50 text-[var(--text-secondary)]/50 opacity-50'
              }`}
            onTouchStart={(e) => {
              e.stopPropagation()
              setKey('Shift', true)
            }}
            onTouchEnd={(e) => {
              e.stopPropagation()
              setKey('Shift', false)
            }}
            onTouchCancel={(e) => {
              e.stopPropagation()
              setKey('Shift', false)
            }}
          >
            <span className="hud-text text-[10px] pointer-events-none">FOCUS</span>
            <span className="hud-text text-[8px] mt-1 pointer-events-none">{Math.floor(bulletTimeMeter)}%</span>
          </button>
        </>
      )}
    </>
  )
}
