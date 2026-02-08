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
          <mesh scale={exp.scale}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshBasicMaterial color={exp.color} transparent opacity={exp.opacity} />
          </mesh>
          <mesh scale={exp.scale * 1.5}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshBasicMaterial
              color={exp.color}
              transparent
              opacity={exp.opacity * 0.3}
              wireframe
            />
          </mesh>
          <pointLight color={exp.color} intensity={exp.opacity * 5} distance={exp.scale * 3} />
        </group>
      ))}
    </>
  )
}
