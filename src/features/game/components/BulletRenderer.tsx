'use client'

import { useGameStore } from '../stores/gameStore'

export function BulletRenderer() {
  const bullets = useGameStore((s) => s.bullets)

  return (
    <>
      {bullets.map((bullet) => (
        <group key={bullet.id} position={[bullet.position.x, bullet.position.y, bullet.position.z]}>
          {bullet.type === 'laser' ? (
            <mesh>
              <boxGeometry args={[0.04, 0.04, 0.8]} />
              <meshBasicMaterial color={bullet.color} />
            </mesh>
          ) : bullet.type === 'missile' ? (
            <group>
              <mesh>
                <coneGeometry args={[0.06, 0.3, 4]} />
                <meshBasicMaterial color={bullet.color} />
              </mesh>
              <pointLight color={bullet.color} intensity={1} distance={2} />
            </group>
          ) : (
            <mesh>
              <sphereGeometry args={[bullet.size, 6, 6]} />
              <meshBasicMaterial color={bullet.color} />
            </mesh>
          )}
        </group>
      ))}
    </>
  )
}
