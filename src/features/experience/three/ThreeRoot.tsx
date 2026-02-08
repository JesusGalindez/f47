'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload, AdaptiveDpr, Html, useProgress } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { F47Model } from './objects/F47Model'
import { SceneEnvironment } from './objects/Environment'
import { SceneCamera } from './scenes/MainScene'

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="text-center space-y-3">
        <div className="hud-text text-sm text-[var(--cyan-reactive)] animate-pulse">
          LOADING ASSET
        </div>
        <div className="w-48 h-1 bg-[var(--bg-dark)] rounded overflow-hidden">
          <div
            className="h-full bg-[var(--cyan-reactive)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="hud-text text-[10px] text-[var(--text-secondary)]">
          {progress.toFixed(0)}%
        </div>
      </div>
    </Html>
  )
}

export function ThreeRoot() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        toneMapping: 3,
        toneMappingExposure: 1.2,
      }}
      camera={{ position: [0, 2, 12], fov: 45 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 0,
      }}
    >
      <SceneEnvironment />
      <Suspense fallback={<Loader />}>
        <F47Model />
      </Suspense>
      <SceneCamera />
      <EffectComposer>
        <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} intensity={0.8} />
        <Noise opacity={0.04} />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
      </EffectComposer>
      <Preload all />
      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
