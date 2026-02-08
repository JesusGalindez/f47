'use client'

import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../stores/gameStore'

export function GameLoop() {
  const update = useGameStore((s) => s.update)

  useFrame((_, delta) => {
    update(delta)
  })

  return null
}
