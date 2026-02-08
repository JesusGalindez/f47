'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '../stores/gameStore'

export function TouchController() {
  const touchStartRef = useRef<{ x: number; z: number; touchX: number; touchY: number } | null>(
    null
  )
  const phase = useGameStore((s) => s.phase)

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (phase !== 'playing') return
      e.preventDefault()
      const touch = e.touches[0]
      const player = useGameStore.getState().player
      touchStartRef.current = {
        x: player.position.x,
        z: player.position.z,
        touchX: touch.clientX,
        touchY: touch.clientY,
      }
    },
    [phase]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current || phase !== 'playing') return
      e.preventDefault()
      const touch = e.touches[0]
      const start = touchStartRef.current

      const sensitivity = 0.04
      const deltaX = (touch.clientX - start.touchX) * sensitivity
      const deltaY = (touch.clientY - start.touchY) * sensitivity

      const store = useGameStore.getState()
      const newX = Math.max(-9.5, Math.min(9.5, start.x + deltaX))
      const newZ = Math.max(-14, Math.min(-5, start.z - deltaY))

      store.setTouchInput(newX, newZ)
    },
    [phase]
  )

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null
    useGameStore.getState().setTouchInput(null, null)
  }, [])

  useEffect(() => {
    const opts = { passive: false } as AddEventListenerOptions
    window.addEventListener('touchstart', handleTouchStart, opts)
    window.addEventListener('touchmove', handleTouchMove, opts)
    window.addEventListener('touchend', handleTouchEnd)
    window.addEventListener('touchcancel', handleTouchEnd)
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return null
}
