'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap/register'
import { useExperienceStore } from '@/stores/experience'

const chapters = [
  { id: 'hangar', start: 0, end: 0.25 },
  { id: 'tactical', start: 0.25, end: 0.5 },
  { id: 'stealth', start: 0.5, end: 0.75 },
  { id: 'telemetry', start: 0.75, end: 1.0 },
]

export function ScrollDirector() {
  const containerRef = useRef<HTMLDivElement>(null)
  const setScrollProgress = useExperienceStore((s) => s.setScrollProgress)
  const setActiveChapter = useExperienceStore((s) => s.setActiveChapter)

  useEffect(() => {
    if (!containerRef.current) return

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        const progress = self.progress
        setScrollProgress(progress)

        const current = chapters.find((ch) => progress >= ch.start && progress < ch.end)
        if (current) {
          setActiveChapter(current.id)
        }
      },
    })

    return () => {
      trigger.kill()
    }
  }, [setScrollProgress, setActiveChapter])

  return (
    <div ref={containerRef} className="relative z-20" style={{ height: '400vh' }}>
      {/* Section markers for scrollytelling */}
      {chapters.map((chapter) => (
        <section
          key={chapter.id}
          id={chapter.id}
          className="h-screen flex items-center justify-start pl-24 md:pl-32"
        >
          <div className="max-w-xl text-left">
            <SectionContent id={chapter.id} />
          </div>
        </section>
      ))}
    </div>
  )
}

function SectionContent({ id }: { id: string }) {
  const content: Record<
    string,
    { title: string; description: string; stats?: { label: string; value: string }[] }
  > = {
    hangar: {
      title: 'THE HANGAR',
      description:
        'Welcome to the most advanced air superiority platform ever conceived. The F-47 Sentinel represents the pinnacle of sixth-generation combat aviation — a fusion of artificial intelligence, adaptive stealth, and hypersonic capability.',
      stats: [
        { label: 'MAX SPEED', value: 'MACH 3.2+' },
        { label: 'COMBAT RADIUS', value: '1,850 NM' },
        { label: 'CEILING', value: '72,000 FT' },
      ],
    },
    tactical: {
      title: 'TACTICAL BREAKDOWN',
      description:
        'Explore the modular architecture of the Sentinel. Each subsystem is designed for rapid field replacement and autonomous self-diagnosis. The Variable Cycle Engine adapts its bypass ratio in real-time for optimal performance across all flight regimes.',
      stats: [
        { label: 'ENGINE', value: 'XA-9 VCE' },
        { label: 'AI CORE', value: 'NEXUS-7' },
        { label: 'DRONES', value: '6x CCA' },
      ],
    },
    stealth: {
      title: 'STEALTH VISUALIZER',
      description:
        "Toggle Radar Vision to analyze the Sentinel's radar cross-section profile. Advanced metamaterial skin tiles actively cancel incoming radar waves. The RCS is reduced to below 0.0001 m² across all threat bands.",
      stats: [
        { label: 'RCS', value: '<0.0001 m²' },
        { label: 'IR SUPPRESSION', value: '94%' },
        { label: 'BANDS COVERED', value: 'X/S/L/UHF' },
      ],
    },
    telemetry: {
      title: 'LIVE TELEMETRY',
      description:
        'Real-time mission data streams from active Sentinel platforms. Monitor flight parameters, escort drone formations, and subsystem health across the tactical network.',
    },
  }

  const section = content[id]
  if (!section) return null

  return (
    <div className="space-y-6">
      <h2 className="hud-text text-2xl md:text-4xl text-[var(--cyan-reactive)] tracking-widest">
        {section.title}
      </h2>
      <div className="h-px w-24 bg-gradient-to-r from-transparent via-[var(--cyan-reactive)] to-transparent" />
      <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed font-mono">
        {section.description}
      </p>
      {section.stats && (
        <div className="flex justify-start gap-6 mt-4">
          {section.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="hud-text text-[10px] text-[var(--text-secondary)]">{stat.label}</div>
              <div className="hud-text text-sm text-[var(--orange-tactical)] mt-1">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
