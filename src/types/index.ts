export interface TelemetryData {
  id: string
  timestamp: number
  mach: number
  altitude: number
  heading: number
  throttle: number
  gForce: number
  fuelRemaining: number
  escortDrones: DroneStatus[]
  systemStatus: SystemStatus
}

export interface DroneStatus {
  id: string
  callsign: string
  status: 'active' | 'standby' | 'offline'
  distance: number
  bearing: number
}

export interface SystemStatus {
  engine: 'nominal' | 'warning' | 'critical'
  weapons: 'nominal' | 'warning' | 'critical'
  avionics: 'nominal' | 'warning' | 'critical'
  stealth: 'nominal' | 'warning' | 'critical'
  aiCore: 'nominal' | 'warning' | 'critical'
}

export interface AircraftSpec {
  id: string
  category: 'airframe' | 'engine' | 'avionics' | 'weapons' | 'stealth' | 'ai'
  name: string
  value: string
  unit?: string
  classified: boolean
}

export interface ExperienceChapter {
  id: string
  title: string
  subtitle: string
  scrollStart: number
  scrollEnd: number
}
