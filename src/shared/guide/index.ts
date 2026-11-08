// Гайды: встроенные + проверка импортированных файлов.

import { classInfo } from '../gamedata/classes'
import { toClassKey } from '../questlog/parse'
import { templarPveMobalytics } from './builtin/templarPveMobalytics'
import { GUIDE_SCHEMA, type Guide, type GuideMode, type SkillRole, type SkillTarget, type StatWeight } from './types'

export * from './types'

export const BUILTIN_GUIDES: Guide[] = [templarPveMobalytics]

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
  const source = isObj(raw.source) ? raw.source : undefined
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined)

  return {
    schema: GUIDE_SCHEMA,
    id: str(raw.id) ?? fallbackId,
    name: raw.name.trim(),
    cls,
    mode: MODES.includes(raw.mode as GuideMode) ? (raw.mode as GuideMode) : 'other',
    description: str(raw.description),
    source: source ? { title: str(source.title), url: str(source.url), author: str(source.author), date: str(source.date) } : undefined,
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
    rotation: Array.isArray(raw.rotation) ? raw.rotation.filter((x): x is string => typeof x === 'string') : undefined,
    tips: Array.isArray(raw.tips)
      ? raw.tips.filter(isObj).flatMap((t) => (typeof t.title === 'string' && typeof t.text === 'string' ? [{ title: t.title, text: t.text }] : []))
      : undefined,
    checklist: Array.isArray(raw.checklist)
      ? raw.checklist.filter(isObj).flatMap((c, i) => (typeof c.text === 'string' ? [{ id: str(c.id) ?? `item-${i + 1}`, text: c.text }] : []))
      : undefined
  }
}
