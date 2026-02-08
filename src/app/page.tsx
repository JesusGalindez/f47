'use client'

import dynamic from 'next/dynamic'

const ExperienceShell = dynamic(
  () => import('@/features/experience/ExperienceShell').then((m) => m.ExperienceShell),
  { ssr: false }
)

export default function HomePage() {
  return (
    <main className="relative">
      <ExperienceShell />
    </main>
  )
}
