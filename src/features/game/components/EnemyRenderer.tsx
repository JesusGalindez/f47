'use client'

import { useGameStore } from '../stores/gameStore'
import { ENEMY_CONFIGS } from '../types/game'

function EnemyMesh({
  type,
  hp,
  maxHp,
  size,
}: {
  type: string
  hp: number
  maxHp: number
  size: number
}) {
  const cfg = ENEMY_CONFIGS[type as keyof typeof ENEMY_CONFIGS]
  const hpRatio = hp / maxHp
  const emissiveIntensity = 0.5 + (1 - hpRatio) * 1.5

  if (type === 'boss') {
    return (
      <group>
        <mesh>
          <dodecahedronGeometry args={[size]} />
          <meshStandardMaterial
            color={cfg.color}
            emissive={cfg.color}
            emissiveIntensity={emissiveIntensity}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <octahedronGeometry args={[size * 1.3]} />
          <meshBasicMaterial color={cfg.color} wireframe transparent opacity={0.3} />
        </mesh>
        <pointLight color={cfg.color} intensity={3} distance={6} />
      </group>
    )
  }

  if (type === 'tank') {
    return (
      <mesh>
        <boxGeometry args={[size * 1.4, size * 0.6, size * 1.4]} />
        <meshStandardMaterial
          color={cfg.color}
          emissive={cfg.color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    )
  }

  if (type === 'kamikaze') {
    return (
      <mesh>
        <coneGeometry args={[size * 0.6, size * 1.5, 4]} />
        <meshStandardMaterial
          color={cfg.color}
          emissive={cfg.color}
          emissiveIntensity={1 + Math.sin(Date.now() * 0.01) * 0.5}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
    )
  }

  return (
    <mesh>
      <octahedronGeometry args={[size]} />
      <meshStandardMaterial
        color={cfg.color}
        emissive={cfg.color}
        emissiveIntensity={emissiveIntensity}
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>
  )
}

export function EnemyRenderer() {
  const enemies = useGameStore((s) => s.enemies)

  return (
    <>
      {enemies.map((enemy) => (
        <group key={enemy.id} position={[enemy.position.x, enemy.position.y, enemy.position.z]}>
          <EnemyMesh type={enemy.type} hp={enemy.hp} maxHp={enemy.maxHp} size={enemy.size} />
          {(enemy.type === 'tank' || enemy.type === 'boss') && (
            <group position={[0, enemy.size + 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh>
                <planeGeometry args={[enemy.size * 2, 0.1]} />
                <meshBasicMaterial color="#333" />
              </mesh>
              <mesh position={[-(enemy.size * (1 - enemy.hp / enemy.maxHp)), 0, 0.01]}>
                <planeGeometry args={[enemy.size * 2 * (enemy.hp / enemy.maxHp), 0.1]} />
                <meshBasicMaterial color={enemy.hp / enemy.maxHp > 0.3 ? '#00f0ff' : '#ff2040'} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </>
  )
}
