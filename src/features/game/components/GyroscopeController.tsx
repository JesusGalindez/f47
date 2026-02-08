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
    // Force permission check via window to ensure we access the correct global constructor
    const DeviceOrientation = (window as any).DeviceOrientationEvent
    const DeviceMotion = (window as any).DeviceMotionEvent

    if (DeviceOrientation && typeof DeviceOrientation.requestPermission === 'function') {
      DeviceOrientation.requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            setPermissionState('granted')
          } else {
            console.warn('Gyroscope permission denied:', response)
            setPermissionState('denied')
          }
        })
        .catch((err: any) => {
          console.error('Error requesting gyroscope permission:', err)
          setPermissionState('denied')
        })
    } else if (DeviceMotion && typeof DeviceMotion.requestPermission === 'function') {
      // Fallback to DeviceMotion if Orientation doesn't have it (some browsers)
      DeviceMotion.requestPermission()
        .then((response: string) => {
          if (response === 'granted') setPermissionState('granted')
          else setPermissionState('denied')
        })
        .catch(() => setPermissionState('denied'))
    } else {
      // Permission not required or not supported via this API
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

      if (!baseOrientation.current) {
        baseOrientation.current = { beta, gamma }
        return
      }

      // sensitivity clamping and mapping
      const MAX_TILT = 25
      let dx = gamma - (baseOrientation.current?.gamma || 0)
      let dz = beta - (baseOrientation.current?.beta || 0)

      dx = Math.max(-MAX_TILT, Math.min(MAX_TILT, dx))
      dz = Math.max(-MAX_TILT, Math.min(MAX_TILT, dz))

      const targetX = (dx / MAX_TILT) * 9.5
      const centerZ = -9.5
      const rangeZ = 4.5
      const targetZ = centerZ + (dz / MAX_TILT) * rangeZ

      useGameStore.getState().setGyroInput(targetX, targetZ)
    }

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation)
    }
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [permissionState])

  // Recalibrate when game starts or resumes
  useEffect(() => {
    if (phase === 'playing') {
      baseOrientation.current = null
    }
  }, [phase])

  if (permissionState === 'notsupported') return null

  // Show button if permission is needed (unknown or denied - allow retry)
  if (permissionState === 'unknown' || permissionState === 'denied') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
        <div className="text-center space-y-4 p-8 border border-[var(--cyan-reactive)] bg-black/90 max-w-sm mx-4 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
          <h2 className="text-[var(--cyan-reactive)] text-xl tracking-[0.2em] font-bold">
            SENSORS REQUIRED
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            F47 Sentinel uses your device's gyroscope for combat maneuvers.
            {permissionState === 'denied' && (
              <span className="block mt-2 text-[var(--danger)]">
                Permission was denied. Please check your browser settings and try again.
              </span>
            )}
          </p>
          <button
            onClick={requestPermission}
            className="w-full py-4 px-6 bg-[var(--cyan-reactive)]/20 hover:bg-[var(--cyan-reactive)]/40 border-2 border-[var(--cyan-reactive)] text-[var(--cyan-reactive)] tracking-[0.3em] font-bold transition-all active:scale-95"
          >
            {permissionState === 'denied' ? 'RETRY ACTIVATION' : 'ACTIVATE SENSORS'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-16 z-[60] pointer-events-auto md:hidden">
      <button
        onClick={() => {
          baseOrientation.current = null
        }}
        className="px-3 py-1.5 rounded border border-[var(--cyan-reactive)]/30 bg-black/50 text-[var(--cyan-reactive)] text-[10px] tracking-widest active:bg-[var(--cyan-reactive)]/20 transition-colors"
      >
        ⟲ RECALIBRATE
      </button>
    </div>
  )
}
