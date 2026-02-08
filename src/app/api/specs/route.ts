import { NextResponse } from 'next/server'
import type { AircraftSpec } from '@/types'

const specs: AircraftSpec[] = [
  { id: '1', category: 'airframe', name: 'Length', value: '22.8', unit: 'm', classified: false },
  { id: '2', category: 'airframe', name: 'Wingspan', value: '14.2', unit: 'm', classified: false },
  { id: '3', category: 'airframe', name: 'Height', value: '5.1', unit: 'm', classified: false },
  {
    id: '4',
    category: 'airframe',
    name: 'Empty Weight',
    value: '18,200',
    unit: 'kg',
    classified: false,
  },
  {
    id: '5',
    category: 'airframe',
    name: 'Max Takeoff Weight',
    value: '36,500',
    unit: 'kg',
    classified: false,
  },
  {
    id: '6',
    category: 'engine',
    name: 'Designation',
    value: 'XA-9 Variable Cycle Engine',
    classified: false,
  },
  {
    id: '7',
    category: 'engine',
    name: 'Thrust (Dry)',
    value: '26,000',
    unit: 'lbf',
    classified: false,
  },
  {
    id: '8',
    category: 'engine',
    name: 'Thrust (Afterburner)',
    value: '44,000',
    unit: 'lbf',
    classified: true,
  },
  { id: '9', category: 'engine', name: 'Supercruise', value: 'Mach 2.1+', classified: false },
  { id: '10', category: 'avionics', name: 'Radar', value: 'AN/APG-97 AESA', classified: false },
  {
    id: '11',
    category: 'avionics',
    name: 'AI Core',
    value: 'NEXUS-7 Neural Processor',
    classified: false,
  },
  { id: '12', category: 'avionics', name: 'EW Suite', value: '[CLASSIFIED]', classified: true },
  { id: '13', category: 'weapons', name: 'Internal Bays', value: '4 Stations', classified: false },
  {
    id: '14',
    category: 'weapons',
    name: 'Directed Energy',
    value: 'HELWS-3 Laser System',
    classified: true,
  },
  { id: '15', category: 'stealth', name: 'RCS', value: '<0.0001', unit: 'm²', classified: false },
  {
    id: '16',
    category: 'stealth',
    name: 'Coating',
    value: 'Active Metamaterial Tiles',
    classified: true,
  },
  {
    id: '17',
    category: 'ai',
    name: 'CCA Integration',
    value: '6x Autonomous Escorts',
    classified: false,
  },
  {
    id: '18',
    category: 'ai',
    name: 'Decision Latency',
    value: '<50',
    unit: 'ms',
    classified: false,
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const showClassified = searchParams.get('clearance') === 'top-secret'

  let filtered = specs

  if (category) {
    filtered = filtered.filter((s) => s.category === category)
  }

  if (!showClassified) {
    filtered = filtered.map((s) =>
      s.classified ? { ...s, value: '[CLASSIFIED]', unit: undefined } : s
    )
  }

  return NextResponse.json({ specs: filtered })
}
