'use client'

import { useEffect, useRef } from 'react'

class SoundManager {
    private ctx: AudioContext | null = null
    private masterGain: GainNode | null = null
    private ambientSource: OscillatorNode | null = null
    private ambientFilter: BiquadFilterNode | null = null
    private radarBuffer: AudioBuffer | null = null

    constructor() {
        if (typeof window !== 'undefined') {
            this.loadRadarSound()
        }
    }

    private async loadRadarSound() {
        const ctx = this.getContext()
        try {
            const response = await fetch('/sounds/radar.wav')
            const arrayBuffer = await response.arrayBuffer()
            this.radarBuffer = await ctx.decodeAudioData(arrayBuffer)
        } catch (e) {
            console.error('Failed to load radar sound:', e)
        }
    }

    private getContext(): AudioContext {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
            this.masterGain = this.ctx.createGain()
            this.masterGain.connect(this.ctx.destination)
            this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime)
        }
        return this.ctx
    }

    resume() {
        const ctx = this.getContext()
        if (ctx.state === 'suspended') {
            ctx.resume()
        }
        // Automatically start ambient on first resume interaction
        this.playAmbient()
    }

    // --- Advanced Meditative Space Melody ---
    playAmbient() {
        const ctx = this.getContext()
        if (this.ambientSource) return

        // Base deep hum
        this.ambientSource = ctx.createOscillator()
        this.ambientFilter = ctx.createBiquadFilter()
        const ambientGain = ctx.createGain()

        this.ambientSource.type = 'sine'
        this.ambientSource.frequency.setValueAtTime(432, ctx.currentTime)

        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.frequency.setValueAtTime(0.05, ctx.currentTime)
        lfoGain.gain.setValueAtTime(1, ctx.currentTime)
        lfo.connect(lfoGain)
        lfoGain.connect(this.ambientSource.frequency)
        lfo.start()

        this.ambientFilter.type = 'lowpass'
        this.ambientFilter.frequency.setValueAtTime(200, ctx.currentTime)
        this.ambientFilter.Q.setValueAtTime(0.5, ctx.currentTime)

        ambientGain.gain.setValueAtTime(0, ctx.currentTime)
        ambientGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 5) // Soft fade in

        this.ambientSource.connect(this.ambientFilter)
        this.ambientFilter.connect(ambientGain)
        ambientGain.connect(this.masterGain!)
        this.ambientSource.start()

        // Add "Advanced Space Melody" - Sparse, ethereal notes
        const playNote = (freq: number, startTime: number) => {
            const o = ctx.createOscillator()
            const g = ctx.createGain()
            const f = ctx.createBiquadFilter()

            o.type = 'triangle'
            o.frequency.setValueAtTime(freq, startTime)

            f.type = 'lowpass'
            f.frequency.setValueAtTime(1500, startTime)
            f.Q.setValueAtTime(1, startTime)

            g.gain.setValueAtTime(0, startTime)
            g.gain.linearRampToValueAtTime(0.015, startTime + 2)
            g.gain.exponentialRampToValueAtTime(0.001, startTime + 8)

            o.connect(f)
            f.connect(g)
            g.connect(this.masterGain!)

            o.start(startTime)
            o.stop(startTime + 8)
        }

        // Loop sparse notes
        const notes = [432, 544, 648, 864, 324]
        setInterval(() => {
            if (ctx.state === 'running') {
                const note = notes[Math.floor(Math.random() * notes.length)]
                playNote(note, ctx.currentTime)
            }
        }, 12000)
    }

    // --- External Radar Sound ---
    playRadarPing() {
        const ctx = this.getContext()
        this.resume()

        if (this.radarBuffer) {
            const source = ctx.createBufferSource()
            source.buffer = this.radarBuffer
            const gain = ctx.createGain()

            gain.gain.setValueAtTime(0.4, ctx.currentTime) // Adjust as needed

            source.connect(gain)
            gain.connect(this.masterGain!)
            source.start()
        } else {
            // Fallback to legacy soft ping if buffer not loaded
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'triangle'
            osc.frequency.setValueAtTime(1200, ctx.currentTime)
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.2)
            gain.gain.setValueAtTime(0.03, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
            osc.connect(gain)
            gain.connect(this.masterGain!)
            osc.start()
            osc.stop(ctx.currentTime + 1.2)
        }
    }

    // --- Subtler Shoot Sound ---
    playShoot() {
        const ctx = this.getContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        osc.type = 'sine' // Softer than square
        osc.frequency.setValueAtTime(300, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1)

        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(1500, ctx.currentTime)

        gain.gain.setValueAtTime(0.03, ctx.currentTime) // Lower gain
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(this.masterGain!)

        osc.start()
        osc.stop(ctx.currentTime + 0.15)
    }

    playExplosion() {
        const ctx = this.getContext()
        const bufferSize = ctx.sampleRate * 0.3
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
        }

        const source = ctx.createBufferSource()
        source.buffer = buffer
        const filter = ctx.createBiquadFilter()
        const gain = ctx.createGain()

        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(600, ctx.currentTime)
        filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3)

        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)

        source.connect(filter)
        filter.connect(gain)
        gain.connect(this.masterGain!)

        source.start()
    }

    playPowerUp() {
        const ctx = this.getContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(200, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2)

        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)

        osc.connect(gain)
        gain.connect(this.masterGain!)

        osc.start()
        osc.stop(ctx.currentTime + 0.2)
    }
}

export const soundManager = typeof window !== 'undefined' ? new SoundManager() : ({} as SoundManager)
