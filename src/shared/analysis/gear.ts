// Шмот: какие строки (статы и умения) полезны по гайду, что менять, что ловить, как с манакамнями.

import { optionsForSlot, type KnownOptions } from '../gamedata/gearOptions'
import { skillDef } from '../gamedata/skills'
import { gradeOfItem, slotDef, SLOT_ORDER, type ItemGrade, type SlotGroup } from '../gamedata/slots'
import type { Guide } from '../guide/types'
import type { Character, GearItem } from '../types'
import { guideWeights, isUseful, verdictOf, type GuideWeights, type Verdict } from './weights'

export interface GearLine {
  kind: 'stat' | 'skill'
  id: number
  value: number
  weight: number
  verdict: Verdict
}

export interface ManastoneLine {
  stat: number
  grade: number
  weight: number
  verdict: Verdict
}

export interface Wish {
  kind: 'stat' | 'skill'
  id: number
  weight: number
}

export interface ItemReport {
  slot: number
  group: SlotGroup
  item: GearItem
  grade: ItemGrade
  lines: GearLine[]
  manastones: ManastoneLine[]
  useful: number
  total: number
  /** Строки, которые стоит перековать (бесполезные по гайду). */
  replace: GearLine[]
  /** Что ловить на этот слот вместо них. */
  wishlist: Wish[]
  /** 0…100 */
  score: number
  manastoneScore: number | null
}

const WISHLIST_SIZE = 4

function analyzeItem(item: GearItem, w: GuideWeights, known?: KnownOptions): ItemReport {
  const group = slotDef(item.slot).group
  const possible = optionsForSlot(known, item.slot)
  const lines: GearLine[] = [
    ...item.stats.map((s) => {
      const weight = w.stat(group, s.stat)
      return { kind: 'stat' as const, id: s.stat, value: s.value, weight, verdict: verdictOf(weight) }
    }),
    ...mergeSkills(item).map((s) => {
      const weight = w.gearSkill(s.skill)
      return { kind: 'skill' as const, id: s.skill, value: s.level, weight, verdict: verdictOf(weight) }
    })
  ]
  const manastones = item.manastones.map((m) => {
    const weight = w.stat('manastone', m.stat)
    return { stat: m.stat, grade: m.grade, weight, verdict: verdictOf(weight) }
  })
  const present = new Set(lines.map((l) => `${l.kind}:${l.id}`))
  const hasSkills = item.skills.length > 0
  // Вещь без случайных строк (браслеты, пояс…) и без известных опций слота — ловить на ней нечего.
  const canRoll = item.stats.length > 0 || item.skills.length > 0 || !!possible
  const wishlist: Wish[] = (canRoll ? w.topStats(group) : [])
    .filter((s) => s.weight >= 3 && !present.has(`stat:${s.stat}`) && (!possible || possible.has(s.stat)))
    .slice(0, WISHLIST_SIZE)
    .map((s) => ({ kind: 'stat' as const, id: s.stat, weight: s.weight }))
  // Умения ловим только там, где умения в принципе бывают (на вещи уже есть строка-умение).
  // Активные умения выпадают на оружии, гарде и кольцах, пассивные — на броне и остальных украшениях.
  if (hasSkills) {
    const wantActive = activeSkillSlot(item.slot)
    const skillWishes = w
      .topGearSkills()
      .filter((s) => s.weight >= 4 && !present.has(`skill:${s.skill}`))
      .filter((s) => (skillDef(s.skill)?.type === 'active') === wantActive)
      .slice(0, 2)
      .map((s) => ({ kind: 'skill' as const, id: s.skill, weight: s.weight }))
    wishlist.push(...skillWishes)
  }

  const total = lines.length
  const useful = lines.filter((l) => isUseful(l.verdict)).length
  const score = total ? Math.round((lines.reduce((s, l) => s + l.weight, 0) / (total * 5)) * 100) : 0
  const manastoneScore = manastones.length ? Math.round((manastones.reduce((s, m) => s + m.weight, 0) / (manastones.length * 5)) * 100) : null
  return {
    slot: item.slot,
    group,
    item,
    grade: gradeOfItem(item.item),
    lines,
    manastones,
    useful,
    total,
    replace: lines.filter((l) => l.verdict === 'bad'),
    wishlist,
    score,
    manastoneScore
  }
}

/** На каких слотах строкой выпадают активные умения (по данным клиента: оружие, гарда, кольца). */
export function activeSkillSlot(slot: number): boolean {
  const key = slotDef(slot).key
  return slot === 1 || slot === 2 || key.endsWith('Ring')
}

/** На арканах одно умение может быть записано несколько раз — складываем уровни. */
export function mergeSkills(item: GearItem): { skill: number; level: number }[] {
  const map = new Map<number, number>()
  for (const s of item.skills) map.set(s.skill, (map.get(s.skill) ?? 0) + s.level)
  return [...map.entries()].map(([skill, level]) => ({ skill, level }))
}

/**
 * @param known какие статы встречаются на слотах (gamedata/gearOptions) — чтобы «что ловить»
 *   не предлагало невозможное. Без него список берётся просто из приоритетов гайда.
 */
export function analyzeGear(char: Character, guide: Guide | null, known?: KnownOptions): ItemReport[] {
  const w = guideWeights(guide)
  const order = (slot: number) => {
    const i = SLOT_ORDER.indexOf(slot)
    return i < 0 ? 999 : i
  }
  return char.gear
    .filter((g) => slotDef(g.slot).group !== 'arcana')
    .map((g) => analyzeItem(g, w, known))
    .sort((a, b) => order(a.slot) - order(b.slot))
}

/** Оценка раздела «Шмот» 0…100: средняя по вещам со строками + манакамни с меньшим весом. */
export function gearScore(items: ItemReport[]): number {
  const withLines = items.filter((i) => i.total > 0)
  const lines = withLines.length ? withLines.reduce((s, i) => s + i.score, 0) / withLines.length : 0
  const stones = items.filter((i) => i.manastoneScore !== null)
  const ms = stones.length ? stones.reduce((s, i) => s + (i.manastoneScore ?? 0), 0) / stones.length : lines
  return Math.round(lines * 0.75 + ms * 0.25)
}
