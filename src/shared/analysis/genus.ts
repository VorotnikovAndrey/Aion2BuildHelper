// Знание о видах: каждая ячейка — случайный стат; сверяем с приоритетами гайда.
// Пределы значений и какие статы бывают в ячейке — из таблицы клиента (gamedata/genus-ranges.json).

import { GENUSES, genusDef, genusLockFrom, genusOptions, genusRange, genusSlotRolls, genusStatChance, type GenusDef } from '../gamedata/genus'
import type { Guide } from '../guide/types'
import type { Character, GenusEffect } from '../types'
import { SWAP_GAIN } from './gear'
import { guideWeights, isUseful, verdictOf, type Verdict } from './weights'

/** Шанс за анализ, ниже которого стат не советуем, если есть другой подходящий, %. */
const MIN_TARGET_CHANCE = 1

export interface GenusTarget {
  stat: number
  weight: number
  /** Шанс поймать за один анализ на текущем уровне рода, %. null — таблицы для ячейки нет. */
  chance: number | null
  /** Тот же шанс на ур. 10 рода (высшие грейды выпадают чаще), %. */
  chanceAt10: number | null
  /** Сколько этот стат даёт в ячейке в лучшем случае. */
  max: number | null
  /** true — стат точно бывает в этой ячейке (по таблице); false — догадка: лучший стат из встречающихся в роде. */
  inSlot: boolean
}

export interface GenusSlotReport extends GenusEffect {
  weight: number
  verdict: Verdict
  /** Ячейку ещё не анализировали — стата нет. */
  empty: boolean
  /** Пределы стата для грейда ячейки. */
  range: { min: number; max: number } | null
  /** Где значение в пределах грейда: 0 — минимум, 1 — максимум. */
  quality: number | null
  /** С какого значения — верх диапазона, можно запирать (оценка помощника). */
  lockFrom: number | null
  /** Сколько этот стат даёт в этой ячейке в лучшем случае (высший грейд). */
  slotMax: number | null
  /** На что перебросить: лучший по гайду стат, который бывает в этой ячейке, если он важнее на 2 и больше. */
  target: GenusTarget | null
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
  const priority = w.topStats('genus').map((s) => s.stat)
  const rank = (stat: number) => (priority.includes(stat) ? priority.indexOf(stat) : priority.length)
  const order = (k: string) => GENUSES.findIndex((g) => g.key === k)

  /**
   * Лучший по гайду стат, который бывает в ячейке; при равной важности — тот, что выпадает чаще, затем — что выше в гайде.
   * Стат с шансом меньше 1% за анализ (только высшие грейды на низком уровне рода) советуем, лишь когда других нет.
   */
  function slotTarget(genus: string, slot: number, level: number, weight: number): GenusTarget | null {
    const rolls = genusSlotRolls(genus, slot)
    if (!rolls.length) {
      return best && best.weight >= weight + SWAP_GAIN
        ? { stat: best.stat, weight: best.weight, chance: null, chanceAt10: null, max: null, inSlot: false }
        : null
    }
    const better = [...new Set(rolls.map((r) => r.stat))]
      .map((stat) => ({
        stat,
        weight: w.stat('genus', stat),
        chance: genusStatChance(genus, slot, level, stat),
        chanceAt10: genusStatChance(genus, slot, 10, stat),
        max: Math.max(...rolls.filter((r) => r.stat === stat).map((r) => r.max))
      }))
      .filter((c) => c.weight >= weight + SWAP_GAIN)
    const realistic = better.filter((c) => c.chance >= MIN_TARGET_CHANCE)
    const top = (realistic.length ? realistic : better).sort((a, b) => b.weight - a.weight || b.chance - a.chance || rank(a.stat) - rank(b.stat))[0]
    return top ? { ...top, inSlot: true } : null
  }

  const genuses = [...char.genus]
    .sort((a, b) => order(a.genus) - order(b.genus))
    .map((g) => {
      const slots = g.effects.map((e): GenusSlotReport => {
        const empty = !e.stat
        const weight = empty ? 0 : w.stat('genus', e.stat)
        const r = empty ? undefined : genusRange(g.genus, e.slot, e.grade, e.stat)
        const inSlot = empty ? [] : genusSlotRolls(g.genus, e.slot).filter((x) => x.stat === e.stat)
        return {
          ...e,
          weight,
          verdict: verdictOf(weight),
          empty,
          range: r ? { min: r.min, max: r.max } : null,
          quality: r ? (r.max > r.min ? Math.min(1, Math.max(0, (e.value - r.min) / (r.max - r.min))) : 1) : null,
          lockFrom: r ? genusLockFrom(r) : null,
          slotMax: inSlot.length ? Math.max(...inSlot.map((x) => x.max)) : null,
          target: slotTarget(g.genus, e.slot, g.level, weight)
        }
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
