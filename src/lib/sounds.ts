'use client'

class SoundManager {
    private ctx: AudioContext | null = null
    private masterGain: GainNode | null = null
    private ambientSource: OscillatorNode | null = null
    private ambientFilter: BiquadFilterNode | null = null
    private droneSource: OscillatorNode | null = null
    private radarBuffer: AudioBuffer | null = null
    private gameMusicSource: OscillatorNode[] = []
    private gameMusicGains: GainNode[] = []

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
            this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime)
        }
        return this.ctx
    }

    resume() {
        const ctx = this.getContext()
        if (ctx.state === 'suspended') {
            ctx.resume().then(() => {
                this.playAmbient()
            })
        } else {
            this.playAmbient()
        }
    }

    // --- Advanced Meditative Space Melody ---
    playAmbient() {
        const ctx = this.getContext()
        if (this.ambientSource) return

        // Layer 1: Base hum (432Hz)
        this.ambientSource = ctx.createOscillator()
        this.ambientFilter = ctx.createBiquadFilter()
        const ambientGain = ctx.createGain()

        this.ambientSource.type = 'sine'
        this.ambientSource.frequency.setValueAtTime(432, ctx.currentTime)

        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.frequency.setValueAtTime(0.05, ctx.currentTime)
        lfoGain.gain.setValueAtTime(2, ctx.currentTime)
        lfo.connect(lfoGain)
        lfoGain.connect(this.ambientSource.frequency)
        lfo.start()

        this.ambientFilter.type = 'lowpass'
        this.ambientFilter.frequency.setValueAtTime(300, ctx.currentTime)
        this.ambientFilter.Q.setValueAtTime(0.5, ctx.currentTime)

        ambientGain.gain.setValueAtTime(0, ctx.currentTime)
        ambientGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 3)

        this.ambientSource.connect(this.ambientFilter)
        this.ambientFilter.connect(ambientGain)
        ambientGain.connect(this.masterGain!)
        this.ambientSource.start()

        // Layer 2: Deep Drone (Sub)
        this.droneSource = ctx.createOscillator()
        const droneGain = ctx.createGain()
        this.droneSource.type = 'sine'
        this.droneSource.frequency.setValueAtTime(55, ctx.currentTime)
        droneGain.gain.setValueAtTime(0, ctx.currentTime)
        droneGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 10)

        this.droneSource.connect(droneGain)
        droneGain.connect(this.masterGain!)
        this.droneSource.start()

        // Layer 3: Ethereal Notes
        const playNote = (freq: number, startTime: number) => {
            const o = ctx.createOscillator()
            const g = ctx.createGain()
            const f = ctx.createBiquadFilter()

            o.type = 'triangle'
            o.frequency.setValueAtTime(freq, startTime)

            f.type = 'lowpass'
            f.frequency.setValueAtTime(1000, startTime)
            f.Q.setValueAtTime(2, startTime)

            g.gain.setValueAtTime(0, startTime)
            g.gain.linearRampToValueAtTime(0.05, startTime + 2)
            g.gain.exponentialRampToValueAtTime(0.001, startTime + 10)

            o.connect(f)
            f.connect(g)
            g.connect(this.masterGain!)

            o.start(startTime)
            o.stop(startTime + 10)
        }

        const notes = [432, 544, 648, 864, 324]
        const intervalId = setInterval(() => {
            if (ctx.state === 'running') {
                const note = notes[Math.floor(Math.random() * notes.length)]
                playNote(note, ctx.currentTime)
            } else if (ctx.state === 'closed') {
                clearInterval(intervalId)
            }
        }, 5000)
    }

    // --- Rhythmic Game Music ---
    playGameMusic() {
        const ctx = this.getContext()
        if (this.gameMusicSource.length > 0) return

        const playPulse = (freq: number, pattern: number[], gainVal: number) => {
            const osc = ctx.createOscillator()
            const g = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(freq, ctx.currentTime)
            g.gain.setValueAtTime(0, ctx.currentTime)
            osc.connect(g)
            g.connect(this.masterGain!)
            osc.start()
            this.gameMusicSource.push(osc)
            this.gameMusicGains.push(g)
            let step = 0
            setInterval(() => {
                if (ctx.state !== 'running') return
                if (pattern[step % pattern.length]) {
                    g.gain.cancelScheduledValues(ctx.currentTime)
                    g.gain.setValueAtTime(0, ctx.currentTime)
                    g.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + 0.05)
                    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
                }
                step++
            }, 200)
        }

        // Pulse 1: Bass
        playPulse(60, [1, 0, 1, 0, 1, 0, 1, 0], 0.2)
        // Pulse 2: Ethereal high syncopation
        playPulse(864, [0, 0, 1, 0, 0, 1, 0, 1], 0.04)
    }

    stopGameMusic() {
        this.gameMusicSource.forEach(s => s.stop())
        this.gameMusicSource = []
        this.gameMusicGains = []
    }

    // --- External Radar Sound ---
    playRadarPing() {
        const ctx = this.getContext()
        this.resume()

        if (this.radarBuffer) {
            const source = ctx.createBufferSource()
            source.buffer = this.radarBuffer
            const gain = ctx.createGain()
            gain.gain.setValueAtTime(0.7, ctx.currentTime)
            source.connect(gain)
            gain.connect(this.masterGain!)
            source.start()
        } else {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'triangle'
            osc.frequency.setValueAtTime(1200, ctx.currentTime)
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.2)
            gain.gain.setValueAtTime(0.15, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
            osc.connect(gain)
            gain.connect(this.masterGain!)
            osc.start()
            osc.stop(ctx.currentTime + 1.2)
        }
    }

    // --- Game Sounds ---
    playShoot() {
        const ctx = this.getContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(450, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.1)
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(2500, ctx.currentTime)
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(this.masterGain!)
        osc.start()
        osc.stop(ctx.currentTime + 0.15)
    }

    playExplosion() {
        const ctx = this.getContext()
        const bufferSize = ctx.sampleRate * 0.4
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
        filter.frequency.setValueAtTime(800, ctx.currentTime)
        filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
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
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.3)
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
        osc.connect(gain)
        gain.connect(this.masterGain!)
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
    }
}

export const soundManager = typeof window !== 'undefined' ? new SoundManager() : ({} as SoundManager)
