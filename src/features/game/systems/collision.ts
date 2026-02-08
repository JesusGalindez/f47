import type { Vec3 } from '../types/game'

export function distance(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export function checkCollision(posA: Vec3, sizeA: number, posB: Vec3, sizeB: number): boolean {
  return distance(posA, posB) < sizeA + sizeB
}

export function isOutOfBounds(pos: Vec3, margin = 2): boolean {
  return pos.x < -12 - margin || pos.x > 12 + margin || pos.z < -18 - margin || pos.z > 18 + margin
}
