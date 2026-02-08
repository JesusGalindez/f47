'use client'

import dynamic from 'next/dynamic'

const GameCanvas = dynamic(
  () => import('@/features/game/components/GameCanvas').then((m) => m.GameCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-screen h-screen bg-[#020208] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="hud-text text-sm text-[var(--cyan-reactive)] animate-pulse">
            INITIALIZING COMBAT SYSTEMS...
          </div>
          <div className="flex justify-center gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-[var(--cyan-reactive)] rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
  }
)

export default function GamePage() {
  return <GameCanvas />
}
