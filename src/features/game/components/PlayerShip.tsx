'use client'

import { useRef, useMemo, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'

const MODEL_PATH = '/models/f47.glb'

export function PlayerShip() {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(MODEL_PATH)

  const clonedScene = useMemo(() => scene.clone(true), [scene])

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(clonedScene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const targetSize = 2.0
    const s = targetSize / maxDim

    clonedScene.scale.setScalar(s)
    clonedScene.position.set(-center.x * s, -center.y * s, -center.z * s)

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#1a1a2e',
          emissive: '#00f0ff',
          emissiveIntensity: 0.15,
          metalness: 0.9,
          roughness: 0.2,
        })
        child.castShadow = true
      }
    })
  }, [clonedScene])

  useFrame(() => {
    if (!groupRef.current) return
    const g = groupRef.current
    const player = useGameStore.getState().player
    const keys = useGameStore.getState().keys

    g.position.x = THREE.MathUtils.lerp(g.position.x, player.position.x, 0.15)
    g.position.z = THREE.MathUtils.lerp(g.position.z, player.position.z, 0.15)
    g.position.y = 0

    const tiltX =
      (keys['ArrowUp'] || keys['w'] ? 0.3 : 0) - (keys['ArrowDown'] || keys['s'] ? 0.3 : 0)
    const tiltZ =
      (keys['ArrowLeft'] || keys['a'] ? 0.5 : 0) - (keys['ArrowRight'] || keys['d'] ? 0.5 : 0)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, tiltX, 0.1)
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, tiltZ, 0.1)

    const visible = player.invincibleTimer <= 0 || Math.floor(Date.now() / 100) % 2 === 0
    g.visible = visible
  })

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} rotation={[0, 0, 0]} />
      <pointLight position={[0, 0.5, -1]} color="#00f0ff" intensity={4} distance={5} />
      <pointLight position={[0, -0.3, 1]} color="#ff6a00" intensity={2} distance={3} />

      <PlayerShield />
      <PlayerDrones />
    </group>
  )
}

function PlayerShield() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    const shieldHp = useGameStore.getState().player.shieldHp
    meshRef.current.visible = shieldHp > 0
    if (shieldHp > 0) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.08 + shieldHp * 0.04
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.2, 16, 16]} />
      <meshBasicMaterial color="#00f0ff" transparent opacity={0.15} wireframe />
    </mesh>
  )
}

function PlayerDrones() {
  const drones = useGameStore((s) => s.player.drones)

  return (
    <>
      {drones.map((drone) => (
        <group key={drone.id} position={[drone.offset.x, drone.offset.y, drone.offset.z]}>
          <mesh>
            <octahedronGeometry args={[0.2]} />
            <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1} />
          </mesh>
          <pointLight color="#00f0ff" intensity={1.5} distance={2.5} />
        </group>
      ))}
    </>
  )
}

useGLTF.preload(MODEL_PATH)
