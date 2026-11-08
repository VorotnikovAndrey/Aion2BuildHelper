// Титулы: что надето, что дают собранные титулы и нет ли в коллекции титула полезнее надетого.

import type { TitleCategory } from '../gamedata/art'
import { gradeOfItem } from '../gamedata/slots'
import { TITLE_CATEGORIES, TITLE_HOW, titleDef, TITLES, type TitleDef, type TitleHow, type TitleTrack } from '../gamedata/titles'
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
  /** Собранный титул этой категории, который стоит надеть вместо текущего. */
  better: { title: TitleDef; score: number; reason: 'guide' | 'score' } | null
  /** Лучший титул категории по гайду, если его ещё нет в коллекции, — цель на будущее. */
  goal: TitleDef | null
  /** Как получить цель и сколько уже есть. */
  goalHow: (TitleHow & { progress?: { current: number; goal: number } }) | null
}

/** Сколько уже набрано по условию титула (уровень родов, питомцы, крылья, облики, заточка). */
export function trackValue(char: Character, track: TitleTrack): number {
  switch (track) {
    case 'genusMin':
      return char.genus.length ? Math.min(...char.genus.map((g) => g.level)) : 0
    case 'pets':
      return char.pets.length
    case 'wings':
      return char.wings.length
    case 'skins':
      return char.skinsOwned
    case 'uniqueEnchant':
      return Math.max(0, ...char.gear.filter((g) => g.slot < 41 && gradeOfItem(g.item) === 'unique').map((g) => g.enchant))
  }
}

function howFor(char: Character, t: TitleDef | null): TitleSlotReport['goalHow'] {
  if (!t) return null
  const how = TITLE_HOW[t.id]
  if (!how) return t.source && t.source !== '—' ? { ru: `Где взять: ${t.source}.` } : null
  return how.track && how.goal ? { ...how, progress: { current: trackValue(char, how.track), goal: how.goal } } : how
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

  const slots = TITLE_CATEGORIES.map(({ id, ru }): TitleSlotReport => {
    const on = equipped.find((t) => t.category === id) ?? null
    const score = on ? titleScore(on, weight) : 0
    const list = (guide?.titles?.[id] ?? []).map(titleDef).filter((t): t is TitleDef => !!t)

    // Гайд назвал титулы — советуем по его списку: первый собранный, который стоит выше надетого.
    if (list.length) {
      const rank = (t: TitleDef | null) => (t ? list.findIndex((x) => x.id === t.id) : -1)
      const pick = list.find((t) => owned.has(t.id)) ?? null
      const onRank = rank(on)
      const better =
        pick && pick.id !== on?.id && (onRank === -1 || rank(pick) < onRank) ? { title: pick, score: titleScore(pick, weight), reason: 'guide' as const } : null
      const top = list[0]
      const goal = !owned.has(top.id) && top.id !== on?.id ? top : null
      return { category: id, ru, equipped: on, score, better, goal, goalHow: howFor(char, goal) }
    }

    let better: TitleSlotReport['better'] = null
    if (guide) {
      for (const t of TITLES) {
        if (t.category !== id || !owned.has(t.id) || t.id === on?.id) continue
        const s = titleScore(t, weight)
        // Советуем менять, только если разница заметная: больше балла и больше четверти.
        if (s >= score + 1 && s >= score * 1.25 && (!better || s > better.score)) better = { title: t, score: s, reason: 'score' }
      }
    }
    return { category: id, ru, equipped: on, score, better, goal: null, goalHow: null }
  })

  const collection = new Map<number, number>()
  for (const id of owned) {
    for (const [stat, value] of titleDef(id)?.collection ?? []) collection.set(stat, (collection.get(stat) ?? 0) + value)
  }

  return { slots, owned: owned.size, total: TITLES.length, collection }
}
