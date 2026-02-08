'use client'

import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'

const desiredPos = new THREE.Vector3()
const lookTarget = new THREE.Vector3()

export function GameCamera() {
  const { camera } = useThree()

  useFrame(() => {
    const playerPos = useGameStore.getState().player.position
    const screenShake = useGameStore.getState().screenShake

    desiredPos.set(playerPos.x * 0.3, 22, playerPos.z - 8)
    camera.position.lerp(desiredPos, 0.08)

    if (screenShake > 0.01) {
      camera.position.x += (Math.random() - 0.5) * screenShake
      camera.position.z += (Math.random() - 0.5) * screenShake * 0.5
    }

    lookTarget.set(playerPos.x * 0.5, 0, playerPos.z + 10)
    camera.lookAt(lookTarget)
  })

  return null
}
