// Сравнение персонажа с топ-игроками класса: где вы на уровне, где отстаёте сильнее всего.
// Источник — gamedata/top.ts (что реально носят тысячи топ-игроков); это ориентир, а не гайд.

import { TOP_SLOT_RU, type TopData } from '../gamedata/top'
import type { Character } from '../types'
import type { BuildReport } from './build'
import { t, tn } from '../i18n'
import { term } from '../names'

/** ok — на уровне топа; warn — немного ниже; bad — заметно ниже. */
export type TopTone = 'ok' | 'warn' | 'bad'

export interface TopSkillRow {
  skill: number
  share: number
  avgLevel: number
  level: number
  learned: boolean
  /** Ваш уровень минус средний у топа. */
  diff: number
  tone: TopTone
}

export interface TopStigmaRow {
  skill: number
  share: number
  avgLevel: number
  equipped: boolean
  level: number
}

export interface TopEnchantRow {
  ru: string
  slots: number[]
  avg: number
  most: number
  mostShare: number
  /** Средняя заточка ваших вещей в этих слотах; null — слот пуст. */
  yours: number | null
  diff: number
  tone: TopTone
}

export interface TopArcanaRow {
  slot: number
  /** Самая частая карта у топа (вариант и доля). */
  top: { variant: 'vigor' | 'magic' | null; share: number; avgEnchant: number } | null
  yourVariant: 'vigor' | 'magic' | null
  yourEnchant: number | null
  same: boolean
}

export interface TopBoardRow {
  name: string
  /** Сколько узлов берёт большинство топ-игроков. */
  picked: number
  total: number
  yours: number
}

export interface TopGap {
  id: string
  text: string
  /** Насколько велико отставание — для сортировки (чем больше, тем важнее). */
  weight: number
  skill?: number
  link: string
}

export interface TopComparison {
  top: TopData
  cp: { value: number; percentile: number; median: number; top10: number }
  skills: TopSkillRow[]
  stigmas: TopStigmaRow[]
  enchant: TopEnchantRow[]
  arcana: TopArcanaRow[]
  boards: TopBoardRow[]
  gaps: TopGap[]
}

/** Доля топ-игроков с боевой мощью ниже вашей, 0…100 (внутри корзины — линейно). */
export function cpPercentile(cp: number, buckets: TopData['cpBuckets']): number {
  const total = buckets.reduce((s, b) => s + b.count, 0)
  if (!total) return 0
  let below = 0
  for (const b of buckets) {
    if (cp >= b.to + 1) below += b.count
    else if (cp >= b.from) below += (b.count * (cp - b.from)) / (b.to + 1 - b.from)
  }
  return Math.round((below / total) * 1000) / 10
}

/** «1 узел», «2 узла», «5 узлов». */
const nodes = (n: number) => tn(n, '{n} узел|{n} узла|{n} узлов')

const toneOfDiff = (diff: number, softness = 1): TopTone => (diff >= -0.5 * softness ? 'ok' : diff >= -2 * softness ? 'warn' : 'bad')

export function compareWithTop(char: Character, report: BuildReport, top: TopData): TopComparison {
  const own = new Map(char.skills.map((s) => [s.skill, s]))

  const skills: TopSkillRow[] = top.skills.map((t) => {
    const s = own.get(t.skill)
    const level = s?.level ?? 0
    const diff = Math.round((level - t.avgLevel) * 10) / 10
    return { skill: t.skill, share: t.share, avgLevel: t.avgLevel, level, learned: level > 0, diff, tone: level > 0 ? toneOfDiff(diff) : 'bad' }
  })

  const stigmas: TopStigmaRow[] = top.stigmas.map((t) => {
    const s = own.get(t.skill)
    return { skill: t.skill, share: t.share, avgLevel: t.avgLevel, equipped: !!s?.equipped && (s?.level ?? 0) > 0, level: s?.level ?? 0 }
  })

  const gearBySlot = new Map(char.gear.map((g) => [g.slot, g]))
  const enchant: TopEnchantRow[] = top.enchant.map((e) => {
    const items = e.slots.map((sl) => gearBySlot.get(sl)).filter((g): g is NonNullable<typeof g> => !!g)
    const yours = items.length ? Math.round((items.reduce((s, g) => s + g.enchant, 0) / items.length) * 10) / 10 : null
    const diff = yours === null ? -e.avg : Math.round((yours - e.avg) * 10) / 10
    return {
      ru: TOP_SLOT_RU[e.label] ?? e.label,
      slots: e.slots,
      avg: e.avg,
      most: e.most,
      mostShare: e.mostShare,
      yours,
      diff,
      tone: yours === null ? 'bad' : toneOfDiff(diff, 1.5)
    }
  })

  const arcana: TopArcanaRow[] = top.arcana.map((a) => {
    const best = [...a.cards].sort((x, y) => y.share - x.share)[0]
    const card = report.arcana.cards.find((c) => c.slot === a.slot)
    const yourVariant = card?.info?.variant ?? null
    return {
      slot: a.slot,
      top: best ? { variant: best.variant, share: best.share, avgEnchant: best.avgEnchant } : null,
      yourVariant,
      yourEnchant: card?.item ? card.enchant : null,
      same: !!best && best.variant === yourVariant
    }
  })

  const boards: TopBoardRow[] = top.boards.map((b) => {
    const mine = report.daevanion.boards.find((r) => r.board.en === b.name)
    return { name: mine ? term(mine.board) : b.name, picked: b.picked, total: b.total, yours: mine?.takenCount ?? 0 }
  })

  // Где отставание больше всего — коротким списком.
  const gaps: TopGap[] = []
  for (const s of skills) {
    if (s.share < 80) continue
    if (!s.learned)
      gaps.push({
        id: `skill-${s.skill}`,
        text: t('не изучено (у {share}% топа, ср. ур. {avgLevel})', { share: s.share, avgLevel: s.avgLevel }),
        weight: s.avgLevel,
        skill: s.skill,
        link: '/skills'
      })
    else if (s.diff <= -2)
      gaps.push({
        id: `skill-${s.skill}`,
        text: t('ур. {level}, у топа в среднем {avgLevel}', { level: s.level, avgLevel: s.avgLevel }),
        weight: -s.diff,
        skill: s.skill,
        link: '/skills'
      })
  }
  for (const s of stigmas) {
    if (s.share >= 75 && !s.equipped)
      gaps.push({
        id: `stigma-${s.skill}`,
        text: t('стигма не надета — у {share}% топа', { share: s.share }),
        weight: s.share / 20,
        skill: s.skill,
        link: '/skills'
      })
  }
  for (const e of enchant) {
    if (e.tone === 'bad')
      gaps.push({
        id: `enchant-${e.ru}`,
        text: t('{e}: заточка {p}, у топа в среднем +{avg}', { e: e.ru, p: e.yours === null ? t('нет вещи') : `+${e.yours}`, avg: e.avg }),
        weight: -e.diff,
        link: '/gear'
      })
  }
  for (const b of boards) {
    const behind = b.picked - b.yours
    if (behind >= 8)
      gaps.push({
        id: `board-${b.name}`,
        text: t('Даэванион «{b}»: {nodes}, у большинства топа {picked}', { b: b.name, nodes: nodes(b.yours), picked: b.picked }),
        weight: behind / 4,
        link: '/daevanion'
      })
  }
  gaps.sort((a, b) => b.weight - a.weight)

  return {
    top,
    cp: { value: char.combatPower, percentile: cpPercentile(char.combatPower, top.cpBuckets), median: top.medianCp, top10: top.top10Cp },
    skills,
    stigmas,
    enchant,
    arcana,
    boards,
    gaps
  }
}
