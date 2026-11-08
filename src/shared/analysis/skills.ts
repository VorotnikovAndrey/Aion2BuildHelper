// Умения: уровни против целей гайда, откуда берутся бонусные уровни, правильные ли специализации.

import { classSkills, skillDef, skillSpecs, specSlotsAt, type SkillDef } from '../gamedata/skills'
import { findNode } from '../gamedata/daevanion'
import type { Guide, SkillRole, SkillTarget } from '../guide/types'
import type { Character } from '../types'

export interface SkillBonus {
  daevanion: number
  arcana: number
  gear: number
}

/** Бонусные уровни умений: узлы досок, строки на арканах, строки на остальном шмоте. */
export function skillBonuses(char: Character): Map<number, SkillBonus> {
  const map = new Map<number, SkillBonus>()
  const get = (id: number) => {
    let b = map.get(id)
    if (!b) map.set(id, (b = { daevanion: 0, arcana: 0, gear: 0 }))
    return b
  }
  for (const board of char.daevanion) {
    for (const id of board.nodes) {
      const n = findNode(id)?.node
      if (n?.type === 'SkillLevel' && n.skill) get(n.skill).daevanion += n.levels ?? 1
    }
  }
  for (const g of char.gear) {
    const isArcana = g.slot >= 41 && g.slot <= 50
    for (const s of g.skills) {
      if (isArcana) get(s.skill).arcana += s.level
      else get(s.skill).gear += s.level
    }
  }
  return map
}

export type SkillStatus = 'done' | 'progress' | 'missing' | 'info'

export interface SpecCheck {
  /** Сколько специализаций можно надеть на текущем уровне. */
  slots: number
  current: number[]
  /** Что должно стоять сейчас (по гайду, с учётом уровня и слотов). */
  wanted: number[]
  missing: number[]
  /** Стоят, но гайд их не просит. */
  extra: number[]
  /** Нужные варианты, которые откроются позже, с уровнем открытия. */
  locked: { n: number; level: number }[]
  ok: boolean
}

export interface SkillReport {
  skill: number
  def?: SkillDef
  role: SkillRole | 'other'
  target?: SkillTarget
  learned: boolean
  equipped: boolean
  level: number
  bonus: SkillBonus
  /** Уровень без бонусов — то, что вложено очками умений. */
  base: number
  targetLevel?: number
  levelGap: number
  specs: SpecCheck | null
  /** Откуда известны текущие специализации: из оверлея или отмечены вручную. */
  specsSource: 'overlay' | 'manual'
  status: SkillStatus
  /** Готовность 0…1 для общей оценки. */
  progress: number
}

export function checkSpecs(target: SkillTarget | undefined, level: number, current: number[]): SpecCheck | null {
  if (!target?.specs?.length) return null
  const defs = skillSpecs(target.skill)
  const reqLevel = (n: number) => defs.find((d) => d.n === n)?.level ?? 0
  const slots = specSlotsAt(level)
  const open = (n: number) => reqLevel(n) <= level
  const wanted: number[] = []
  for (const n of [...target.specs, ...(target.earlySpecs ?? [])]) {
    if (wanted.length >= slots) break
    if (open(n) && !wanted.includes(n)) wanted.push(n)
  }
  const locked = target.specs.filter((n) => !open(n)).map((n) => ({ n, level: reqLevel(n) }))
  const missing = wanted.filter((n) => !current.includes(n))
  return {
    slots,
    current,
    wanted,
    missing,
    extra: current.filter((n) => !wanted.includes(n)),
    locked,
    ok: missing.length === 0
  }
}

/**
 * Оверлей отдаёт у умений список «специализаций», но на практике у всех активных умений там
 * «1, 2» (или «1, 2, 3, 4» у стигм) — похоже на число открытых слотов, а не на выбранные варианты.
 * Если картина именно такая, честно говорим, что выбранные варианты неизвестны.
 */
export function specsLookLikeSlots(char: Character): boolean {
  const actives = char.skills.filter((s) => skillDef(s.skill)?.type === 'active' && s.level >= 8 && s.specs.length)
  if (actives.length < 3) return false
  return actives.every((s) => s.specs.every((n, i) => n === i + 1))
}

/**
 * Отчёт по всем умениям класса (и тем, что упоминает гайд).
 * @param manualSpecs специализации, которые игрок отметил вручную (важнее данных оверлея)
 * @param specsUnknown данные оверлея о специализациях недостоверны (specsLookLikeSlots) — считаем, что не знаем ничего
 */
export function analyzeSkills(char: Character, guide: Guide | null, manualSpecs: Record<number, number[]> = {}, specsUnknown = false): SkillReport[] {
  const bonuses = skillBonuses(char)
  const have = new Map(char.skills.map((s) => [s.skill, s]))
  const targets = new Map((guide?.skills ?? []).map((t) => [t.skill, t]))
  const ids = new Set<number>([...(char.cls ? classSkills(char.cls).map((s) => s.id) : []), ...targets.keys()])

  const reports: SkillReport[] = []
  for (const id of ids) {
    const def = skillDef(id)
    const target = targets.get(id)
    const own = have.get(id)
    const level = own?.level ?? 0
    const bonus = bonuses.get(id) ?? { daevanion: 0, arcana: 0, gear: 0 }
    const base = Math.max(0, level - bonus.daevanion - bonus.arcana - bonus.gear)
    const targetLevel = target?.level
    const levelGap = targetLevel ? Math.max(0, targetLevel - level) : 0
    const manual = manualSpecs[id]
    const specs = def?.type === 'stigma' ? null : checkSpecs(target, level, manual ?? (specsUnknown ? [] : (own?.specs ?? [])))
    const role: SkillReport['role'] = target?.role ?? (def?.type === 'passive' ? 'passive' : 'other')

    let status: SkillStatus = 'info'
    let progress = 1
    if (target) {
      const levelPart = targetLevel ? Math.min(1, level / targetLevel) : level > 0 ? 1 : 0
      const specPart = specs ? (specs.wanted.length ? (specs.wanted.length - specs.missing.length) / specs.wanted.length : 1) : 1
      const equipPart = target.equip && !own?.equipped ? 0 : 1
      progress = specs ? levelPart * 0.6 + specPart * 0.4 : levelPart
      progress *= equipPart
      if (!own || level === 0) status = 'missing'
      else if (levelGap === 0 && (specs?.ok ?? true) && equipPart === 1) status = 'done'
      else status = 'progress'
      if (target.role === 'situational' || (target.role === 'stigma' && target.equip === false)) status = levelGap === 0 && own ? 'done' : 'info'
    }

    reports.push({
      skill: id,
      def,
      role,
      target,
      learned: !!own && level > 0,
      equipped: own?.equipped ?? false,
      level,
      bonus,
      base,
      targetLevel,
      levelGap,
      specs,
      specsSource: manual ? 'manual' : 'overlay',
      status,
      progress
    })
  }
  const roleOrder: Record<string, number> = { core: 0, support: 1, stigma: 2, passive: 3, situational: 4, other: 5 }
  const guideOrder = (id: number) => {
    const i = (guide?.skills ?? []).findIndex((t) => t.skill === id)
    return i < 0 ? 999 : i
  }
  return reports.sort((a, b) => roleOrder[a.role] - roleOrder[b.role] || guideOrder(a.skill) - guideOrder(b.skill) || (a.def?.order ?? 0) - (b.def?.order ?? 0))
}

/** Стигмы: что надето, что гайд просит надеть, что лишнее. */
export function stigmaLoadout(char: Character, guide: Guide | null) {
  const equipped = char.skills.filter((s) => s.equipped && skillDef(s.skill)?.type === 'stigma').map((s) => s.skill)
  const wanted = (guide?.skills ?? []).filter((t) => t.role === 'stigma' && t.equip).map((t) => t.skill)
  const optional = (guide?.skills ?? []).filter((t) => t.role === 'stigma' && !t.equip).map((t) => t.skill)
  return {
    equipped,
    wanted,
    optional,
    missing: wanted.filter((s) => !equipped.includes(s)),
    extra: equipped.filter((s) => !wanted.includes(s) && !optional.includes(s))
  }
}

/** Оценка раздела «Умения» 0…100: главные умения весят больше. */
export function skillsScore(reports: SkillReport[]): number {
  const w: Record<string, number> = { core: 3, support: 1, stigma: 1.5, passive: 0.5 }
  let sum = 0
  let total = 0
  for (const r of reports) {
    if (!r.target || !(r.role in w) || r.status === 'info') continue
    sum += r.progress * w[r.role]
    total += w[r.role]
  }
  return total ? Math.round((sum / total) * 100) : 0
}
