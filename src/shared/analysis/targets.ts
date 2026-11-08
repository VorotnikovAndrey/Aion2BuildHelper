// Пороги статов (меткость, крит) и приоритеты камней с учётом текущих цифр персонажа.
// Камень маны или духовный камень даёт небольшой стат, поэтому важно, куда его направить:
// пока меткость ниже порога контента — в меткость, иначе — в то, что ценит гайд.

import type { Guide, StatTarget } from '../guide/types'
import type { Character } from '../types'
import { guideWeights } from './weights'

export interface TargetStatus {
  target: StatTarget
  current: number
  /** Ближайший невзятый порог; null — все взяты. */
  next: { value: number; label: string } | null
  /** Последний взятый порог. */
  reached: { value: number; label: string } | null
}

export function statTargetStatus(char: Character, guide: Guide | null): TargetStatus[] {
  const values = new Map(char.stats.map((s) => [s.stat, s.value]))
  return (guide?.statTargets ?? []).map((target) => {
    const current = target.stats.reduce((sum, id) => sum + (values.get(id) ?? 0), 0)
    const next = target.goals.find((g) => current < g.value) ?? null
    const reached = [...target.goals].reverse().find((g) => current >= g.value) ?? null
    return { target, current, next, reached }
  })
}

export interface StoneWeight {
  weight: number
  /** Почему вес изменён относительно гайда (порог не взят или уже взят). */
  reason?: string
  /** Насколько далеко до порога: 0…1, меньше — нужнее. Для сортировки равных по весу. */
  progress?: number
}

/**
 * Вес стата для камней с учётом порогов: пока ближайший порог не взят, статы из `raise` — 5;
 * все пороги взяты — не выше 2 (сверх порога почти не нужно). Остальные — как в гайде.
 */
export function stoneWeightFn(guide: Guide | null, statuses: TargetStatus[]): (stat: number) => StoneWeight {
  const w = guideWeights(guide)
  return (stat) => {
    const base = w.stat('manastone', stat)
    for (const t of statuses) {
      if (!t.target.raise?.includes(stat)) continue
      if (t.next) {
        return {
          weight: 5,
          reason: `${t.target.name}: ${t.current} из ${t.next.value} (${t.next.label})`,
          progress: t.current / t.next.value
        }
      }
      return { weight: Math.min(base, 2), reason: `${t.target.name}: ${t.current} — порог «${t.reached?.label}» уже взят, сверх него почти не нужно` }
    }
    return { weight: base }
  }
}
