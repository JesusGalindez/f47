import type { WaveConfig, EnemyType } from '../types/game'

function wave(enemies: WaveConfig['enemies'], isBoss = false): WaveConfig {
  return { enemies, isBoss }
}

function e(
  type: EnemyType,
  count: number,
  pattern: 'straight' | 'sine' | 'zigzag' | 'circle' | 'dive' = 'straight',
  delay = 0
) {
  return { type, count, pattern, delay }
}

export const LEVEL_WAVES: WaveConfig[][] = [
  // Level 1 — Introduction
  [
    wave([e('grunt', 5, 'straight')]),
    wave([e('grunt', 7, 'sine')]),
    wave([e('grunt', 5, 'straight'), e('fast', 3, 'zigzag', 1)]),
    wave([e('grunt', 8, 'sine'), e('fast', 4, 'straight', 0.5)]),
    wave([e('boss', 1, 'sine')], true),
  ],
  // Level 2 — Escalation
  [
    wave([e('grunt', 8, 'sine'), e('fast', 5, 'zigzag')]),
    wave([e('tank', 2, 'straight'), e('grunt', 6, 'sine')]),
    wave([e('fast', 8, 'zigzag'), e('kamikaze', 3, 'dive', 1)]),
    wave([e('sniper', 4, 'straight'), e('grunt', 6, 'sine'), e('fast', 4, 'zigzag')]),
    wave([e('boss', 1, 'circle')], true),
  ],
  // Level 3 — Chaos
  [
    wave([e('tank', 3, 'straight'), e('sniper', 5, 'sine')]),
    wave([e('kamikaze', 6, 'dive'), e('fast', 6, 'zigzag')]),
    wave([e('grunt', 10, 'sine'), e('tank', 3, 'straight'), e('sniper', 3, 'sine')]),
    wave([e('kamikaze', 8, 'dive'), e('sniper', 4, 'straight'), e('fast', 6, 'zigzag')]),
    wave([e('boss', 1, 'zigzag')], true),
  ],
  // Level 4 — Gauntlet
  [
    wave([e('tank', 5, 'sine'), e('sniper', 6, 'straight')]),
    wave([e('kamikaze', 10, 'dive'), e('fast', 8, 'zigzag')]),
    wave([e('tank', 4, 'straight'), e('sniper', 5, 'sine'), e('kamikaze', 5, 'dive')]),
    wave([
      e('grunt', 12, 'sine'),
      e('tank', 4, 'zigzag'),
      e('sniper', 4, 'straight'),
      e('fast', 6, 'dive'),
    ]),
    wave([e('boss', 1, 'circle')], true),
  ],
  // Level 5 — Final Stand
  [
    wave([e('tank', 6, 'zigzag'), e('sniper', 6, 'sine'), e('kamikaze', 6, 'dive')]),
    wave([e('fast', 12, 'zigzag'), e('kamikaze', 8, 'dive'), e('sniper', 5, 'straight')]),
    wave([
      e('tank', 5, 'sine'),
      e('grunt', 12, 'zigzag'),
      e('sniper', 6, 'straight'),
      e('kamikaze', 8, 'dive'),
    ]),
    wave([
      e('tank', 6, 'circle'),
      e('sniper', 8, 'sine'),
      e('kamikaze', 10, 'dive'),
      e('fast', 10, 'zigzag'),
    ]),
    wave([e('boss', 1, 'dive')], true),
  ],
]

export function generateInfiniteWave(waveNumber: number): WaveConfig {
  const difficulty = Math.floor(waveNumber / 5)
  const isBoss = waveNumber % 5 === 0

  if (isBoss) {
    return wave(
      [
        {
          type: 'boss' as EnemyType,
          count: 1,
          pattern: (['sine', 'circle', 'zigzag', 'dive'] as const)[difficulty % 4],
          delay: 0,
        },
      ],
      true
    )
  }

  const types: EnemyType[] = ['grunt', 'fast', 'tank', 'kamikaze', 'sniper']
  const patterns: Array<'straight' | 'sine' | 'zigzag' | 'dive'> = [
    'straight',
    'sine',
    'zigzag',
    'dive',
  ]
  const enemyCount = 6 + difficulty * 2
  const typeCount = Math.min(2 + Math.floor(difficulty / 2), 4)

  const enemies: WaveConfig['enemies'] = []
  for (let i = 0; i < typeCount; i++) {
    enemies.push({
      type: types[(waveNumber + i) % types.length],
      count: Math.ceil(enemyCount / typeCount),
      pattern: patterns[(waveNumber + i) % patterns.length],
      delay: i * 0.5,
    })
  }

  return wave(enemies)
}
