// Гайды: встроенные + проверка импортированных файлов.

import { classInfo } from '../gamedata/classes'
import { toClassKey } from '../questlog/parse'
import { clericPveConsensus } from './builtin/clericPveConsensus'
import { templarPveConsensus } from './builtin/templarPveConsensus'
import { templarPveMobalytics } from './builtin/templarPveMobalytics'
import {
  GUIDE_SCHEMA,
  type Guide,
  type GuideCombat,
  type GuideMacro,
  type GuideOneButton,
  type GuideManualSkill,
  type GuideMode,
  type GuideSource,
  type StatHint,
  type StatTarget,
  type SkillRole,
  type SkillTarget,
  type StatWeight
} from './types'

export * from './types'

/** Первый подходящий по классу — гайд по умолчанию. Сводный идёт первым: приложение не следует одному гайду вслепую. */
export const BUILTIN_GUIDES: Guide[] = [templarPveConsensus, templarPveMobalytics, clericPveConsensus]

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const nums = (v: unknown): number[] => (Array.isArray(v) ? v.filter((x): x is number => typeof x === 'number') : [])
const weights = (v: unknown): StatWeight[] =>
  Array.isArray(v)
    ? v
        .filter(isObj)
        .flatMap((w) =>
          typeof w.stat === 'number' && typeof w.weight === 'number'
            ? [{ stat: w.stat, weight: clampWeight(w.weight), note: typeof w.note === 'string' ? w.note : undefined }]
            : []
        )
    : []
const clampWeight = (w: number) => Math.max(0, Math.min(5, Math.round(w)))

const ROLES: SkillRole[] = ['core', 'support', 'passive', 'stigma', 'situational']
const MODES: GuideMode[] = ['pve', 'pvp', 'leveling', 'other']

/**
 * Приводит JSON гайда (из файла или старой версии) к актуальному виду.
 * Бросает понятную ошибку, если это не гайд.
 */
export function normalizeGuide(raw: unknown, fallbackId: string): Guide {
  if (!isObj(raw)) throw new Error('Файл гайда должен содержать JSON-объект')
  const cls = toClassKey(raw.cls)
  if (!cls || !classInfo(cls)) throw new Error('В гайде не указан класс (поле cls, например "templar")')
  if (typeof raw.name !== 'string' || !raw.name.trim()) throw new Error('У гайда нет названия (поле name)')

  const skills: SkillTarget[] = (Array.isArray(raw.skills) ? raw.skills : []).filter(isObj).flatMap((s) => {
    if (typeof s.skill !== 'number') return []
    const role = ROLES.includes(s.role as SkillRole) ? (s.role as SkillRole) : 'support'
    return [
      {
        skill: s.skill,
        role,
        level: typeof s.level === 'number' ? s.level : undefined,
        specs: nums(s.specs).length ? nums(s.specs) : undefined,
        earlySpecs: nums(s.earlySpecs).length ? nums(s.earlySpecs) : undefined,
        equip: typeof s.equip === 'boolean' ? s.equip : undefined,
        note: typeof s.note === 'string' ? s.note : undefined
      }
    ]
  })

  const gear = isObj(raw.gear) ? raw.gear : {}
  const arcana = isObj(raw.arcana) ? raw.arcana : {}
  const daev = isObj(raw.daevanion) ? raw.daevanion : {}
  const genus = isObj(raw.genus) ? raw.genus : {}
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined)
  const toSource = (v: unknown): GuideSource | undefined => {
    if (!isObj(v)) return undefined
    const out: GuideSource = { title: str(v.title), url: str(v.url), author: str(v.author), date: str(v.date) }
    if (v.region === 'global' || v.region === 'korea' || v.region === 'mixed') out.region = v.region
    if (v.kind === 'guide' || v.kind === 'data') out.kind = v.kind
    if (str(v.note)) out.note = str(v.note)
    return out
  }
  const titles = isObj(raw.titles) ? raw.titles : undefined

  return {
    schema: GUIDE_SCHEMA,
    id: str(raw.id) ?? fallbackId,
    name: raw.name.trim(),
    cls,
    mode: MODES.includes(raw.mode as GuideMode) ? (raw.mode as GuideMode) : 'other',
    description: str(raw.description),
    source: toSource(raw.source),
    sources: Array.isArray(raw.sources) ? raw.sources.map(toSource).filter((x): x is GuideSource => !!x) : undefined,
    updatedAt: str(raw.updatedAt) ?? new Date().toISOString(),
    skills,
    stats: weights(raw.stats),
    gear: {
      weapon: gear.weapon ? weights(gear.weapon) : undefined,
      armor: gear.armor ? weights(gear.armor) : undefined,
      accessory: gear.accessory ? weights(gear.accessory) : undefined,
      skills: (Array.isArray(gear.skills) ? gear.skills : [])
        .filter(isObj)
        .flatMap((w) => (typeof w.skill === 'number' && typeof w.weight === 'number' ? [{ skill: w.skill, weight: clampWeight(w.weight) }] : [])),
      notes: str(gear.notes)
    },
    manastones: raw.manastones ? weights(raw.manastones) : undefined,
    arcana: {
      attack: nums(arcana.attack),
      passive: nums(arcana.passive),
      useless: nums(arcana.useless),
      preferredSet: arcana.preferredSet === 'magic' || arcana.preferredSet === 'vigor' ? arcana.preferredSet : undefined,
      notes: str(arcana.notes)
    },
    daevanion: {
      goals: (Array.isArray(daev.goals) ? daev.goals : []).filter(isObj).map((g, i) => ({
        id: str(g.id) ?? `goal-${i + 1}`,
        name: str(g.name) ?? `Цель ${i + 1}`,
        description: str(g.description),
        skills: nums(g.skills).length ? nums(g.skills) : undefined,
        boards: nums(g.boards).length ? nums(g.boards) : undefined,
        nodes: nums(g.nodes).length ? nums(g.nodes) : undefined
      })),
      notes: str(daev.notes)
    },
    genus: { stats: genus.stats ? weights(genus.stats) : undefined, notes: str(genus.notes) },
    titles: titles
      ? {
          attack: nums(titles.attack).length ? nums(titles.attack) : undefined,
          defense: nums(titles.defense).length ? nums(titles.defense) : undefined,
          utility: nums(titles.utility).length ? nums(titles.utility) : undefined,
          notes: str(titles.notes)
        }
      : undefined,
    statTargets: Array.isArray(raw.statTargets)
      ? raw.statTargets.filter(isObj).flatMap((t, i): StatTarget[] => {
          const goals = (Array.isArray(t.goals) ? t.goals : [])
            .filter(isObj)
            .flatMap((g) => (typeof g.value === 'number' ? [{ value: g.value, label: str(g.label) ?? String(g.value) }] : []))
            .sort((a, b) => a.value - b.value)
          if (!nums(t.stats).length || !goals.length) return []
          return [
            {
              id: str(t.id) ?? `target-${i + 1}`,
              name: str(t.name) ?? `Порог ${i + 1}`,
              stats: nums(t.stats),
              goals,
              raise: nums(t.raise).length ? nums(t.raise) : undefined,
              kind: t.kind === 'top' ? 'top' : 'content',
              note: str(t.note)
            }
          ]
        })
      : undefined,
    rotation: Array.isArray(raw.rotation) ? raw.rotation.filter((x): x is string => typeof x === 'string') : undefined,
    combat: normalizeCombat(raw.combat),
    tips: Array.isArray(raw.tips)
      ? raw.tips.filter(isObj).flatMap((t) => (typeof t.title === 'string' && typeof t.text === 'string' ? [{ title: t.title, text: t.text }] : []))
      : undefined,
    checklist: Array.isArray(raw.checklist)
      ? raw.checklist.filter(isObj).flatMap((c, i) => (typeof c.text === 'string' ? [{ id: str(c.id) ?? `item-${i + 1}`, text: c.text }] : []))
      : undefined
  }
}

const optStr = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v : undefined)

function normalizeStatHint(v: unknown): StatHint | undefined {
  if (!isObj(v) || typeof v.stat !== 'number' || !Array.isArray(v.ranges)) return undefined
  const ranges = v.ranges
    .filter(isObj)
    .flatMap((r) => (typeof r.text === 'string' ? [{ below: typeof r.below === 'number' ? r.below : undefined, text: r.text }] : []))
  return ranges.length ? { stat: v.stat, ranges } : undefined
}

function normalizeOneButton(v: unknown): GuideOneButton | undefined {
  if (!isObj(v) || !Array.isArray(v.events)) return undefined
  const events = v.events
    .filter(isObj)
    .flatMap((e) =>
      typeof e.key === 'string' && e.key.trim() && typeof e.down === 'boolean'
        ? [{ key: e.key, down: e.down, waitMs: typeof e.waitMs === 'number' && e.waitMs >= 0 ? e.waitMs : 0 }]
        : []
    )
  if (!events.length) return undefined
  return { events, repeatMs: typeof v.repeatMs === 'number' && v.repeatMs >= 0 ? v.repeatMs : 0, note: optStr(v.note) }
}

/** Раздел «Бой» (макросы, ручные умения, открытие) — необязательный; кривые записи отбрасываются. */
function normalizeCombat(v: unknown): GuideCombat | undefined {
  if (!isObj(v)) return undefined
  const macros = (Array.isArray(v.macros) ? v.macros : []).filter(isObj).flatMap((m, i): GuideMacro[] => {
    const skills = nums(m.skills)
    if (!skills.length) return []
    const when = isObj(m.when) && typeof m.when.skill === 'number' ? m.when : undefined
    return [
      {
        id: optStr(m.id) ?? `macro-${i + 1}`,
        name: optStr(m.name) ?? `Макрос ${i + 1}`,
        skills,
        key: optStr(m.key),
        when: when
          ? {
              skill: when.skill as number,
              minLevel: typeof when.minLevel === 'number' ? when.minLevel : undefined,
              maxLevel: typeof when.maxLevel === 'number' ? when.maxLevel : undefined
            }
          : undefined,
        note: optStr(m.note)
      }
    ]
  })
  const manual = (Array.isArray(v.manual) ? v.manual : [])
    .filter(isObj)
    .flatMap((m): GuideManualSkill[] =>
      typeof m.skill === 'number'
        ? [{ skill: m.skill, when: optStr(m.when) ?? '', key: optStr(m.key), optional: m.optional === true || undefined, byStat: normalizeStatHint(m.byStat) }]
        : []
    )
  const opener = (Array.isArray(v.opener) ? v.opener : [])
    .filter(isObj)
    .flatMap((o) => (typeof o.skill === 'number' ? [{ skill: o.skill, note: optStr(o.note) }] : []))
  const combat: GuideCombat = {
    macros: macros.length ? macros : undefined,
    macroKey: optStr(v.macroKey),
    delayMs: typeof v.delayMs === 'number' && v.delayMs >= 0 ? v.delayMs : undefined,
    delayNote: optStr(v.delayNote),
    manual: manual.length ? manual : undefined,
    opener: opener.length ? opener : undefined,
    openerNote: optStr(v.openerNote),
    oneButton: normalizeOneButton(v.oneButton),
    notes: optStr(v.notes)
  }
  return Object.values(combat).some((x) => x !== undefined) ? combat : undefined
}
