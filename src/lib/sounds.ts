'use client'

class SoundManager {
    private ctx: AudioContext | null = null
    private masterGain: GainNode | null = null
    private radarBuffer: AudioBuffer | null = null
    private gameMusicSource: OscillatorNode[] = []
    private gameMusicGains: GainNode[] = []
    private ambientOscillators: OscillatorNode[] = []
    private ambientGains: GainNode[] = []
    private isAmbientPlaying = false

    constructor() {
        if (typeof window !== 'undefined') {
            this.loadRadarSound()
        }
    }

    private async loadRadarSound() {
        const ctx = this.getContext()
        try {
            const radarRes = await fetch('/sounds/radar.wav')
            const radarAB = await radarRes.arrayBuffer()
            this.radarBuffer = await ctx.decodeAudioData(radarAB)
        } catch (e) {
            console.error('Failed to load radar sound:', e)
        }
    }

    private getContext(): AudioContext {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
            this.masterGain = this.ctx.createGain()
            this.masterGain.connect(this.ctx.destination)
            this.masterGain.gain.setValueAtTime(0.20, this.ctx.currentTime) // Ultra subtle master
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

    // --- Ultra-Minimal Ambient with Breathing Pauses ---
    playAmbient() {
        const ctx = this.getContext()
        if (this.isAmbientPlaying) return
        this.isAmbientPlaying = true

        // Breathing drone with long pauses - only fades in occasionally
        const createBreathingDrone = () => {
            const drone = ctx.createOscillator()
            const droneGain = ctx.createGain()
            const droneFilter = ctx.createBiquadFilter()

            drone.type = 'sine'
            drone.frequency.setValueAtTime(55, ctx.currentTime) // Very deep A1

            droneFilter.type = 'lowpass'
            droneFilter.frequency.setValueAtTime(60, ctx.currentTime) // Even more filtered
            droneFilter.Q.setValueAtTime(0.3, ctx.currentTime)

            droneGain.gain.setValueAtTime(0, ctx.currentTime)

            drone.connect(droneFilter)
            droneFilter.connect(droneGain)
            droneGain.connect(this.masterGain!)
            drone.start()

            this.ambientOscillators.push(drone)
            this.ambientGains.push(droneGain)

            // Breathing cycle: fade in over 15s, hold briefly, fade out over 15s, pause 40s
            const breatheCycle = () => {
                if (ctx.state !== 'running') return

                const now = ctx.currentTime
                droneGain.gain.cancelScheduledValues(now)
                droneGain.gain.setValueAtTime(0, now)
                droneGain.gain.linearRampToValueAtTime(0.012, now + 15) // Ultra quiet peak
                droneGain.gain.setValueAtTime(0.012, now + 20) // Brief hold
                droneGain.gain.linearRampToValueAtTime(0, now + 35) // Fade out

                // Next breath after shorter pause (25-35 seconds total cycle)
                setTimeout(breatheCycle, 25000 + Math.random() * 10000)
            }

            // Start first breath after 5 seconds
            setTimeout(breatheCycle, 5000)
        }

        createBreathingDrone()

        // Ethereal shimmer - appears rarely and fades in/out gently
        const createBreathingShimmer = () => {
            const shimmer = ctx.createOscillator()
            const shimmerGain = ctx.createGain()
            const shimmerFilter = ctx.createBiquadFilter()

            shimmer.type = 'sine'
            shimmer.frequency.setValueAtTime(432, ctx.currentTime)

            // Very slow breathing LFO - even slower
            const lfo = ctx.createOscillator()
            const lfoGain = ctx.createGain()
            lfo.frequency.setValueAtTime(0.008, ctx.currentTime) // Ultra ultra slow
            lfoGain.gain.setValueAtTime(0.8, ctx.currentTime) // Less modulation
            lfo.connect(lfoGain)
            lfoGain.connect(shimmer.frequency)
            lfo.start()

            shimmerFilter.type = 'lowpass'
            shimmerFilter.frequency.setValueAtTime(350, ctx.currentTime) // More filtered
            shimmerFilter.Q.setValueAtTime(0.5, ctx.currentTime)

            shimmerGain.gain.setValueAtTime(0, ctx.currentTime)

            shimmer.connect(shimmerFilter)
            shimmerFilter.connect(shimmerGain)
            shimmerGain.connect(this.masterGain!)
            shimmer.start()

            this.ambientOscillators.push(shimmer, lfo)
            this.ambientGains.push(shimmerGain)

            // Shimmer breath cycle - even more sparse
            const shimmerBreathe = () => {
                if (ctx.state !== 'running') return

                const now = ctx.currentTime
                shimmerGain.gain.cancelScheduledValues(now)
                shimmerGain.gain.setValueAtTime(0, now)
                shimmerGain.gain.linearRampToValueAtTime(0.004, now + 12) // Barely audible
                shimmerGain.gain.setValueAtTime(0.004, now + 18)
                shimmerGain.gain.linearRampToValueAtTime(0, now + 30)

                // Next shimmer after moderate pause (35-50 seconds)
                setTimeout(shimmerBreathe, 35000 + Math.random() * 15000)
            }

            // First shimmer after 12 seconds
            setTimeout(shimmerBreathe, 12000)
        }

        createBreathingShimmer()

        // Very rare celestial notes - extremely sparse
        const notes = [432, 540, 324] // Harmonically related (A=432Hz based)

        const playNote = () => {
            if (ctx.state !== 'running') return

            const note = notes[Math.floor(Math.random() * notes.length)]
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            const filter = ctx.createBiquadFilter()

            osc.type = 'sine'
            osc.frequency.setValueAtTime(note, ctx.currentTime)

            filter.type = 'lowpass'
            filter.frequency.setValueAtTime(800, ctx.currentTime) // Softer
            filter.Q.setValueAtTime(0.5, ctx.currentTime)

            // Gentle envelope - audible but subtle
            gain.gain.setValueAtTime(0, ctx.currentTime)
            gain.gain.linearRampToValueAtTime(0.005, ctx.currentTime + 4) // Slightly louder
            gain.gain.setValueAtTime(0.005, ctx.currentTime + 8) // Hold
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 18) // Moderate fade

            osc.connect(filter)
            filter.connect(gain)
            gain.connect(this.masterGain!)

            osc.start()
            osc.stop(ctx.currentTime + 18)

            // Moderate spacing - 20-35 seconds between notes
            const nextDelay = 20000 + Math.random() * 15000
            setTimeout(playNote, nextDelay)
        }

        // First note after 15 seconds
        setTimeout(playNote, 15000)
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

        playPulse(60, [1, 0, 1, 0, 1, 0, 1, 0], 0.12) // Reduced
        playPulse(864, [0, 0, 1, 0, 0, 1, 0, 1], 0.02) // Reduced
    }

    stopGameMusic() {
        this.gameMusicSource.forEach(s => s.stop())
        this.gameMusicSource = []
        this.gameMusicGains = []
    }

    // --- Radar Sound ---
    playRadarPing() {
        const ctx = this.getContext()
        this.resume()

        if (this.radarBuffer) {
            const source = ctx.createBufferSource()
            source.buffer = this.radarBuffer
            const gain = ctx.createGain()
            gain.gain.setValueAtTime(0.12, ctx.currentTime)
            source.connect(gain)
            gain.connect(this.masterGain!)
            source.start()
        } else {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'triangle'
            osc.frequency.setValueAtTime(1200, ctx.currentTime)
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.2)
            gain.gain.setValueAtTime(0.04, ctx.currentTime)
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
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
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
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
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
        g.gain.setValueAtTime(0.15, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
        osc.connect(g)
        g.connect(this.masterGain!)
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
    }
}

export const soundManager = typeof window !== 'undefined' ? new SoundManager() : ({} as SoundManager)
