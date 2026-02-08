'use client'

import { useRef, useMemo, useLayoutEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { OBJLoader } from 'three-stdlib'
import { useExperienceStore } from '@/stores/experience'
import gsap from 'gsap'
import '@/features/experience/three/materials/StealthMaterial'
import { StealthShaderMaterial } from '@/features/experience/three/materials/StealthMaterial'

const DEFAULT_MODEL_PATH = '/models/f47.glb'

export function F47Model({ path = DEFAULT_MODEL_PATH }: { path?: string }) {
  const isObj = path.endsWith('.obj')

  return isObj ? <ObjLoaderWrapper path={path} /> : <GltfLoaderWrapper path={path} />
}

function ObjLoaderWrapper({ path }: { path: string }) {
  const obj = useLoader(OBJLoader, path)
  // Clone to avoid mutation of cached object if reused
  const scene = useMemo(() => obj.clone(), [obj])
  return <ModelContent scene={scene} />
}

function GltfLoaderWrapper({ path }: { path: string }) {
  const { scene } = useGLTF(path)
  // Clone to avoid mutation of cached object if reused
  const clonedScene = useMemo(() => scene.clone(true), [scene])
  return <ModelContent scene={clonedScene} />
}

function ModelContent({ scene }: { scene: THREE.Group | THREE.Object3D }) {
  const groupRef = useRef<THREE.Group>(null)
  const materialRef = useRef<InstanceType<typeof StealthShaderMaterial>>(null)
  const { isRadarView } = useExperienceStore()

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const targetSize = 6
    const s = targetSize / maxDim

    scene.scale.setScalar(s)
    scene.position.set(-center.x * s, -center.y * s, -center.z * s)
  }, [scene])

  useLayoutEffect(() => {
    if (!materialRef.current) return
    const mat = materialRef.current

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = mat
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  useLayoutEffect(() => {
    if (!materialRef.current || !groupRef.current) return

    // Snappy transition for Radar Mode
    // Following Remotion's 'snappy' vibe: fast start, minimal bounce
    gsap.to(materialRef.current.uniforms.uRadarMode, {
      value: isRadarView ? 1.0 : 0.0,
      duration: 0.4,
      ease: 'expo.out', // Snappy: fast out, smooth finish
    })

    // Subtle scale 'heartbeat' or pulse when switching modes
    gsap.fromTo(
      groupRef.current.scale,
      { x: 1, y: 1, z: 1 },
      {
        x: 1.05,
        y: 1.05,
        z: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      }
    )

    // Flicker scanlines on mode change for 'tech' feel
    gsap.fromTo(
      materialRef.current.uniforms.uScanlineIntensity,
      { value: 0.3 },
      {
        value: 1.0,
        duration: 0.1,
        yoyo: true,
        repeat: 3,
        ease: 'steps(2)',
      }
    )
  }, [isRadarView])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }

    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002
    }
  })

  return (
    <group ref={groupRef} position={[4, 0, 0]}>
      <primitive object={scene} />
      <stealthShaderMaterial ref={materialRef} attach="" />
      <pointLight position={[0, -2, -4]} color="#ff6a00" intensity={2} distance={6} />
    </group>
  )
}

// Preload the default GLTF to avoid pop-in
useGLTF.preload(DEFAULT_MODEL_PATH)
