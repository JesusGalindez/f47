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

  const materialProps = {
    color: cfg.color,
    emissive: cfg.color,
    emissiveIntensity: emissiveIntensity,
    metalness: 0.8,
    roughness: 0.2,
  }

  const engineProps = {
    color: '#ff6a00',
    emissive: '#ff6a00',
    emissiveIntensity: 3 + Math.sin(Date.now() * 0.02) * 1,
    metalness: 0.5,
    roughness: 0.5,
  }

  if (type === 'boss') {
    return (
      <group scale={[size, size, size]}>
        {/* Core */}
        <mesh>
          <dodecahedronGeometry args={[1]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        {/* Shield Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.2, 16, 32]} />
          <meshStandardMaterial {...materialProps} emissiveIntensity={emissiveIntensity * 1.2} />
        </mesh>
        {/* Outer spikes/guns */}
        <group rotation={[0, Date.now() * 0.001, 0]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[Math.cos((i * Math.PI) / 2) * 1.6, 0, Math.sin((i * Math.PI) / 2) * 1.6]} rotation={[0, -(i * Math.PI) / 2, 0]}>
              <cylinderGeometry args={[0.05, 0.15, 0.6, 8]} />
              <meshStandardMaterial {...materialProps} color="#445566" />
            </mesh>
          ))}
        </group>
        <pointLight color={cfg.color} intensity={3} distance={6} />
      </group>
    )
  }

  if (type === 'tank') {
    return (
      <group scale={[size, size, size]}>
        {/* Fuselage */}
        <mesh>
          <boxGeometry args={[1.0, 0.4, 1.4]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        {/* Armored side panels */}
        <mesh position={[0.7, 0, -0.1]}>
          <boxGeometry args={[0.3, 0.5, 1.2]} />
          <meshStandardMaterial {...materialProps} color="#334455" />
        </mesh>
        <mesh position={[-0.7, 0, -0.1]}>
          <boxGeometry args={[0.3, 0.5, 1.2]} />
          <meshStandardMaterial {...materialProps} color="#334455" />
        </mesh>
        {/* Engines */}
        <mesh position={[0.4, 0, -0.8]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial {...engineProps} />
        </mesh>
        <mesh position={[-0.4, 0, -0.8]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial {...engineProps} />
        </mesh>
      </group>
    )
  }

  if (type === 'kamikaze') {
    return (
      <group scale={[size, size, size]}>
        {/* Nose / Fuselage */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.3]}>
          <coneGeometry args={[0.3, 1.6, 4]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        {/* Swept wings */}
        <mesh position={[0, 0, -0.2]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1.5, 0.05, 0.6]} />
          <meshStandardMaterial {...materialProps} color="#445566" />
        </mesh>
        {/* Big thruster */}
        <mesh position={[0, 0, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.1, 0.3, 8]} />
          <meshStandardMaterial {...engineProps} emissiveIntensity={2 + Math.sin(Date.now() * 0.02) * 1} />
        </mesh>
      </group>
    )
  }

  // default / fighter
  return (
    <group scale={[size, size, size]}>
      {/* Fuselage */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
        <cylinderGeometry args={[0, 0.3, 1.2, 8]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      {/* Cockpit */}
      <mesh position={[0, 0.15, 0.1]}>
        <boxGeometry args={[0.2, 0.1, 0.4]} />
        <meshStandardMaterial color="#000" emissive="#000" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Wings */}
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[1.6, 0.05, 0.4]} />
        <meshStandardMaterial {...materialProps} color="#444" />
      </mesh>
      {/* Engines */}
      <mesh position={[0.3, 0, -0.5]}>
        <boxGeometry args={[0.15, 0.15, 0.2]} />
        <meshStandardMaterial {...engineProps} />
      </mesh>
      <mesh position={[-0.3, 0, -0.5]}>
        <boxGeometry args={[0.15, 0.15, 0.2]} />
        <meshStandardMaterial {...engineProps} />
      </mesh>
    </group>
  )
}

export function EnemyRenderer() {
  const enemies = useGameStore((s) => s.enemies)

  return (
    <>
      {enemies.map((enemy) => (
        <group key={enemy.id} position={[enemy.position.x, enemy.position.y, enemy.position.z]}>
          <EnemyMesh type={enemy.type} hp={enemy.hp} maxHp={enemy.maxHp} size={enemy.size} />
          <group position={[0, enemy.size + 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
              <planeGeometry args={[enemy.size * 2, 0.1]} />
              <meshBasicMaterial color="#333" transparent opacity={0.5} />
            </mesh>
            <mesh position={[-(enemy.size * (1 - enemy.hp / enemy.maxHp)), 0, 0.01]}>
              <planeGeometry args={[enemy.size * 2 * (enemy.hp / enemy.maxHp), 0.1]} />
              <meshBasicMaterial color={enemy.hp / enemy.maxHp > 0.3 ? '#00f0ff' : '#ff2040'} transparent opacity={0.8} />
            </mesh>
          </group>
        </group>
      ))}
    </>
  )
}
