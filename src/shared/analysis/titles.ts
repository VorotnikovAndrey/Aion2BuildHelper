// Титулы: что надето, что дают собранные титулы и нет ли в коллекции титула полезнее надетого.

import type { TitleCategory } from '../gamedata/art'
import { TITLE_CATEGORIES, titleDef, TITLES, type TitleDef } from '../gamedata/titles'
import type { Guide } from '../guide/types'
import type { Character } from '../types'
import { guideWeights } from './weights'

/** Лучшее значение каждого стата среди всех титулов — чтобы сравнивать бонусы разной величины. */
const BEST = new Map<number, number>()
for (const t of TITLES) for (const [stat, value] of t.equip) BEST.set(stat, Math.max(BEST.get(stat) ?? 0, value))

export interface TitleSlotReport {
  category: TitleCategory
  ru: string
  equipped: TitleDef | null
  /** Польза надетого по гайду (оценка помощника). */
  score: number
  /** Собранный титул этой категории, который по гайду, похоже, полезнее надетого. */
  better: { title: TitleDef; score: number } | null
}

export interface TitlesReport {
  slots: TitleSlotReport[]
  owned: number
  total: number
  /** Сумма «эффектов при наличии» всех собранных титулов: ID стата → значение. */
  collection: Map<number, number>
}

/**
 * Польза титула по гайду: для каждого стата — важность в гайде (0–5), умноженная на долю от лучшего
 * значения этого стата среди всех титулов. «+3% урона в PvE» при лучших 4,5% даёт 5 × 0,67.
 * Это оценка помощника: точный вклад разных статов в урон так не посчитать.
 */
export function titleScore(t: TitleDef, weight: (stat: number) => number): number {
  return t.equip.reduce((sum, [stat, value]) => sum + weight(stat) * (value / (BEST.get(stat) || value || 1)), 0)
}

export function analyzeTitles(char: Character, guide: Guide | null): TitlesReport {
  const w = guideWeights(guide)
  const weight = (stat: number) => w.stat('arcana', stat)
  const owned = new Set(char.ownedTitles)
  const equipped = char.titles.map(titleDef).filter((t): t is TitleDef => !!t)

  const slots = TITLE_CATEGORIES.map(({ id, ru }) => {
    const on = equipped.find((t) => t.category === id) ?? null
    const score = on ? titleScore(on, weight) : 0
    let better: TitleSlotReport['better'] = null
    if (guide) {
      for (const t of TITLES) {
        if (t.category !== id || !owned.has(t.id) || t.id === on?.id) continue
        const s = titleScore(t, weight)
        // Советуем менять, только если разница заметная: больше балла и больше четверти.
        if (s >= score + 1 && s >= score * 1.25 && (!better || s > better.score)) better = { title: t, score: s }
      }
    }
    return { category: id, ru, equipped: on, score, better }
  })

  const collection = new Map<number, number>()
  for (const id of owned) {
    for (const [stat, value] of titleDef(id)?.collection ?? []) collection.set(stat, (collection.get(stat) ?? 0) + value)
  }

  return { slots, owned: owned.size, total: TITLES.length, collection }
}
