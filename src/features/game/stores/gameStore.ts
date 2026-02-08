import { create } from 'zustand'
import type {
  GamePhase,
  Bullet,
  Enemy,
  PowerUp,
  Explosion,
  PlayerState,
  Drone,
  WeaponLevel,
  PowerUpType,
  EnemyType,
  Vec3,
  WaveConfig,
} from '../types/game'
import { ENEMY_CONFIGS, WEAPON_CONFIGS, WEAPON_NAMES, XP_PER_LEVEL } from '../types/game'
import { LEVEL_WAVES, generateInfiniteWave } from '../systems/waves'
import { checkCollision, isOutOfBounds } from '../systems/collision'

let nextId = 0
const uid = () => `${nextId++}`

interface GameState {
  phase: GamePhase
  score: number
  highScore: number
  combo: number
  comboTimer: number
  level: number
  wave: number
  waveEnemiesRemaining: number
  waveSpawnQueue: { type: EnemyType; pattern: Enemy['pattern']; delay: number }[]
  waveSpawnTimer: number
  xp: number
  xpLevel: number
  totalKills: number
  controlMode: 'keyboard' | 'mouse' | 'gyro'

  // Tilt/Gyro state
  tiltX: number
  tiltY: number

  player: PlayerState
  bullets: Bullet[]
  enemies: Enemy[]
  powerUps: PowerUp[]
  explosions: Explosion[]

  keys: Record<string, boolean>
  bossWarningTimer: number
  nukeFlashTimer: number
  screenShake: number

  touchTarget: { x: number; z: number } | null
  gyroTarget: { x: number; z: number } | null
  autoFire: boolean

  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  gameOver: () => void
  setKey: (key: string, down: boolean) => void
  update: (delta: number) => void
  getLeaderboard: () => { name: string; score: number; level: number; wave: number; date: string }[]
  saveScore: (name: string) => void
  setControlMode: (mode: 'keyboard' | 'mouse' | 'gyro') => void
  setTilt: (x: number, y: number) => void
  setTouchInput: (x: number | null, z: number | null) => void
  setGyroInput: (x: number | null, z: number | null) => void
}

function createDefaultPlayer(): PlayerState {
  return {
    position: { x: 0, y: 0, z: -12 },
    speed: 8,
    baseSpeed: 8,
    weaponLevel: 1 as WeaponLevel,
    shieldHp: 0,
    maxShield: 3,
    lives: 3,
    invincibleTimer: 0,
    shootCooldown: 0,
    drones: [],
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'menu',
  score: 0,
  highScore:
    typeof window !== 'undefined' ? Number(localStorage.getItem('f47-highscore') || '0') : 0,
  combo: 0,
  comboTimer: 0,
  level: 1,
  wave: 0,
  waveEnemiesRemaining: 0,
  waveSpawnQueue: [],
  waveSpawnTimer: 0,
  xp: 0,
  xpLevel: 1,
  totalKills: 0,
  controlMode: 'keyboard',
  tiltX: 0,
  tiltY: 0,

  player: createDefaultPlayer(),
  bullets: [],
  enemies: [],
  powerUps: [],
  explosions: [],

  keys: {},
  bossWarningTimer: 0,
  nukeFlashTimer: 0,
  screenShake: 0,
  touchTarget: null,
  gyroTarget: null,
  autoFire: true,

  startGame: () => {
    nextId = 0
    set({
      phase: 'playing',
      score: 0,
      combo: 0,
      comboTimer: 0,
      level: 1,
      wave: 0,
      waveEnemiesRemaining: 0,
      waveSpawnQueue: [],
      waveSpawnTimer: 0,
      xp: 0,
      xpLevel: 1,
      totalKills: 0,
      player: createDefaultPlayer(),
      bullets: [],
      enemies: [],
      powerUps: [],
      explosions: [],
      bossWarningTimer: 0,
      nukeFlashTimer: 0,
      screenShake: 0,
    })
  },

  pauseGame: () => {
    if (get().phase === 'playing') set({ phase: 'paused' })
  },

  resumeGame: () => {
    if (get().phase === 'paused') set({ phase: 'playing' })
  },

  gameOver: () => {
    const state = get()
    if (state.score > state.highScore) {
      localStorage.setItem('f47-highscore', String(state.score))
      set({ highScore: state.score })
    }
    set({ phase: 'gameover' })
  },

  setKey: (key, down) => {
    set((s) => ({ keys: { ...s.keys, [key]: down } }))
  },

  getLeaderboard: () => {
    try {
      const data = localStorage.getItem('f47-leaderboard')
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  saveScore: (name) => {
    const state = get()
    const board = state.getLeaderboard()
    board.push({
      name,
      score: state.score,
      level: state.level,
      wave: state.wave,
      date: new Date().toISOString(),
    })
    board.sort((a: { score: number }, b: { score: number }) => b.score - a.score)
    localStorage.setItem('f47-leaderboard', JSON.stringify(board.slice(0, 10)))
  },

  setControlMode: (mode) => set({ controlMode: mode }),
  setTilt: (x, y) => set({ tiltX: x, tiltY: y }),
  setTouchInput: (x, z) =>
    set({ touchTarget: x !== null && z !== null ? { x, z } : null }),
  setGyroInput: (x, z) =>
    set({ gyroTarget: x !== null && z !== null ? { x, z } : null }),

  update: (delta) => {
    const state = get()
    if (state.phase !== 'playing') return

    const clampedDelta = Math.min(delta, 0.05)

    // --- Boss warning timer ---
    let bossWarningTimer = state.bossWarningTimer
    if (bossWarningTimer > 0) {
      bossWarningTimer -= clampedDelta
      if (bossWarningTimer <= 0) {
        bossWarningTimer = 0
      } else {
        set({ bossWarningTimer })
        return
      }
    }

    // --- Nuke flash ---
    let nukeFlashTimer = Math.max(0, state.nukeFlashTimer - clampedDelta)

    // --- Screen shake decay ---
    let screenShake = state.screenShake * 0.9
    if (screenShake < 0.01) screenShake = 0

    // --- Player movement ---
    const player = { ...state.player, position: { ...state.player.position } }
    const { keys } = state

    // Touch input (highest priority — direct position)
    if (state.touchTarget) {
      player.position.x += (state.touchTarget.x - player.position.x) * 0.2
      player.position.z += (state.touchTarget.z - player.position.z) * 0.2
    }
    // Gyro input (additive tilt)
    else if (state.gyroTarget) {
      player.position.x += (state.gyroTarget.x - player.position.x) * 0.1
      player.position.z += (state.gyroTarget.z - player.position.z) * 0.1
    }
    // Keyboard controls
    else {
      if (keys['ArrowLeft'] || keys['a']) player.position.x -= player.speed * clampedDelta
      if (keys['ArrowRight'] || keys['d']) player.position.x += player.speed * clampedDelta
      if (keys['ArrowUp'] || keys['w']) player.position.z -= player.speed * clampedDelta
      if (keys['ArrowDown'] || keys['s']) player.position.z += player.speed * clampedDelta
    }

    player.position.x = Math.max(-9.5, Math.min(9.5, player.position.x))
    player.position.z = Math.max(-14, Math.min(-5, player.position.z))

    // Invincibility timer
    if (player.invincibleTimer > 0) {
      player.invincibleTimer -= clampedDelta
    }

    // --- Shooting ---
    let newBullets: Bullet[] = [...state.bullets]
    player.shootCooldown -= clampedDelta

    const shouldFire = state.autoFire || keys[' ']
    if (shouldFire && player.shootCooldown <= 0) {
      const wc = WEAPON_CONFIGS[player.weaponLevel]
      player.shootCooldown = wc.cooldown

      // Player bullets
      const bulletType =
        player.weaponLevel >= 6 ? 'missile' : player.weaponLevel >= 5 ? 'laser' : 'normal'
      for (let i = 0; i < wc.bulletCount; i++) {
        const spreadAngle =
          wc.bulletCount > 1 ? -wc.spread / 2 + (wc.spread / (wc.bulletCount - 1)) * i : 0
        newBullets.push({
          id: uid(),
          position: { ...player.position, z: player.position.z + 0.5 },
          velocity: {
            x: Math.sin(spreadAngle) * wc.bulletSpeed,
            y: 0,
            z: Math.cos(spreadAngle) * wc.bulletSpeed,
          },
          damage: wc.damage,
          isPlayerBullet: true,
          size: bulletType === 'laser' ? 0.08 : bulletType === 'missile' ? 0.2 : 0.1,
          color: wc.color,
          type: bulletType,
        })
      }

      // Drone bullets
      player.drones.forEach((drone) => {
        const dronePos = {
          x: player.position.x + drone.offset.x,
          y: player.position.y + drone.offset.y,
          z: player.position.z + drone.offset.z,
        }
        newBullets.push({
          id: uid(),
          position: { ...dronePos },
          velocity: { x: 0, y: 0, z: 12 },
          damage: 1,
          isPlayerBullet: true,
          size: 0.08,
          color: '#00f0ff',
          type: 'normal',
        })
      })
    }

    // --- Wave spawning ---
    let { wave, level, waveEnemiesRemaining, waveSpawnQueue, waveSpawnTimer } = state
    let newEnemies = [...state.enemies]

    // Spawn from queue
    if (waveSpawnQueue.length > 0) {
      waveSpawnTimer -= clampedDelta
      if (waveSpawnTimer <= 0) {
        const next = waveSpawnQueue[0]
        const cfg = ENEMY_CONFIGS[next.type]
        const levelMultiplier = 1 + (level - 1) * 0.3

        newEnemies.push({
          id: uid(),
          type: next.type,
          position: { x: (Math.random() - 0.5) * 16, y: 0, z: 16 },
          velocity: { x: 0, y: 0, z: -cfg.speed * levelMultiplier },
          hp: Math.ceil(cfg.hp * levelMultiplier),
          maxHp: Math.ceil(cfg.hp * levelMultiplier),
          points: Math.ceil(cfg.points * levelMultiplier),
          xp: Math.ceil(cfg.xp * levelMultiplier),
          shootTimer: cfg.shootInterval * (0.5 + Math.random() * 0.5),
          shootInterval: cfg.shootInterval / levelMultiplier,
          size: cfg.size,
          pattern: next.pattern,
          patternPhase: Math.random() * Math.PI * 2,
          dropChance: cfg.dropChance,
        })

        waveSpawnQueue = waveSpawnQueue.slice(1)
        waveSpawnTimer = 0.3
      }
    }

    // Check if wave is clear
    if (waveSpawnQueue.length === 0 && newEnemies.length === 0 && waveEnemiesRemaining <= 0) {
      wave++
      let waveConfig: WaveConfig

      if (level <= LEVEL_WAVES.length) {
        const levelWaves = LEVEL_WAVES[level - 1]
        if (wave > levelWaves.length) {
          level++
          wave = 1
          if (level > LEVEL_WAVES.length) {
            waveConfig = generateInfiniteWave(wave)
          } else {
            waveConfig = LEVEL_WAVES[level - 1][0]
          }
        } else {
          waveConfig = levelWaves[wave - 1]
        }
      } else {
        waveConfig = generateInfiniteWave(wave)
      }

      // Boss warning
      if (waveConfig.isBoss) {
        bossWarningTimer = 2.0
      }

      const queue: typeof waveSpawnQueue = []
      waveConfig.enemies.forEach((group) => {
        for (let i = 0; i < group.count; i++) {
          queue.push({ type: group.type, pattern: group.pattern, delay: group.delay })
        }
      })
      waveSpawnQueue = queue
      waveEnemiesRemaining = queue.length
      waveSpawnTimer = 0.5
    }

    // --- Update enemies ---
    let newExplosions = [...state.explosions]
    let { score, combo, comboTimer, xp, xpLevel, totalKills } = state

    // Combo timer
    comboTimer -= clampedDelta
    if (comboTimer <= 0) {
      combo = 0
      comboTimer = 0
    }

    newEnemies = newEnemies.map((enemy) => {
      const e = { ...enemy, position: { ...enemy.position } }

      // Movement patterns
      e.patternPhase += clampedDelta * 2
      const baseVelZ = e.velocity.z

      switch (e.pattern) {
        case 'sine':
          e.position.x += Math.sin(e.patternPhase) * 3 * clampedDelta
          e.position.z += baseVelZ * clampedDelta
          break
        case 'zigzag':
          e.position.x += (Math.floor(e.patternPhase) % 2 === 0 ? 3 : -3) * clampedDelta
          e.position.z += baseVelZ * clampedDelta
          break
        case 'circle':
          e.position.x += Math.cos(e.patternPhase) * 4 * clampedDelta
          e.position.z += Math.sin(e.patternPhase) * 2 * clampedDelta
          if (e.position.z < -5) e.position.z = -5
          if (e.position.z > 12) e.position.z = 12
          break
        case 'dive': {
          const dx = player.position.x - e.position.x
          const dz = player.position.z - e.position.z
          const dist = Math.sqrt(dx * dx + dz * dz) || 1
          e.position.x += (dx / dist) * Math.abs(baseVelZ) * clampedDelta
          e.position.z += (dz / dist) * Math.abs(baseVelZ) * clampedDelta
          break
        }
        default:
          e.position.z += baseVelZ * clampedDelta
          break
      }

      // Clamp X
      e.position.x = Math.max(-11, Math.min(11, e.position.x))

      // Enemy shooting
      e.shootTimer -= clampedDelta
      if (e.shootTimer <= 0 && e.type !== 'kamikaze') {
        e.shootTimer = e.shootInterval
        const dx = player.position.x - e.position.x
        const dz = player.position.z - e.position.z
        const dist = Math.sqrt(dx * dx + dz * dz) || 1

        if (e.type === 'boss') {
          // Boss shoots a spread
          for (let i = -2; i <= 2; i++) {
            const angle = Math.atan2(dx, dz) + i * 0.25
            newBullets.push({
              id: uid(),
              position: { ...e.position },
              velocity: { x: Math.sin(angle) * 8, y: 0, z: Math.cos(angle) * 8 },
              damage: 1,
              isPlayerBullet: false,
              size: 0.12,
              color: '#ff2040',
              type: 'normal',
            })
          }
        } else {
          newBullets.push({
            id: uid(),
            position: { ...e.position },
            velocity: { x: (dx / dist) * 7, y: 0, z: (dz / dist) * 7 },
            damage: 1,
            isPlayerBullet: false,
            size: 0.1,
            color: ENEMY_CONFIGS[e.type].color,
            type: 'normal',
          })
        }
      }

      return e
    })

    // --- Update bullets ---
    newBullets = newBullets
      .map((b) => ({
        ...b,
        position: {
          x: b.position.x + b.velocity.x * clampedDelta,
          y: b.position.y + b.velocity.y * clampedDelta,
          z: b.position.z + b.velocity.z * clampedDelta,
        },
      }))
      .filter((b) => !isOutOfBounds(b.position, 3))

    // --- Collisions: player bullets vs enemies ---
    const bulletsToRemove = new Set<string>()
    const enemiesToRemove = new Set<string>()

    newBullets.forEach((bullet) => {
      if (!bullet.isPlayerBullet) return
      newEnemies.forEach((enemy) => {
        if (enemiesToRemove.has(enemy.id)) return
        if (checkCollision(bullet.position, bullet.size, enemy.position, enemy.size)) {
          bulletsToRemove.add(bullet.id)
          enemy.hp -= bullet.damage
          screenShake = Math.max(screenShake, 0.1)

          if (enemy.hp <= 0) {
            enemiesToRemove.add(enemy.id)
            combo++
            comboTimer = 2
            const comboMultiplier = 1 + Math.min(combo, 20) * 0.1
            score += Math.ceil(enemy.points * comboMultiplier)
            xp += enemy.xp
            totalKills++
            waveEnemiesRemaining = Math.max(0, waveEnemiesRemaining - 1)

            newExplosions.push({
              id: uid(),
              position: { ...enemy.position },
              scale: 0,
              maxScale: enemy.type === 'boss' ? 4 : 1.5,
              opacity: 1,
              color: enemy.type === 'boss' ? '#ff6a00' : '#00f0ff',
            })

            if (enemy.type === 'boss') {
              screenShake = 1
            }

            // Power-up drop
            if (Math.random() < enemy.dropChance) {
              const types: PowerUpType[] = ['weapon', 'shield', 'speed', 'xp', 'life', 'nuke']
              const weights = [30, 20, 15, 20, 5, 10]
              let roll = Math.random() * weights.reduce((a, b) => a + b, 0)
              let selectedType: PowerUpType = 'weapon'
              for (let i = 0; i < types.length; i++) {
                roll -= weights[i]
                if (roll <= 0) {
                  selectedType = types[i]
                  break
                }
              }

              state.powerUps.push({
                id: uid(),
                type: selectedType,
                position: { ...enemy.position },
                velocity: { x: 0, y: 0, z: -3 },
                size: 0.3,
              })
            }
          }
        }
      })
    })

    // --- Collisions: enemy bullets vs player ---
    if (player.invincibleTimer <= 0) {
      newBullets.forEach((bullet) => {
        if (bullet.isPlayerBullet) return
        if (checkCollision(bullet.position, bullet.size, player.position, 0.4)) {
          bulletsToRemove.add(bullet.id)
          if (player.shieldHp > 0) {
            player.shieldHp--
            screenShake = 0.3
          } else {
            player.lives--
            player.invincibleTimer = 2
            screenShake = 0.8
            newExplosions.push({
              id: uid(),
              position: { ...player.position },
              scale: 0,
              maxScale: 2,
              opacity: 1,
              color: '#ff6a00',
            })
            if (player.lives <= 0) {
              set({
                player,
                score,
                combo,
                comboTimer,
                xp,
                xpLevel,
                totalKills,
                bullets: [],
                enemies: [],
                powerUps: [],
                explosions: newExplosions,
                level,
                wave,
                waveEnemiesRemaining,
                waveSpawnQueue,
                waveSpawnTimer,
                bossWarningTimer,
                nukeFlashTimer,
                screenShake,
              })
              get().gameOver()
              return
            }
          }
        }
      })
    }

    // --- Collisions: enemies vs player (kamikaze etc.) ---
    if (player.invincibleTimer <= 0) {
      newEnemies.forEach((enemy) => {
        if (enemiesToRemove.has(enemy.id)) return
        if (checkCollision(enemy.position, enemy.size, player.position, 0.4)) {
          enemiesToRemove.add(enemy.id)
          waveEnemiesRemaining = Math.max(0, waveEnemiesRemaining - 1)
          newExplosions.push({
            id: uid(),
            position: { ...enemy.position },
            scale: 0,
            maxScale: 1.5,
            opacity: 1,
            color: '#ff6a00',
          })
          if (player.shieldHp > 0) {
            player.shieldHp--
            screenShake = 0.4
          } else {
            player.lives--
            player.invincibleTimer = 2
            screenShake = 0.8
            if (player.lives <= 0) {
              set({
                player,
                score,
                combo,
                comboTimer,
                xp,
                xpLevel,
                totalKills,
                bullets: [],
                enemies: [],
                powerUps: [],
                explosions: newExplosions,
                level,
                wave,
                waveEnemiesRemaining,
                waveSpawnQueue,
                waveSpawnTimer,
                bossWarningTimer,
                nukeFlashTimer,
                screenShake,
              })
              get().gameOver()
              return
            }
          }
        }
      })
    }

    // --- Power-up collection ---
    let newPowerUps = state.powerUps
      .map((p) => ({
        ...p,
        position: {
          x: p.position.x,
          y: p.position.y,
          z: p.position.z + p.velocity.z * clampedDelta,
        },
      }))
      .filter((p) => !isOutOfBounds(p.position, 3))

    const puToRemove = new Set<string>()
    newPowerUps.forEach((pu) => {
      if (checkCollision(pu.position, pu.size, player.position, 0.5)) {
        puToRemove.add(pu.id)
        switch (pu.type) {
          case 'weapon':
            if (player.weaponLevel < 6) player.weaponLevel = (player.weaponLevel + 1) as WeaponLevel
            break
          case 'shield':
            player.shieldHp = Math.min(player.shieldHp + 1, player.maxShield)
            break
          case 'speed':
            player.speed = Math.min(player.speed + 1.5, 16)
            break
          case 'nuke':
            nukeFlashTimer = 0.5
            screenShake = 1
            newEnemies.forEach((e) => {
              if (e.type !== 'boss') {
                enemiesToRemove.add(e.id)
                score += e.points
                totalKills++
                waveEnemiesRemaining = Math.max(0, waveEnemiesRemaining - 1)
                newExplosions.push({
                  id: uid(),
                  position: { ...e.position },
                  scale: 0,
                  maxScale: 1.5,
                  opacity: 1,
                  color: '#ff6a00',
                })
              } else {
                e.hp = Math.max(1, e.hp - 20)
              }
            })
            break
          case 'life':
            player.lives = Math.min(player.lives + 1, 5)
            break
          case 'xp':
            xp += 100
            break
        }
      }
    })
    newPowerUps = newPowerUps.filter((p) => !puToRemove.has(p.id))

    // --- XP leveling ---
    while (xpLevel < XP_PER_LEVEL.length && xp >= XP_PER_LEVEL[xpLevel]) {
      xpLevel++
      // Grant bonuses on level up
      if (xpLevel === 3 && player.drones.length < 1) {
        player.drones.push({ id: uid(), offset: { x: -1.2, y: 0, z: -0.5 }, shootTimer: 0 })
      }
      if (xpLevel === 6 && player.drones.length < 2) {
        player.drones.push({ id: uid(), offset: { x: 1.2, y: 0, z: -0.5 }, shootTimer: 0 })
      }
      if (xpLevel % 2 === 0) {
        player.maxShield = Math.min(player.maxShield + 1, 6)
      }
    }

    // --- Remove dead / escaped ---
    newBullets = newBullets.filter((b) => !bulletsToRemove.has(b.id))

    const escapedCount = newEnemies.reduce((acc, e) => {
      if (enemiesToRemove.has(e.id)) return acc
      return acc + (isOutOfBounds(e.position, 3) ? 1 : 0)
    }, 0)
    if (escapedCount > 0) {
      waveEnemiesRemaining = Math.max(0, waveEnemiesRemaining - escapedCount)
    }

    newEnemies = newEnemies.filter(
      (e) => !enemiesToRemove.has(e.id) && !isOutOfBounds(e.position, 3)
    )

    // --- Update explosions ---
    newExplosions = newExplosions
      .map((e) => ({
        ...e,
        scale: e.scale + (e.maxScale - e.scale) * 0.15,
        opacity: e.opacity - clampedDelta * 2,
      }))
      .filter((e) => e.opacity > 0)

    set({
      player,
      bullets: newBullets,
      enemies: newEnemies,
      powerUps: newPowerUps,
      explosions: newExplosions,
      score,
      combo,
      comboTimer,
      level,
      wave,
      waveEnemiesRemaining,
      waveSpawnQueue,
      waveSpawnTimer,
      xp,
      xpLevel,
      totalKills,
      bossWarningTimer,
      nukeFlashTimer,
      screenShake,
    })
  },
}))
