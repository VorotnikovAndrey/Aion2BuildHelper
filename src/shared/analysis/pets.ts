// Питомцы: коллекция и уровни. Уровень питомца — 1…3; от коллекции растёт Знание о видах.

import type { Character } from '../types'

export const PET_MAX_LEVEL = 3

export interface PetsReport {
  owned: number
  byLevel: Record<number, number>
  maxed: number
  /** Сколько уровней ещё можно поднять у уже собранных питомцев. */
  levelsLeft: number
  /** 0…100: доля набранных уровней. */
  progress: number
}

export function analyzePets(char: Character): PetsReport {
  const byLevel: Record<number, number> = { 1: 0, 2: 0, 3: 0 }
  for (const p of char.pets) byLevel[p.level] = (byLevel[p.level] ?? 0) + 1
  const owned = char.pets.length
  const levels = char.pets.reduce((s, p) => s + Math.min(p.level, PET_MAX_LEVEL), 0)
  return {
    owned,
    byLevel,
    maxed: byLevel[PET_MAX_LEVEL] ?? 0,
    levelsLeft: owned * PET_MAX_LEVEL - levels,
    progress: owned ? Math.round((levels / (owned * PET_MAX_LEVEL)) * 100) : 0
  }
}
