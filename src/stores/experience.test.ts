import { describe, it, expect, beforeEach } from 'vitest'
import { useExperienceStore } from './experience'

describe('Experience Store', () => {
  beforeEach(() => {
    // Reset store state if needed, but Zustand create usually gives a fresh store
  })

  it('should initialize with default values', () => {
    const state = useExperienceStore.getState()
    expect(state.scrollProgress).toBe(0)
    expect(state.activeChapter).toBe('hangar')
    expect(state.isRadarView).toBe(false)
  })

  it('should update scroll progress', () => {
    const { setScrollProgress } = useExperienceStore.getState()
    setScrollProgress(0.5)
    expect(useExperienceStore.getState().scrollProgress).toBe(0.5)
  })

  it('should toggle radar view', () => {
    const { toggleRadarView } = useExperienceStore.getState()
    toggleRadarView()
    expect(useExperienceStore.getState().isRadarView).toBe(true)
    toggleRadarView()
    expect(useExperienceStore.getState().isRadarView).toBe(false)
  })
})
