// Ротация: стопки макроса, ручные умения и открытие боя из гайда — рядом с тем, что есть у персонажа.
// Здесь же личные советы: какая стопка подходит по уровню умения, чего не хватает на панели,
// как жать умение при ваших статах (например, заряд по скорости боя).

import { skillDef } from '../gamedata/skills'
import { formatStatValue } from '../gamedata/stats'
import type { Guide, GuideMacro, GuideManualSkill, StatHint } from '../guide/types'
import type { Namer } from '../names'
import type { Character } from '../types'
import type { SkillReport } from './skills'

/** ready — изучено (стигма — надета); missing — не изучено; unequipped — стигма изучена, но не надета. */
export type SkillUse = 'ready' | 'missing' | 'unequipped'

export interface RotationSkill {
  skill: number
  use: SkillUse
  level: number
  /** Специализации известны и не совпадают с гайдом. */
  specsOff: boolean
}

export interface MacroReport {
  macro: GuideMacro
  /** Подходит ли стопка сейчас по уровню умения из `when`. */
  active: boolean
  /** Текущий уровень умения из `when`. */
  whenLevel?: number
  skills: RotationSkill[]
}

export interface ManualReport {
  entry: GuideManualSkill
  skill: RotationSkill
  /** Подсказка по стату персонажа — уже выбранная под его значение. */
  statHint?: { text: string; value: number }
}

export type AdviceTone = 'ok' | 'warn' | 'bad' | 'info'

export interface RotationAdvice {
  id: string
  tone: AdviceTone
  title: string
  text: string
  /** Умения, о которых совет (иконки). */
  skills?: number[]
  /** Страница, где это поправить. */
  link?: string
}

export interface RotationReport {
  macros: MacroReport[]
  manual: ManualReport[]
  opener: { skill: number; note?: string; use: SkillUse }[]
  advice: RotationAdvice[]
}

export function pickStatHint(hint: StatHint, value: number): string | undefined {
  return hint.ranges.find((r) => r.below === undefined || value < r.below)?.text
}

export function macroFits(macro: GuideMacro, level: number): boolean {
  const w = macro.when
  if (!w) return true
  return (w.minLevel === undefined || level >= w.minLevel) && (w.maxLevel === undefined || level <= w.maxLevel)
}

export function analyzeRotation(char: Character, guide: Guide | null, skills: SkillReport[], specsUncertain: boolean, namer: Namer): RotationReport | null {
  const combat = guide?.combat
  if (!combat) return null
  const reports = new Map(skills.map((r) => [r.skill, r]))
  const own = new Map(char.skills.map((s) => [s.skill, s]))
  const name = (id: number) => namer.skill(id).main

  const state = (id: number): RotationSkill => {
    const r = reports.get(id)
    const o = own.get(id)
    const level = r?.level ?? o?.level ?? 0
    const equipped = r?.equipped ?? o?.equipped ?? false
    const isStigma = skillDef(id)?.type === 'stigma'
    const use: SkillUse = level <= 0 ? 'missing' : isStigma && !equipped ? 'unequipped' : 'ready'
    const unsure = specsUncertain && r?.specsSource !== 'manual'
    return { skill: id, use, level, specsOff: !!r?.specs && !r.specs.ok && !unsure }
  }

  const macros: MacroReport[] = (combat.macros ?? []).map((m) => {
    const whenLevel = m.when ? state(m.when.skill).level : undefined
    return { macro: m, active: macroFits(m, whenLevel ?? 0), whenLevel, skills: m.skills.map(state) }
  })
  const values = new Map(char.stats.map((s) => [s.stat, s.value]))
  const manual: ManualReport[] = (combat.manual ?? []).map((entry) => {
    const hint = entry.byStat
    const value = hint ? (values.get(hint.stat) ?? 0) : 0
    const text = hint ? pickStatHint(hint, value) : undefined
    return { entry, skill: state(entry.skill), statHint: text ? { text, value } : undefined }
  })
  const opener = (combat.opener ?? []).map((o) => ({ ...o, use: state(o.skill).use }))

  const advice: RotationAdvice[] = []
  const list = (ids: number[]) => ids.map(name).join(', ')

  // Стопки по уровню умения: какая подходит сейчас и когда переходить на следующую.
  for (const m of macros) {
    const w = m.macro.when
    if (m.active || !w?.minLevel || (m.whenLevel ?? 0) >= w.minLevel) continue
    const now = macros.find((x) => x.active && x.macro.when?.skill === w.skill)
    advice.push({
      id: `macro-${m.macro.id}`,
      tone: 'info',
      title: now ? `Сейчас подходит «${now.macro.name}»` : `«${m.macro.name}» — позже`,
      text: `${name(w.skill)} — ур. ${m.whenLevel ?? 0}. С ур. ${w.minLevel} переходите на «${m.macro.name}».`,
      skills: [w.skill],
      link: '/skills'
    })
  }

  // Чего нет: умения из подходящих стопок, обязательных ручных и открытия.
  const needed = new Set<number>([
    ...macros.filter((m) => m.active).flatMap((m) => m.macro.skills),
    ...manual.filter((m) => !m.entry.optional).map((m) => m.entry.skill),
    ...opener.map((o) => o.skill)
  ])
  const missing = [...needed].filter((id) => state(id).use === 'missing')
  const unequipped = [...needed].filter((id) => state(id).use === 'unequipped')
  if (missing.length) {
    // Дыра в стопке бьёт по урону сильнее, чем отсутствие ручного умения.
    const inStack = missing.some((id) => macros.some((m) => m.active && m.macro.skills.includes(id)))
    advice.push({
      id: 'missing',
      tone: inStack ? 'bad' : 'warn',
      title: `Не изучено: ${list(missing)}`,
      text: inStack
        ? 'Ротация гайда рассчитана на них: стопка пропустит неизученное, и окна урона станут короче.'
        : `По гайду ${missing.length === 1 ? 'это умение жмут' : 'эти умения жмут'} вручную. Ротация работает и без ${missing.length === 1 ? 'него' : 'них'}, но слабее; стигмы и их уровни — на странице «Умения».`,
      skills: missing,
      link: '/skills'
    })
  }
  if (unequipped.length) {
    advice.push({
      id: 'unequipped',
      tone: 'warn',
      title: `${unequipped.length === 1 ? 'Стигма не надета' : 'Стигмы не надеты'}: ${list(unequipped)}`,
      text: `По гайду ${unequipped.length === 1 ? 'она нужна' : 'они нужны'} в ротации. Надеть — в окне умений игры; что надето сейчас, видно на странице «Умения».`,
      skills: unequipped,
      link: '/skills'
    })
  }

  // Специализации умений из стопок: порядок в стопке рассчитан на варианты гайда.
  const inMacros = [...new Set(macros.filter((m) => m.active).flatMap((m) => m.macro.skills))]
  const specsOff = inMacros.filter((id) => state(id).specsOff)
  if (specsOff.length) {
    advice.push({
      id: 'specs',
      tone: 'warn',
      title: `Специализации не по гайду: ${list(specsOff)}`,
      text: 'Порядок в стопках рассчитан на варианты гайда — с другими он работает хуже. Что поменять, видно на странице «Умения».',
      skills: specsOff,
      link: '/skills'
    })
  } else if (specsUncertain && inMacros.some((id) => reports.get(id)?.specs && reports.get(id)?.specsSource !== 'manual')) {
    advice.push({
      id: 'specs-unknown',
      tone: 'info',
      title: 'Специализации умений из стопок неизвестны',
      text: 'Оверлей не показывает выбранные варианты. Отметьте их на странице «Умения» — тогда помощник проверит и стопки.',
      link: '/skills'
    })
  }

  // Подсказки по статам персонажа (например, как заряжать при вашей скорости боя).
  for (const m of manual) {
    if (!m.statHint || !m.entry.byStat || m.skill.use === 'missing') continue
    const stat = m.entry.byStat.stat
    advice.push({
      id: `stat-${m.entry.skill}`,
      tone: 'info',
      title: `${name(m.entry.skill)}: у вас ${namer.stat(stat).main} ${formatStatValue(stat, m.statHint.value)}`,
      text: m.statHint.text,
      skills: [m.entry.skill]
    })
  }

  if (!advice.some((a) => a.tone === 'bad' || a.tone === 'warn')) {
    advice.unshift({
      id: 'ready',
      tone: 'ok',
      title: 'Всё для ротации на месте',
      text: 'Умения из стопок и ручные изучены, стигмы надеты. Дальше — уровни и специализации на странице «Умения».'
    })
  }
  return { macros, manual, opener, advice }
}
