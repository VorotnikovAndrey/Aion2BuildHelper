// Знание о видах: каждая ячейка — случайный стат; сверяем с приоритетами гайда.

import { GENUSES, genusDef, genusOptions, type GenusDef } from '../gamedata/genus'
import type { Guide } from '../guide/types'
import type { Character, GenusEffect } from '../types'
import { SWAP_GAIN } from './gear'
import { guideWeights, isUseful, verdictOf, type Verdict } from './weights'

export interface GenusSlotReport extends GenusEffect {
  weight: number
  verdict: Verdict
  /** На что перебросить: лучший по гайду стат рода, если он важнее на 2 и больше. */
  target: { stat: number; weight: number } | null
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
  const options = genusOptions([char])
  const wishlist = w
    .topStats('genus')
    .filter((s) => s.weight >= 4 && options.has(s.stat))
    .slice(0, 6)
  const best = wishlist[0]
  const order = (k: string) => GENUSES.findIndex((g) => g.key === k)
  const genuses = [...char.genus]
    .sort((a, b) => order(a.genus) - order(b.genus))
    .map((g) => {
      const slots = g.effects.map((e) => {
        const weight = w.stat('genus', e.stat)
        const target = best && e.stat !== best.stat && best.weight >= weight + SWAP_GAIN ? { stat: best.stat, weight: best.weight } : null
        return { ...e, weight, verdict: verdictOf(weight), target }
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
  const total = genuses.reduce((s, g) => s + g.slots.length, 0)
  const score = total ? Math.round(genuses.reduce((s, g) => s + g.score * g.slots.length, 0) / total) : 0
  return { genuses, wishlist, score }
}
