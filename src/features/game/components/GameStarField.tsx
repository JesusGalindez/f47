'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'

export function GameStarField() {
  const pointsRef = useRef<THREE.Points>(null)
  const phase = useGameStore((s) => s.phase)
  const count = 3000

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50
      positions[i * 3 + 1] = -1 - Math.random() * 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60

      const brightness = 0.3 + Math.random() * 0.7
      const isCyan = Math.random() > 0.85
      colors[i * 3] = isCyan ? 0 : brightness
      colors[i * 3 + 1] = isCyan ? brightness * 0.9 : brightness
      colors[i * 3 + 2] = brightness

      sizes[i] = Math.random() * 0.06 + 0.01
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  useFrame(() => {
    if (!pointsRef.current) return
    const isPlaying = phase === 'playing' || phase === 'boss-warning'
    const speed = isPlaying ? 0.15 : 0.03

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = posAttr.array as Float32Array

    for (let i = 0; i < count; i++) {
      arr[i * 3 + 2] -= speed
      if (arr[i * 3 + 2] < -30) {
        arr[i * 3 + 2] = 30
        arr[i * 3] = (Math.random() - 0.5) * 50
      }
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}
