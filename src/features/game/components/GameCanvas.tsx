'use client'

import { Suspense, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { PlayerShip } from './PlayerShip'
import { EnemyRenderer } from './EnemyRenderer'
import { BulletRenderer } from './BulletRenderer'
import { PowerUpRenderer } from './PowerUpRenderer'
import { ExplosionRenderer } from './ExplosionRenderer'
import { GameStarField } from './GameStarField'
import { GameLoop } from './GameLoop'
import { GameCamera } from './GameCamera'
import { TouchController } from './TouchController'
import { GyroscopeController } from './GyroscopeController'
import { MobileHUD } from './MobileHUD'
import { GameHUD } from './GameHUD'
import { GameMenu } from './GameMenu'
import { useGameStore } from '../stores/gameStore'
import { soundManager } from '@/lib/sounds'

export function GameCanvas() {
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundManager.resume()
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }

    window.addEventListener('click', handleFirstInteraction)
    window.addEventListener('touchstart', handleFirstInteraction)
    window.addEventListener('keydown', handleFirstInteraction)

    return () => {
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [])

  const setKey = useGameStore((s) => s.setKey)
  const phase = useGameStore((s) => s.phase)
  const pauseGame = useGameStore((s) => s.pauseGame)
  const resumeGame = useGameStore((s) => s.resumeGame)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (phase === 'playing') pauseGame()
        else if (phase === 'paused') resumeGame()
        return
      }
      setKey(e.key, true)
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
      }
    },
    [setKey, phase, pauseGame, resumeGame]
  )

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      setKey(e.key, false)
    },
    [setKey]
  )

  useEffect(() => {
    if (phase === 'playing' || phase === 'boss-warning') {
      soundManager.playGameMusic()
    } else {
      soundManager.stopGameMusic()
    }
  }, [phase])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020208] touch-none">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 22, -8], fov: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <GameCamera />
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 15, 5]} intensity={0.5} color="#8899cc" />
          <directionalLight position={[-3, 10, -5]} intensity={0.2} color="#00f0ff" />

          <GameStarField />

          {(phase === 'playing' || phase === 'paused' || phase === 'boss-warning') && (
            <>
              <PlayerShip />
              <EnemyRenderer />
              <BulletRenderer />
              <PowerUpRenderer />
              <ExplosionRenderer />
            </>
          )}

          <GameLoop />

          <EffectComposer>
            <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.8} intensity={1.2} />
            <Vignette offset={0.1} darkness={0.6} />
          </EffectComposer>
        </Suspense>
        <AdaptiveDpr pixelated />
      </Canvas>

      <TouchController />
      <GyroscopeController />
      <GameHUD />
      <MobileHUD />
      <GameMenu />
    </div>
  )
}
