'use client'

class SoundManager {
    private ctx: AudioContext | null = null
    private masterGain: GainNode | null = null
    private ambientBuffer: AudioBuffer | null = null
    private ambientSource: AudioBufferSourceNode | null = null
    private radarBuffer: AudioBuffer | null = null
    private gameMusicSource: OscillatorNode[] = []
    private gameMusicGains: GainNode[] = []

    constructor() {
        if (typeof window !== 'undefined') {
            this.loadBuffers()
        }
    }

    private async loadBuffers() {
        const ctx = this.getContext()
        try {
            // Load Radar
            const radarRes = await fetch('/sounds/radar.wav')
            const radarAB = await radarRes.arrayBuffer()
            this.radarBuffer = await ctx.decodeAudioData(radarAB)

            // Load Ambient
            const ambientRes = await fetch('/sounds/ambient.wav')
            const ambientAB = await ambientRes.arrayBuffer()
            this.ambientBuffer = await ctx.decodeAudioData(ambientAB)
        } catch (e) {
            console.error('Failed to load sounds:', e)
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

    // --- Background Meditative Music (WAV File) ---
    playAmbient() {
        const ctx = this.getContext()
        if (this.ambientSource || !this.ambientBuffer) return

        this.ambientSource = ctx.createBufferSource()
        this.ambientSource.buffer = this.ambientBuffer
        this.ambientSource.loop = true

        const ambientGain = ctx.createGain()
        ambientGain.gain.setValueAtTime(0, ctx.currentTime)
        ambientGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 4) // Smooth fade in

        this.ambientSource.connect(ambientGain)
        ambientGain.connect(this.masterGain!)
        this.ambientSource.start()
    }

    // --- Rhythmic Game Music (Procedural) ---
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

        playPulse(60, [1, 0, 1, 0, 1, 0, 1, 0], 0.2)
        playPulse(864, [0, 0, 1, 0, 0, 1, 0, 1], 0.04)
    }

    stopGameMusic() {
        this.gameMusicSource.forEach(s => s.stop())
        this.gameMusicSource = []
        this.gameMusicGains = []
    }

    // --- External Radar Sound (Softer) ---
    playRadarPing() {
        const ctx = this.getContext()
        this.resume()

        if (this.radarBuffer) {
            const source = ctx.createBufferSource()
            source.buffer = this.radarBuffer
            const gain = ctx.createGain()

            // Reduced volume to be "soafter" as requested
            gain.gain.setValueAtTime(0.15, ctx.currentTime)

            source.connect(gain)
            gain.connect(this.masterGain!)
            source.start()
        } else {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'triangle'
            osc.frequency.setValueAtTime(1200, ctx.currentTime)
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.2)
            gain.gain.setValueAtTime(0.05, ctx.currentTime)
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
        const g = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(200, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.3)
        g.gain.setValueAtTime(0.2, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
        osc.connect(g)
        g.connect(this.masterGain!)
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
    }
}

export const soundManager = typeof window !== 'undefined' ? new SoundManager() : ({} as SoundManager)
