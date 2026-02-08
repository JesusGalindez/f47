export type WeaponLevel = 1 | 2 | 3 | 4 | 5 | 6

export type WeaponName = 'single' | 'double' | 'triple' | 'spread' | 'laser' | 'missiles'

export const WEAPON_NAMES: Record<WeaponLevel, WeaponName> = {
  1: 'single',
  2: 'double',
  3: 'triple',
  4: 'spread',
  5: 'laser',
  6: 'missiles',
}

export type PowerUpType = 'weapon' | 'shield' | 'speed' | 'nuke' | 'life' | 'xp'

export type EnemyType = 'grunt' | 'fast' | 'tank' | 'kamikaze' | 'sniper' | 'boss'

export type GamePhase = 'menu' | 'playing' | 'paused' | 'gameover' | 'victory' | 'boss-warning'

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface Bullet {
  id: string
  position: Vec3
  velocity: Vec3
  damage: number
  isPlayerBullet: boolean
  size: number
  color: string
  type: 'normal' | 'laser' | 'missile'
}

export interface Enemy {
  id: string
  type: EnemyType
  position: Vec3
  velocity: Vec3
  hp: number
  maxHp: number
  points: number
  xp: number
  shootTimer: number
  shootInterval: number
  size: number
  pattern: 'straight' | 'sine' | 'zigzag' | 'circle' | 'dive'
  patternPhase: number
  dropChance: number
}

export interface PowerUp {
  id: string
  type: PowerUpType
  position: Vec3
  velocity: Vec3
  size: number
}

export interface Explosion {
  id: string
  position: Vec3
  scale: number
  maxScale: number
  opacity: number
  color: string
}

export interface Drone {
  id: string
  offset: Vec3
  shootTimer: number
}

export interface PlayerState {
  position: Vec3
  speed: number
  baseSpeed: number
  weaponLevel: WeaponLevel
  shieldHp: number
  maxShield: number
  lives: number
  invincibleTimer: number
  shootCooldown: number
  drones: Drone[]
}

export interface WaveConfig {
  enemies: { type: EnemyType; count: number; pattern: Enemy['pattern']; delay: number }[]
  isBoss: boolean
}

export interface LeaderboardEntry {
  name: string
  score: number
  level: number
  wave: number
  date: string
}

export const ENEMY_CONFIGS: Record<
  EnemyType,
  {
    hp: number
    points: number
    xp: number
    speed: number
    size: number
    shootInterval: number
    dropChance: number
    color: string
  }
> = {
  grunt: {
    hp: 1,
    points: 100,
    xp: 10,
    speed: 2,
    size: 0.4,
    shootInterval: 3,
    dropChance: 0.1,
    color: '#ff4444',
  },
  fast: {
    hp: 1,
    points: 150,
    xp: 15,
    speed: 4.5,
    size: 0.3,
    shootInterval: 2.5,
    dropChance: 0.08,
    color: '#ffaa00',
  },
  tank: {
    hp: 5,
    points: 300,
    xp: 40,
    speed: 1,
    size: 0.7,
    shootInterval: 2,
    dropChance: 0.25,
    color: '#aa44ff',
  },
  kamikaze: {
    hp: 1,
    points: 200,
    xp: 20,
    speed: 5,
    size: 0.35,
    shootInterval: 99,
    dropChance: 0.15,
    color: '#ff0066',
  },
  sniper: {
    hp: 2,
    points: 250,
    xp: 30,
    speed: 1.5,
    size: 0.4,
    shootInterval: 1.5,
    dropChance: 0.12,
    color: '#00ffaa',
  },
  boss: {
    hp: 50,
    points: 5000,
    xp: 500,
    speed: 0.8,
    size: 1.5,
    shootInterval: 0.5,
    dropChance: 1,
    color: '#ff0000',
  },
}

export const WEAPON_CONFIGS: Record<
  WeaponLevel,
  {
    cooldown: number
    damage: number
    bulletSpeed: number
    bulletCount: number
    spread: number
    color: string
  }
> = {
  1: { cooldown: 0.25, damage: 1, bulletSpeed: 15, bulletCount: 1, spread: 0, color: '#00f0ff' },
  2: { cooldown: 0.22, damage: 1, bulletSpeed: 16, bulletCount: 2, spread: 0.3, color: '#00f0ff' },
  3: { cooldown: 0.2, damage: 1, bulletSpeed: 17, bulletCount: 3, spread: 0.3, color: '#00ffaa' },
  4: { cooldown: 0.18, damage: 1, bulletSpeed: 18, bulletCount: 5, spread: 0.6, color: '#00ffaa' },
  5: { cooldown: 0.08, damage: 2, bulletSpeed: 25, bulletCount: 1, spread: 0, color: '#ff6a00' },
  6: { cooldown: 0.35, damage: 5, bulletSpeed: 12, bulletCount: 2, spread: 0.4, color: '#ff2040' },
}

export const XP_PER_LEVEL = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500]
