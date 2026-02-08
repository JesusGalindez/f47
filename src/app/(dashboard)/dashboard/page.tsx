'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const TelemetryDashboard = dynamic(
  () => import('@/features/dashboard/TelemetryDashboard').then((m) => m.TelemetryDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="hud-panel p-8 text-center">
        <div className="hud-text text-sm text-[var(--cyan-reactive)] animate-pulse">
          INITIALIZING TELEMETRY SYSTEMS...
        </div>
      </div>
    ),
  }
)

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="hud-text text-xl text-[var(--cyan-reactive)]">SENTINEL COMMAND</h1>
            <p className="hud-text text-[10px] text-[var(--text-secondary)] mt-1">
              REAL-TIME MISSION CONTROL INTERFACE
            </p>
          </div>
          <Link
            href="/"
            className="hud-text text-[10px] text-[var(--text-secondary)] border border-[var(--text-secondary)]/30 px-3 py-1.5 hover:border-[var(--cyan-reactive)] hover:text-[var(--cyan-reactive)] transition-colors"
          >
            ← RETURN TO HANGAR
          </Link>
        </div>

        {/* Classification banner */}
        <div className="hud-border p-2 mb-6 text-center">
          <span className="hud-text text-[10px] text-[var(--orange-tactical)]">
            ▲ TOP SECRET // SCI // NOFORN — AUTHORIZED PERSONNEL ONLY ▲
          </span>
        </div>

        <TelemetryDashboard />
      </div>
    </div>
  )
}
