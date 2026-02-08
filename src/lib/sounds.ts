'use client'

import { useEffect, useRef } from 'react'

class SoundManager {
    private ctx: AudioContext | null = null
    private masterGain: GainNode | null = null
    private ambientSource: OscillatorNode | null = null
    private ambientFilter: BiquadFilterNode | null = null

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
    }

    // --- Background Ambient Sound ---
    playAmbient() {
        const ctx = this.getContext()
        if (this.ambientSource) return

        this.ambientSource = ctx.createOscillator()
        this.ambientFilter = ctx.createBiquadFilter()
        const gainNode = ctx.createGain()

        this.ambientSource.type = 'sine'
        this.ambientSource.frequency.setValueAtTime(40, ctx.currentTime) // Deep low hum

        // Add subtle frequency modulation for "meditative" feel
        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.frequency.setValueAtTime(0.1, ctx.currentTime)
        lfoGain.gain.setValueAtTime(2, ctx.currentTime)
        lfo.connect(lfoGain)
        lfoGain.connect(this.ambientSource.frequency)
        lfo.start()

        this.ambientFilter.type = 'lowpass'
        this.ambientFilter.frequency.setValueAtTime(200, ctx.currentTime)
        this.ambientFilter.Q.setValueAtTime(1, ctx.currentTime)

        gainNode.gain.setValueAtTime(0, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2)

        this.ambientSource.connect(this.ambientFilter)
        this.ambientFilter.connect(gainNode)
        gainNode.connect(this.masterGain!)

        this.ambientSource.start()
    }

    // --- Radar UI Sound ---
    playRadarPing() {
        const ctx = this.getContext()
        this.resume()

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, ctx.currentTime) // A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5)

        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(1000, ctx.currentTime)
        filter.Q.setValueAtTime(5, ctx.currentTime)

        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(this.masterGain!)

        osc.start()
        osc.stop(ctx.currentTime + 0.5)
    }

    // --- Game Sounds ---
    playShoot() {
        const ctx = this.getContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'square' // More mechanical/retro
        osc.frequency.setValueAtTime(400, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1)

        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)

        osc.connect(gain)
        gain.connect(this.masterGain!)

        osc.start()
        osc.stop(ctx.currentTime + 0.1)
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
