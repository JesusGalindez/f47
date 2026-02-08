import { create } from 'zustand'
import type { TelemetryData } from '@/types'

interface ExperienceState {
  scrollProgress: number
  activeChapter: string
  isRadarView: boolean
  isExplodedView: boolean
  telemetry: TelemetryData | null
  setScrollProgress: (progress: number) => void
  setActiveChapter: (chapter: string) => void
  toggleRadarView: () => void
  toggleExplodedView: () => void
  setTelemetry: (data: TelemetryData) => void
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  scrollProgress: 0,
  activeChapter: 'hangar',
  isRadarView: false,
  isExplodedView: false,
  telemetry: null,
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setActiveChapter: (chapter) => set({ activeChapter: chapter }),
  toggleRadarView: () => set((state) => ({ isRadarView: !state.isRadarView })),
  toggleExplodedView: () => set((state) => ({ isExplodedView: !state.isExplodedView })),
  setTelemetry: (data) => set({ telemetry: data }),
}))
