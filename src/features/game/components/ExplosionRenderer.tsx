'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import { soundManager } from '@/lib/sounds'

export function ExplosionRenderer() {
  const explosions = useGameStore((s) => s.explosions)
  const lastCount = useRef(0)

  useEffect(() => {
    if (explosions.length > lastCount.current) {
      soundManager.playExplosion()
    }
    lastCount.current = explosions.length
  }, [explosions.length])

  return (
    <>
      {explosions.map((exp) => (
        <group key={exp.id} position={[exp.position.x, exp.position.y, exp.position.z]}>
          {/* Core flash */}
          <mesh scale={Math.min(exp.scale, exp.maxScale * 0.8)}>
            <sphereGeometry args={[0.5, 12, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={exp.opacity} />
          </mesh>

          {/* Main fiery explosion */}
          <mesh scale={exp.scale}>
            <sphereGeometry args={[0.6, 12, 12]} />
            <meshBasicMaterial color={exp.color} transparent opacity={exp.opacity * 0.8} />
          </mesh>

          {/* Expanding shockwave ring */}
          <mesh scale={exp.scale * 1.5} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.6, 0.05, 8, 32]} />
            <meshBasicMaterial color={exp.color} transparent opacity={exp.opacity * 0.5} />
          </mesh>

          {/* Wireframe debris expanding outward */}
          <mesh scale={exp.scale * 1.8}>
            <icosahedronGeometry args={[0.6, 0]} />
            <meshBasicMaterial
              color={exp.color}
              transparent
              opacity={exp.opacity * 0.4}
              wireframe
            />
          </mesh>

          <pointLight color={exp.color} intensity={exp.opacity * 8} distance={exp.scale * 4} />
        </group>
      ))}
    </>
  )
}
