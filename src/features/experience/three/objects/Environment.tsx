'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null)
  const count = 2000

  const [geometry, speeds] = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const spd = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40
      spd[i] = Math.random() * 0.02 + 0.005
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return [geo, spd] as const
  }, [])

  useFrame(() => {
    if (!particlesRef.current) return
    const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute
    const posArray = posAttr.array as Float32Array
    for (let i = 0; i < count; i++) {
      posArray[i * 3 + 1] -= speeds[i]
      if (posArray[i * 3 + 1] < -20) {
        posArray[i * 3 + 1] = 20
      }
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial size={0.03} color="#00f0ff" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

function GridFloor() {
  return (
    <gridHelper
      args={[60, 60, '#00f0ff', '#00f0ff']}
      position={[0, -8, 0]}
      material-transparent
      material-opacity={0.08}
    />
  )
}

export function SceneEnvironment() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 10, 5]} intensity={0.4} color="#8899cc" castShadow />
      <directionalLight position={[-3, 5, -5]} intensity={0.2} color="#00f0ff" />
      <spotLight
        position={[0, 15, 0]}
        intensity={0.8}
        angle={0.3}
        penumbra={0.8}
        color="#00f0ff"
        castShadow
      />
      <fog attach="fog" args={['#0a0a0f', 15, 45]} />
      <ParticleField />
      <GridFloor />
    </>
  )
}
