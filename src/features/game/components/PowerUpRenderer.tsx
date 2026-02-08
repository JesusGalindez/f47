'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'
import type { PowerUpType } from '../types/game'

const PU_COLORS: Record<PowerUpType, string> = {
  weapon: '#ff6a00',
  shield: '#00f0ff',
  speed: '#00ff66',
  nuke: '#ff2040',
  life: '#ff00ff',
  xp: '#ffff00',
}

const PU_LABELS: Record<PowerUpType, string> = {
  weapon: 'W',
  shield: 'S',
  speed: 'V',
  nuke: 'N',
  life: '+',
  xp: 'XP',
}

function PowerUpMesh({ type }: { type: PowerUpType }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const color = PU_COLORS[type]

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 3
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.15
    }
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.25]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
      <pointLight color={color} intensity={2} distance={3} />
    </group>
  )
}

export function PowerUpRenderer() {
  const powerUps = useGameStore((s) => s.powerUps)

  return (
    <>
      {powerUps.map((pu) => (
        <group key={pu.id} position={[pu.position.x, pu.position.y, pu.position.z]}>
          <PowerUpMesh type={pu.type} />
        </group>
      ))}
    </>
  )
}
