'use client'

import { useEffect } from 'react'
import { ThreeRoot } from './three/ThreeRoot'
import { ScrollDirector } from './scroll/ScrollDirector'
import { HudRoot } from '@/components/hud/HudRoot'
import { soundManager } from '@/lib/sounds'

export function ExperienceShell() {
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundManager.resume()
      // Remove listener after first interaction
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
    }

    window.addEventListener('click', handleFirstInteraction)
    window.addEventListener('touchstart', handleFirstInteraction)

    return () => {
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
    }
  }, [])

  return (
    <>
      <ThreeRoot />
      <HudRoot />
      <ScrollDirector />
    </>
  )
}
