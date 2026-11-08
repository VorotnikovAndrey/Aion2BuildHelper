// Знание о видах: каждая ячейка — случайный стат; сверяем с приоритетами гайда.

import { GENUSES, genusDef, genusOptions, type GenusDef } from '../gamedata/genus'
import type { Guide } from '../guide/types'
import type { Character, GenusEffect } from '../types'
import { guideWeights, isUseful, verdictOf, type Verdict } from './weights'

export interface GenusSlotReport extends GenusEffect {
  weight: number
  verdict: Verdict
}

export interface GenusReport {
  def: GenusDef
  level: number
  slots: GenusSlotReport[]
  useful: number
  /** Ячейки, которые стоит перебросить. */
  reroll: GenusSlotReport[]
  /** 0…100 */
  score: number
}

export function analyzeGenus(char: Character, guide: Guide | null): { genuses: GenusReport[]; wishlist: { stat: number; weight: number }[]; score: number } {
  const w = guideWeights(guide)
  const order = (k: string) => GENUSES.findIndex((g) => g.key === k)
  const genuses = [...char.genus]
    .sort((a, b) => order(a.genus) - order(b.genus))
    .map((g) => {
      const slots = g.effects.map((e) => {
        const weight = w.stat('genus', e.stat)
        return { ...e, weight, verdict: verdictOf(weight) }
      })
      const useful = slots.filter((s) => isUseful(s.verdict)).length
      const score = slots.length ? Math.round((slots.reduce((s, x) => s + x.weight, 0) / (slots.length * 5)) * 100) : 0
      return {
        def: genusDef(g.genus),
        level: g.level,
        slots,
        useful,
        reroll: slots.filter((s) => s.weight <= 1),
        score
      }
    })
  const options = genusOptions([char])
  const wishlist = w
    .topStats('genus')
    .filter((s) => s.weight >= 4 && options.has(s.stat))
    .slice(0, 6)
  const total = genuses.reduce((s, g) => s + g.slots.length, 0)
  const score = total ? Math.round(genuses.reduce((s, g) => s + g.score * g.slots.length, 0) / total) : 0
  return { genuses, wishlist, score }
}
