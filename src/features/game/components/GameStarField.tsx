'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'

export function GameStarField() {
  const pointsRef1 = useRef<THREE.Points>(null)
  const pointsRef2 = useRef<THREE.Points>(null)
  const phase = useGameStore((s) => s.phase)

  // High performance, two-layer starfield gives depth without straining CPU
  const count1 = 1500
  const count2 = 1500

  const createLayer = (count: number, zRange: number, yOffset: number) => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80 // X
      positions[i * 3 + 1] = yOffset + (Math.random() - 0.5) * 20 // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * zRange // Z

      // Claras: pure white/grey with varying brightness
      const brightness = 0.5 + Math.random() * 0.5

      colors[i * 3] = brightness
      colors[i * 3 + 1] = brightness
      colors[i * 3 + 2] = brightness
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }

  // Memoize so they only construct once
  const geo1 = useMemo(() => createLayer(count1, 80, -5), [])
  const geo2 = useMemo(() => createLayer(count2, 80, -15), [])

  const currentSpeed = useRef(0.1)

  useFrame((state, delta) => {
    const isPlaying = phase === 'playing' || phase === 'boss-warning'
    const isGameOver = phase === 'gameover'
    // Target base speeds
    const targetSpeed = (isPlaying || isGameOver) ? 0.6 : 0.1

    // Smoothly transition the speed over time
    currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed, delta * 2)

    // Cap delta to prevent massive jumps when tab is inactive or during heavy renders
    const safeDelta = Math.min(delta, 0.1)

    // Factor to maintain the look of ~60fps
    const timeFactor = safeDelta * 60

    if (pointsRef1.current) {
      const posAttr = pointsRef1.current.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      // Layer 1 is faster (foreground)
      const speed = 0.5 * currentSpeed.current * timeFactor

      for (let i = 0; i < count1; i++) {
        arr[i * 3 + 2] -= speed // Move from top to bottom
        if (arr[i * 3 + 2] < -40) {
          arr[i * 3 + 2] = 40 // Wrap to top
          arr[i * 3] = (Math.random() - 0.5) * 80 // Randomize X again
        }
      }
      posAttr.needsUpdate = true
    }

    if (pointsRef2.current) {
      const posAttr = pointsRef2.current.geometry.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      // Layer 2 is slower (background)
      const speed = 0.15 * currentSpeed.current * timeFactor

      for (let i = 0; i < count2; i++) {
        arr[i * 3 + 2] -= speed // Move from top to bottom
        if (arr[i * 3 + 2] < -40) {
          arr[i * 3 + 2] = 40 // Wrap to top
          arr[i * 3] = (Math.random() - 0.5) * 80
        }
      }
      posAttr.needsUpdate = true
    }
  })

  return (
    <group>
      <points ref={pointsRef1} geometry={geo1}>
        {/* Slightly larger, clear white points */}
        <pointsMaterial size={0.12} vertexColors transparent opacity={0.8} sizeAttenuation={true} />
      </points>
      <points ref={pointsRef2} geometry={geo2}>
        {/* Smaller, clear white points */}
        <pointsMaterial size={0.06} vertexColors transparent opacity={0.5} sizeAttenuation={false} />
      </points>
    </group>
  )
}
