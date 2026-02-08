'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'

export function GyroscopeController() {
  const [permissionState, setPermissionState] = useState<
    'unknown' | 'granted' | 'denied' | 'notsupported'
  >('unknown')
  const phase = useGameStore((s) => s.phase)
  const baseOrientation = useRef<{ beta: number; gamma: number } | null>(null)

  // Check support on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      // Check if permission is required (iOS 13+)
      // @ts-ignore
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        setPermissionState('unknown')
      } else {
        setPermissionState('granted')
      }
    } else {
      setPermissionState('notsupported')
    }
  }, [])

  const requestPermission = () => {
    // @ts-ignore
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // @ts-ignore
      DeviceOrientationEvent.requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            setPermissionState('granted')
          } else {
            setPermissionState('denied')
          }
        })
        .catch(() => setPermissionState('denied'))
    } else {
      setPermissionState('granted')
    }
  }

  // Handle orientation events
  useEffect(() => {
    if (permissionState !== 'granted') return

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // Basic safeguard for null values
      const beta = e.beta || 0 // Front/Back [-180, 180]
      const gamma = e.gamma || 0 // Left/Right [-90, 90]

      // Determine calibration "neutral" point
      // Ideally, the user holds the phone comfortably (e.g. 45deg tilted up)
      if (!baseOrientation.current) {
        baseOrientation.current = { beta, gamma }
        return
      }

      // Calculate relative tilt from neutral
      // Sensitivity factor
      const sensitivity = 1.5

      // Gamma (Left/Right) -> X Axis
      // If phone is flat, Gamma is rotation. If vertical, Gamma is confusing.
      // Standard portrait mode: Gamma = L/R tilt.
      const tiltX = (gamma - baseOrientation.current.gamma) * 0.05 * sensitivity

      // Beta (Front/Back) -> Z Axis (Up/Down in game)
      // Beta increases as you tilt top towards you (0 -> 90)
      const tiltY = (beta - baseOrientation.current.beta) * 0.05 * sensitivity

      // Update store
      // We send the RELATIVE tilt (-1 to 1 approx) or absolute target?
      // The store expects SetTilt(x, y) which is tilt amount (-1 to 1).
      // Or setGyroInput(targetX, targetZ).
      // Let's use setTilt since gameStore handles the movement logic nicely with `controlMode: gyro`.
      // Wait, user added `setGyroInput` in gameStore.ts recently (Step 596).
      // Let's use `setGyroInput` if that's the preferred way, or `setTilt`.
      // `setGyroInput` sets a direct target position. `setTilt` sets a velocity modifier.
      // For smooth movement, `setTilt` (velocity) feels more "game-like" (tilt to move).
      // `setGyroInput` (direct mapping) feels more like "pointer".
      // Given "se pueda mover bien", velocity (tilt) is usually better for mobile games than 1:1 mapping which shakes a lot.
      // However, the `gameStore.ts` logic for `gyroTarget` (Step 597) does interpolation:
      //       player.position.x += (state.gyroTarget.x - player.position.x) * 0.1
      //       player.position.z += (state.gyroTarget.z - player.position.z) * 0.1
      // This is a "follow the target" approach (Direct Control).
      // Let's implement Direct Control but smoothed.

      // Let's map tilt angles to screen coordinates (Target X/Z).
      // Max tilt for edge of screen: 30 degrees?
      const MAX_TILT = 25

      // Current clamped tilt
      let dx = gamma - (baseOrientation.current?.gamma || 0)
      let dz = beta - (baseOrientation.current?.beta || 0)

      // Clamp to range
      dx = Math.max(-MAX_TILT, Math.min(MAX_TILT, dx))
      dz = Math.max(-MAX_TILT, Math.min(MAX_TILT, dz))

      // Map to game bounds: X[-9.5, 9.5], Z[-14, -5]
      // dx (-25 to 25) -> X (-9.5 to 9.5)
      // dz (-25 to 25) -> Z (-14 to -5). Neutral is center (-9.5).

      const targetX = (dx / MAX_TILT) * 9.5
      // Z neutral is -9.5.
      // If we tilt forward (beta decreases?), we go UP (Z decreases -> -14).
      // If we tilt back (beta increases), we go DOWN (Z increases -> -5).
      // beta decreases -> top of phone goes away -> move UP/FORWARD?
      // Actually standard: Tilt forward (top away) = Move Up.
      // Beta decreases when tilting forward from vertical (90) to flat (0).
      // So dz < 0 -> Move Up (Z decreases).

      const centerZ = -9.5
      const rangeZ = 4.5 // +/- 4.5 gives [-14, -5]
      const targetZ = centerZ + (dz / MAX_TILT) * rangeZ

      useGameStore.getState().setGyroInput(targetX, targetZ)
    }

    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [permissionState])

  // Recalibrate when game starts or resumes
  useEffect(() => {
    if (phase === 'playing') {
      // Reset base on next frame
      baseOrientation.current = null
    }
  }, [phase])

  if (permissionState === 'notsupported') return null

  // Show button if permission is needed (unknown or denied-ish but retryable)
  if (permissionState === 'unknown') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="text-center space-y-4 p-6 border border-[var(--cyan-reactive)] bg-[var(--bg-panel)] max-w-sm mx-4">
          <h2 className="text-[var(--cyan-reactive)] text-xl tracking-widest">ENABLE CONTROLS</h2>
          <p className="text-[var(--text-secondary)] text-sm">
            F47 Sentinel requires gyroscope access for precision piloting.
          </p>
          <button
            onClick={requestPermission}
            className="w-full py-3 px-6 bg-[var(--cyan-reactive)]/20 hover:bg-[var(--cyan-reactive)]/40 border border-[var(--cyan-reactive)] text-[var(--cyan-reactive)] tracking-widest transition-all"
          >
            ACTIVATE SENSORS
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-30 pointer-events-auto md:hidden">
      {/* Optional Recalibrate Button - Small icon */}
      <button
        onClick={() => {
          baseOrientation.current = null
        }}
        className="p-2 rounded-full border border-[var(--cyan-reactive)]/30 bg-[var(--bg-panel)]/50 text-[var(--cyan-reactive)] text-[10px]"
      >
        ⟲ RESET GYRO
      </button>
    </div>
  )
}
