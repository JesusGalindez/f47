'use client'

import { ThreeRoot } from './three/ThreeRoot'
import { ScrollDirector } from './scroll/ScrollDirector'
import { HudRoot } from '@/components/hud/HudRoot'

export function ExperienceShell() {
  return (
    <>
      <ThreeRoot />
      <HudRoot />
      <ScrollDirector />
    </>
  )
}
