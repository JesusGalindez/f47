import { NextResponse } from 'next/server'
import type { TelemetryData } from '@/types'

function generateTelemetry(): TelemetryData {
  const timestamp = Date.now()
  return {
    id: `TEL-${timestamp}`,
    timestamp,
    mach: 1.2 + Math.random() * 1.8,
    altitude: 35000 + Math.random() * 37000,
    heading: Math.random() * 360,
    throttle: 0.6 + Math.random() * 0.4,
    gForce: 0.8 + Math.random() * 7.2,
    fuelRemaining: 40 + Math.random() * 55,
    escortDrones: [
      {
        id: 'CCA-01',
        callsign: 'SPECTER-1',
        status: Math.random() > 0.1 ? 'active' : 'standby',
        distance: 500 + Math.random() * 2000,
        bearing: Math.random() * 360,
      },
      {
        id: 'CCA-02',
        callsign: 'SPECTER-2',
        status: Math.random() > 0.15 ? 'active' : 'standby',
        distance: 800 + Math.random() * 2500,
        bearing: Math.random() * 360,
      },
      {
        id: 'CCA-03',
        callsign: 'PHANTOM-1',
        status: Math.random() > 0.2 ? 'active' : 'offline',
        distance: 1000 + Math.random() * 3000,
        bearing: Math.random() * 360,
      },
    ],
    systemStatus: {
      engine: Math.random() > 0.05 ? 'nominal' : 'warning',
      weapons: 'nominal',
      avionics: Math.random() > 0.08 ? 'nominal' : 'warning',
      stealth: 'nominal',
      aiCore: 'nominal',
    },
  }
}

export async function GET() {
  const data = generateTelemetry()
  return NextResponse.json(data)
}
