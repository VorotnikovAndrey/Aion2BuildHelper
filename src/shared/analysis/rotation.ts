// Ротация: связка (ячейки панели), ручные умения и открытие боя из гайда — рядом с тем, что есть у персонажа.
// Здесь же личные советы: какая ячейка подходит по уровню умения, чего не хватает на панели,
// как жать умение при ваших статах (например, заряд по скорости боя).

import { skillDef } from '../gamedata/skills'
import { formatStatValue } from '../gamedata/stats'
import type { Guide, GuideMacro, GuideManualSkill, StatHint } from '../guide/types'
import type { Namer } from '../names'
import type { Character } from '../types'
import type { SkillReport } from './skills'
import { t } from '../i18n'

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
  /** Подходит ли ячейка сейчас по уровню умения из `when`. */
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

  // Ячейки по уровню умения: какая подходит сейчас и когда переходить на следующую.
  for (const m of macros) {
    const w = m.macro.when
    if (m.active || !w?.minLevel || (m.whenLevel ?? 0) >= w.minLevel) continue
    const now = macros.find((x) => x.active && x.macro.when?.skill === w.skill)
    advice.push({
      id: `macro-${m.macro.id}`,
      tone: 'info',
      title: now ? t('Сейчас подходит «{macro}»', { macro: now.macro.name }) : t('«{macro}» — позже', { macro: m.macro.name }),
      text: t('{name} — ур. {p}. С ур. {minLevel} переходите на «{macro}».', {
        name: name(w.skill),
        p: m.whenLevel ?? 0,
        minLevel: w.minLevel,
        macro: m.macro.name
      }),
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
    // Дыра в связке бьёт по урону сильнее, чем отсутствие ручного умения.
    const inStack = missing.some((id) => macros.some((m) => m.active && m.macro.skills.includes(id)))
    advice.push({
      id: 'missing',
      tone: inStack ? 'bad' : 'warn',
      title: t('Не изучено: {list}', { list: list(missing) }),
      text: inStack
        ? t('Ротация гайда рассчитана на них: связка пропустит неизученное, и окна урона станут короче.')
        : t('По гайду {p} вручную. Ротация работает и без {p2}, но слабее; стигмы и их уровни — на странице «Умения».', {
            p: missing.length === 1 ? t('это умение жмут') : t('эти умения жмут'),
            p2: missing.length === 1 ? t('него') : t('них')
          }),
      skills: missing,
      link: '/skills'
    })
  }
  if (unequipped.length) {
    advice.push({
      id: 'unequipped',
      tone: 'warn',
      title: `${unequipped.length === 1 ? t('Стигма не надета') : t('Стигмы не надеты')}: ${list(unequipped)}`,
      text: t('По гайду {p} в ротации. Надеть — в окне умений игры; что надето сейчас, видно на странице «Умения».', {
        p: unequipped.length === 1 ? t('она нужна') : t('они нужны')
      }),
      skills: unequipped,
      link: '/skills'
    })
  }

  // Специализации умений из связки: порядок в ячейках рассчитан на варианты гайда.
  const inMacros = [...new Set(macros.filter((m) => m.active).flatMap((m) => m.macro.skills))]
  const specsOff = inMacros.filter((id) => state(id).specsOff)
  if (specsOff.length) {
    advice.push({
      id: 'specs',
      tone: 'warn',
      title: t('Специализации не по гайду: {list}', { list: list(specsOff) }),
      text: t('Порядок в ячейках рассчитан на варианты гайда — с другими он работает хуже. Что поменять, видно на странице «Умения».'),
      skills: specsOff,
      link: '/skills'
    })
  } else if (specsUncertain && inMacros.some((id) => reports.get(id)?.specs && reports.get(id)?.specsSource !== 'manual')) {
    advice.push({
      id: 'specs-unknown',
      tone: 'info',
      title: t('Специализации умений из связки неизвестны'),
      text: t('Оверлей не показывает выбранные варианты. Отметьте их на странице «Умения» — тогда помощник проверит и связку.'),
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
      title: t('{name}: у вас {stat} {stat2}', { name: name(m.entry.skill), stat: namer.stat(stat).main, stat2: formatStatValue(stat, m.statHint.value) }),
      text: m.statHint.text,
      skills: [m.entry.skill]
    })
  }

  if (!advice.some((a) => a.tone === 'bad' || a.tone === 'warn')) {
    advice.unshift({
      id: 'ready',
      tone: 'ok',
      title: t('Всё для ротации на месте'),
      text: t('Умения из связки и ручные изучены, стигмы надеты. Дальше — уровни и специализации на странице «Умения».')
    })
  }
  return { macros, manual, opener, advice }
}
