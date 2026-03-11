'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import { WEAPON_NAMES, XP_PER_LEVEL } from '../types/game'

export function GameHUD() {
  const phase = useGameStore((s) => s.phase)
  const score = useGameStore((s) => s.score)
  const highScore = useGameStore((s) => s.highScore)
  const combo = useGameStore((s) => s.combo)
  const level = useGameStore((s) => s.level)
  const wave = useGameStore((s) => s.wave)
  const player = useGameStore((s) => s.player)
  const xp = useGameStore((s) => s.xp)
  const xpLevel = useGameStore((s) => s.xpLevel)
  const controlMode = useGameStore((s) => s.controlMode)
  const nukeFlashTimer = useGameStore((s) => s.nukeFlashTimer)
  const bossWarningTimer = useGameStore((s) => s.bossWarningTimer)
  const showBossWarning = useGameStore((s) => s.showBossWarning)
  const specialAttackCharge = useGameStore((s) => s.specialAttackCharge)
  const bulletTimeMeter = useGameStore((s) => s.bulletTimeMeter)
  const boss = useGameStore((s) => s.enemies.find((e) => e.type === 'boss'))

  if (phase !== 'playing' && phase !== 'paused' && phase !== 'boss-warning') return null

  const xpForNext =
    xpLevel < XP_PER_LEVEL.length ? XP_PER_LEVEL[xpLevel] : XP_PER_LEVEL[XP_PER_LEVEL.length - 1]
  const xpForCurrent = xpLevel > 1 ? XP_PER_LEVEL[xpLevel - 1] : 0
  const xpProgress =
    xpForNext > xpForCurrent ? ((xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100 : 100

  return (
    <>
      {/* Nuke flash */}
      <AnimatePresence>
        {nukeFlashTimer > 0 && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Boss warning */}
      <AnimatePresence>
        {showBossWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 1, 0, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="fixed inset-0 z-40 bg-[var(--danger)]/20 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <div className="hud-text text-5xl text-[var(--danger)] tracking-[0.4em] animate-pulse">
                ⚠ WARNING ⚠
              </div>
              <div className="hud-text text-2xl text-[var(--orange-tactical)] mt-4 tracking-widest bg-black/50 p-2 border-y border-[var(--orange-tactical)]/50">
                CAPITAL SHIP DETECTED
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause overlay */}
      {phase === 'paused' && (
        <div className="fixed inset-0 z-30 bg-black/60 flex items-center justify-center">
          <div className="text-center">
            <div className="hud-text text-3xl text-[var(--cyan-reactive)] tracking-[0.5em]">
              PAUSED
            </div>
            <div className="hud-text text-xs text-[var(--text-secondary)] mt-4">
              PRESS ESC TO RESUME
            </div>
          </div>
        </div>
      )}

      {/* Top HUD */}
      <div className="fixed top-0 left-0 right-0 z-20 pointer-events-none p-4">
        <div className="flex justify-between items-start max-w-4xl mx-auto">
          {/* Score */}
          <div>
            <div className="hud-text text-[9px] text-[var(--text-secondary)]">SCORE</div>
            <div className="hud-text text-2xl text-[var(--cyan-reactive)]">
              {score.toLocaleString()}
            </div>
            {highScore > 0 && (
              <div className="hud-text text-[8px] text-[var(--text-secondary)]">
                HI: {highScore.toLocaleString()}
              </div>
            )}
          </div>

          {/* Level / Wave */}
          <div className="text-center">
            <div className="hud-text text-[9px] text-[var(--text-secondary)]">LEVEL {level}</div>
            <div className="hud-text text-sm text-[var(--orange-tactical)]">WAVE {wave}</div>
          </div>

          {/* Combo */}
          <div className="text-right">
            <AnimatePresence>
              {combo > 1 && (
                <motion.div
                  key={combo}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hud-text text-lg text-[var(--orange-tactical)]"
                >
                  {combo}x COMBO
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Boss Health Bar */}
        <AnimatePresence>
          {boss && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="mt-2 flex flex-col items-center justify-center w-full max-w-md mx-auto"
            >
              <div className="hud-text text-[10px] text-[var(--danger)] tracking-[0.4em] mb-1">CAPITAL SHIP</div>
              <div className="w-full h-2 border border-[var(--danger)]/50 bg-black/80 relative">
                <motion.div
                  className="absolute left-0 top-0 bottom-0 bg-[var(--danger)]"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(boss.hp / boss.maxHp) * 100}%` }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom HUD */}
      <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none p-4">
        <div className="flex justify-between items-end max-w-4xl mx-auto">
          {/* Lives */}
          <div className="flex items-center gap-3">
            <div>
              <div className="hud-text text-[9px] text-[var(--text-secondary)]">LIVES</div>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: player.lives }).map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-[var(--cyan-reactive)] clip-diamond" />
                ))}
              </div>
            </div>
            {player.shieldHp > 0 && (
              <div>
                <div className="hud-text text-[9px] text-[var(--text-secondary)]">SHIELD</div>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: player.shieldHp }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full border border-[var(--cyan-reactive)] bg-[var(--cyan-reactive)]/30"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="pointer-events-auto">
              <button
                onClick={() => {
                  const current = useGameStore.getState().controlMode
                  const next =
                    current === 'keyboard' ? 'mouse' : current === 'mouse' ? 'gyro' : 'keyboard'
                  useGameStore.getState().setControlMode(next)
                }}
                className="hud-text text-[9px] text-[var(--cyan-reactive)] border border-[var(--cyan-reactive)]/50 px-2 py-1 hover:bg-[var(--cyan-reactive)]/20"
              >
                CTRL: {controlMode.toUpperCase()}
              </button>
            </div>

            {/* SPECIAL ATTACK */}
            <div className="ml-4">
              <div className="hud-text text-[9px] text-[var(--orange-tactical)]">SPECIAL [F]</div>
              <div className="w-24 h-1.5 bg-black/50 border border-[var(--orange-tactical)]/50 mt-1 flex">
                <div
                  className={`h-full ${specialAttackCharge >= 100 ? 'bg-white animate-pulse' : 'bg-[var(--orange-tactical)]'}`}
                  style={{ width: `${specialAttackCharge}%` }}
                />
              </div>
            </div>
          </div>

          {/* Weapon */}
          <div className="text-center">
            <div className="hud-text text-[9px] text-[var(--text-secondary)]">WEAPON</div>
            <div className="hud-text text-sm text-[var(--orange-tactical)] mt-0.5">
              {WEAPON_NAMES[player.weaponLevel].toUpperCase()}
            </div>
            <div className="flex gap-0.5 mt-1 justify-center">
              {[1, 2, 3, 4, 5, 6].map((lv) => (
                <div
                  key={lv}
                  className="w-4 h-1 rounded-sm"
                  style={{
                    backgroundColor:
                      lv <= player.weaponLevel ? 'var(--orange-tactical)' : 'var(--bg-dark)',
                    border: '1px solid rgba(255,106,0,0.3)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* XP */}
          <div className="text-right">
            <div className="hud-text text-[9px] text-[var(--text-secondary)]">
              RANK LV.{xpLevel}
            </div>
            <div className="w-24 h-1.5 bg-[var(--bg-dark)] rounded mt-1 overflow-hidden">
              <div
                className="h-full bg-[var(--cyan-reactive)] rounded transition-all duration-300"
                style={{ width: `${Math.min(xpProgress, 100)}%` }}
              />
            </div>
            {player.drones.length > 0 && (
              <div className="hud-text text-[8px] text-[var(--cyan-reactive)] mt-1">
                CCA ×{player.drones.length}
              </div>
            )}

            {/* BULLET TIME */}
            <div className="mt-3">
              <div className="hud-text text-[9px] text-[#aa44ff]">FOCUS [SHIFT]</div>
              <div className="w-24 h-1.5 bg-black/50 border border-[#aa44ff]/50 mt-1 ml-auto flex">
                <div
                  className="h-full bg-[#aa44ff]"
                  style={{ width: `${Math.max(0, bulletTimeMeter)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* On-screen Controls (Touch/Click) */}
      <div className="fixed bottom-24 left-6 z-40">
        <button
          className="w-16 h-16 rounded-full border-2 border-[var(--cyan-reactive)] bg-[var(--cyan-reactive)]/10 active:bg-[var(--cyan-reactive)]/40 flex items-center justify-center backdrop-blur-sm transition-all active:scale-95"
          onPointerDown={() => useGameStore.getState().setKey('ArrowLeft', true)}
          onPointerUp={() => useGameStore.getState().setKey('ArrowLeft', false)}
          onPointerLeave={() => useGameStore.getState().setKey('ArrowLeft', false)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="fixed bottom-24 right-6 z-40">
        <button
          className="w-16 h-16 rounded-full border-2 border-[var(--cyan-reactive)] bg-[var(--cyan-reactive)]/10 active:bg-[var(--cyan-reactive)]/40 flex items-center justify-center backdrop-blur-sm transition-all active:scale-95"
          onPointerDown={() => useGameStore.getState().setKey('ArrowRight', true)}
          onPointerUp={() => useGameStore.getState().setKey('ArrowRight', false)}
          onPointerLeave={() => useGameStore.getState().setKey('ArrowRight', false)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </>
  )
}
