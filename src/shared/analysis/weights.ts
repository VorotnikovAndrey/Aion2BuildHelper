// Веса из гайда в удобном для расчётов виде.

import type { SlotGroup } from '../gamedata/slots'
import type { Guide, StatWeight } from '../guide/types'

export type Verdict = 'great' | 'good' | 'weak' | 'bad'

/** Вердикт по весу: 4–5 — то, что нужно; 3 — хорошо; 1–2 — слабо; 0 — бесполезно. */
export function verdictOf(weight: number): Verdict {
  return weight >= 4 ? 'great' : weight >= 3 ? 'good' : weight >= 1 ? 'weak' : 'bad'
}

export const isUseful = (v: Verdict) => v === 'great' || v === 'good'

const toMap = (list: StatWeight[] | undefined) => new Map((list ?? []).map((w) => [w.stat, w.weight]))

export interface GuideWeights {
  stat(group: SlotGroup | 'manastone' | 'genus', stat: number): number
  gearSkill(skill: number): number
  /** Статы по убыванию веса — для списка «что ловить». */
  topStats(group: SlotGroup | 'manastone' | 'genus'): StatWeight[]
  /** Умения на шмоте по убыванию веса. */
  topGearSkills(): { skill: number; weight: number }[]
}

export function guideWeights(guide: Guide | null): GuideWeights {
  const general = toMap(guide?.stats)
  const groups = {
    weapon: guide?.gear.weapon?.length ? toMap(guide.gear.weapon) : general,
    armor: guide?.gear.armor?.length ? toMap(guide.gear.armor) : general,
    accessory: guide?.gear.accessory?.length ? toMap(guide.gear.accessory) : general,
    arcana: general,
    manastone: guide?.manastones?.length ? toMap(guide.manastones) : general,
    genus: guide?.genus.stats?.length ? toMap(guide.genus.stats) : general
  }
  const skills = new Map((guide?.gear.skills ?? []).map((s) => [s.skill, s.weight]))
  const skillList = [...(guide?.gear.skills ?? [])].sort((a, b) => b.weight - a.weight)
  return {
    stat: (group, stat) => groups[group].get(stat) ?? 0,
    gearSkill: (skill) => skills.get(skill) ?? 0,
    topGearSkills: () => skillList,
    topStats: (group) => [...groups[group].entries()].map(([stat, weight]) => ({ stat, weight })).sort((a, b) => b.weight - a.weight)
  }
}
