'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { TelemetryData } from '@/types'

function GaugeBar({
  label,
  value,
  max,
  unit,
  color = 'var(--cyan-reactive)',
}: {
  label: string
  value: number
  max: number
  unit: string
  color?: string
}) {
  const percentage = Math.min((value / max) * 100, 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between hud-text text-[10px]">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span style={{ color }}>
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <div className="h-1.5 bg-[var(--bg-dark)] rounded overflow-hidden">
        <motion.div
          className="h-full rounded"
          style={{ backgroundColor: color }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  )
}

function DroneCard({ drone }: { drone: TelemetryData['escortDrones'][0] }) {
  const statusColor = {
    active: 'var(--cyan-reactive)',
    standby: 'var(--orange-tactical)',
    offline: 'var(--danger)',
  }[drone.status]

  return (
    <div className="hud-panel p-2 space-y-1">
      <div className="flex justify-between items-center">
        <span className="hud-text text-[10px] text-[var(--text-primary)]">{drone.callsign}</span>
        <span
          className="hud-text text-[8px] px-1.5 py-0.5 rounded"
          style={{
            color: statusColor,
            border: `1px solid ${statusColor}`,
          }}
        >
          {drone.status.toUpperCase()}
        </span>
      </div>
      <div className="flex justify-between hud-text text-[9px] text-[var(--text-secondary)]">
        <span>DST: {drone.distance.toFixed(0)}m</span>
        <span>BRG: {drone.bearing.toFixed(0)}°</span>
      </div>
    </div>
  )
}

export function TelemetryDashboard() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null)
  const [isLive, setIsLive] = useState(true)

  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch('/api/telemetry')
      const data = await res.json()
      setTelemetry(data)
    } catch (err) {
      console.error('Telemetry fetch failed:', err)
    }
  }, [])

  useEffect(() => {
    fetchTelemetry()
    if (!isLive) return
    const interval = setInterval(fetchTelemetry, 2000)
    return () => clearInterval(interval)
  }, [fetchTelemetry, isLive])

  if (!telemetry) {
    return (
      <div className="hud-panel p-6 text-center">
        <div className="hud-text text-sm text-[var(--cyan-reactive)] animate-pulse">
          ESTABLISHING DATALINK...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="hud-text text-sm text-[var(--cyan-reactive)]">MISSION TELEMETRY FEED</h3>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`hud-text text-[10px] px-2 py-1 border transition-colors ${isLive
              ? 'border-[var(--cyan-reactive)] text-[var(--cyan-reactive)]'
              : 'border-[var(--text-secondary)] text-[var(--text-secondary)]'
            }`}
        >
          {isLive ? '● LIVE' : '○ PAUSED'}
        </button>
      </div>

      {/* Main gauges */}
      <div className="adaptive-grid [--min-width:320px]">
        <div className="hud-panel p-[var(--space-md)] space-y-3">
          <div className="hud-text text-[var(--text-xs)] text-[var(--text-secondary)]">FLIGHT DATA</div>
          <GaugeBar label="MACH" value={telemetry.mach} max={3.5} unit="M" />
          <GaugeBar label="ALTITUDE" value={telemetry.altitude} max={72000} unit="FT" />
          <GaugeBar label="HEADING" value={telemetry.heading} max={360} unit="°" />
          <GaugeBar
            label="THROTTLE"
            value={telemetry.throttle * 100}
            max={100}
            unit="%"
            color="var(--orange-tactical)"
          />
        </div>

        <div className="hud-panel p-[var(--space-md)] space-y-3">
          <div className="hud-text text-[var(--text-xs)] text-[var(--text-secondary)]">SYSTEMS</div>
          <GaugeBar
            label="G-FORCE"
            value={telemetry.gForce}
            max={9}
            unit="G"
            color={telemetry.gForce > 7 ? 'var(--danger)' : 'var(--cyan-reactive)'}
          />
          <GaugeBar
            label="FUEL"
            value={telemetry.fuelRemaining}
            max={100}
            unit="%"
            color={telemetry.fuelRemaining < 30 ? 'var(--danger)' : 'var(--cyan-reactive)'}
          />
          <div className="mt-2 space-y-2">
            {Object.entries(telemetry.systemStatus).map(([key, status]) => (
              <div key={key} className="flex justify-between hud-text text-[var(--text-xs)]">
                <span className="text-[var(--text-secondary)]">{key.toUpperCase()}</span>
                <span
                  style={{
                    color:
                      status === 'nominal'
                        ? 'var(--cyan-reactive)'
                        : status === 'warning'
                          ? 'var(--orange-tactical)'
                          : 'var(--danger)',
                  }}
                >
                  {status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Escort Drones */}
      <div className="hud-panel p-[var(--space-md)]">
        <div className="hud-text text-[var(--text-xs)] text-[var(--text-secondary)] mb-4">
          CCA ESCORT FORMATION
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--space-sm)]">
          {telemetry.escortDrones.map((drone) => (
            <DroneCard key={drone.id} drone={drone} />
          ))}
        </div>
      </div>

      {/* Timestamp */}
      <div className="text-right hud-text text-[8px] text-[var(--text-secondary)]">
        LAST UPDATE: {new Date(telemetry.timestamp).toISOString()}
      </div>
    </div>
  )
}
