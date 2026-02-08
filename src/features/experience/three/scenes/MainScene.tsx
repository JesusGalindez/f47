'use client'

import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useExperienceStore } from '@/stores/experience'

const targetPos = new THREE.Vector3()

export function SceneCamera() {
  const scrollProgress = useExperienceStore((s) => s.scrollProgress)

  useFrame((state) => {
    const t = scrollProgress

    // Define cinematic angles for each section
    // Section 1: Side profile (Hangar)
    // Section 2: Top-down / tactical view
    // Section 3: Rear / engine view
    // Section 4: Front / nose view

    const p1 = new THREE.Vector3(2, 1, 14) // Standard hangar view
    const p2 = new THREE.Vector3(4, 12, 4) // Tactical high angle
    const p3 = new THREE.Vector3(-6, 2, -10) // Rear stealth view
    const p4 = new THREE.Vector3(8, 0, 10) // Nose detail

    if (t < 0.33) {
      const alpha = t / 0.33
      targetPos.lerpVectors(p1, p2, alpha)
    } else if (t < 0.66) {
      const alpha = (t - 0.33) / 0.33
      targetPos.lerpVectors(p2, p3, alpha)
    } else {
      const alpha = (t - 0.66) / 0.34
      targetPos.lerpVectors(p3, p4, alpha)
    }

    // Add slight mouse parallax if we wanted, but keep it stable for now
    state.camera.position.lerp(targetPos, 0.05)

    // Look at the model which we offset visually to result in right-side composition
    // Actually let's look slightly offset to keep it on the right
    state.camera.lookAt(4, 0, 0)
  })

  return null
}
