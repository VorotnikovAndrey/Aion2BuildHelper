// Гайды: встроенные + проверка импортированных файлов.

import { classInfo } from '../gamedata/classes'
import { toClassKey } from '../questlog/parse'
import {
  GUIDE_SCHEMA,
  type Guide,
  type GuideCombat,
  type GuideMacro,
  type GuideOneButton,
  type GuideStage,
  type GuideStageItem,
  type GuideTip,
  type GuideTipKind,
  type GuideTitles,
  type GuideManualSkill,
  type GuideMode,
  type GuideSource,
  type StatHint,
  type StatTarget,
  type SkillRole,
  type SkillTarget,
  type StatWeight
} from './types'
import { t } from '../i18n'
import { localizeTexts } from './localize'

export * from './types'

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
const TIP_KINDS: GuideTipKind[] = ['build', 'stage', 'skills', 'boards']

/**
 * Приводит JSON гайда (из файла или старой версии) к актуальному виду.
 * Бросает понятную ошибку, если это не гайд.
 */
export function normalizeGuide(raw: unknown, fallbackId: string): Guide {
  if (!isObj(raw)) throw new Error(t('Файл гайда должен содержать JSON-объект'))
  const cls = toClassKey(raw.cls)
  if (!cls || !classInfo(cls)) throw new Error(t('В гайде не указан класс (поле cls, например "templar")'))
  if (typeof raw.name !== 'string' || !raw.name.trim()) throw new Error(t('У гайда нет названия (поле name)'))

  const toSkills = (v: unknown): SkillTarget[] =>
    (Array.isArray(v) ? v : []).filter(isObj).flatMap((s) => {
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
  const skills = toSkills(raw.skills)

  const gear = isObj(raw.gear) ? raw.gear : {}
  const genus = isObj(raw.genus) ? raw.genus : {}
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined)
  const toSource = (v: unknown): GuideSource | undefined => {
    if (!isObj(v)) return undefined
    const out: GuideSource = { title: str(v.title), url: str(v.url), author: str(v.author), date: str(v.date) }
    if (v.region === 'global' || v.region === 'korea' || v.region === 'mixed') out.region = v.region
    if (v.kind === 'guide' || v.kind === 'data' || v.kind === 'questlog') out.kind = v.kind
    if (typeof v.likes === 'number') out.likes = v.likes
    if (str(v.note)) out.note = str(v.note)
    return out
  }
  const toTitles = (titles: unknown): GuideTitles | undefined =>
    isObj(titles)
      ? {
          attack: nums(titles.attack).length ? nums(titles.attack) : undefined,
          defense: nums(titles.defense).length ? nums(titles.defense) : undefined,
          utility: nums(titles.utility).length ? nums(titles.utility) : undefined,
          notes: str(titles.notes)
        }
      : undefined
  const toArcana = (a: unknown): Guide['arcana'] => {
    const arcana = isObj(a) ? a : {}
    return {
      attack: nums(arcana.attack),
      passive: nums(arcana.passive),
      useless: nums(arcana.useless),
      preferredSet: arcana.preferredSet === 'magic' || arcana.preferredSet === 'vigor' ? arcana.preferredSet : undefined,
      notes: str(arcana.notes)
    }
  }
  const toDaevanion = (d: unknown): Guide['daevanion'] => {
    const daev = isObj(d) ? d : {}
    return {
      goals: (Array.isArray(daev.goals) ? daev.goals : []).filter(isObj).map((g, i) => ({
        id: str(g.id) ?? `goal-${i + 1}`,
        name: str(g.name) ?? t('Цель {p}', { p: i + 1 }),
        description: str(g.description),
        skills: nums(g.skills).length ? nums(g.skills) : undefined,
        boards: nums(g.boards).length ? nums(g.boards) : undefined,
        nodes: nums(g.nodes).length ? nums(g.nodes) : undefined
      })),
      notes: str(daev.notes)
    }
  }
  const toStatTargets = (v: unknown): StatTarget[] | undefined =>
    Array.isArray(v)
      ? v.filter(isObj).flatMap((tv, i): StatTarget[] => {
          const goals = (Array.isArray(tv.goals) ? tv.goals : [])
            .filter(isObj)
            .flatMap((g) => (typeof g.value === 'number' ? [{ value: g.value, label: str(g.label) ?? String(g.value) }] : []))
            .sort((a, b) => a.value - b.value)
          if (!nums(tv.stats).length || !goals.length) return []
          return [
            {
              id: str(tv.id) ?? `target-${i + 1}`,
              name: str(tv.name) ?? t('Порог {p}', { p: i + 1 }),
              stats: nums(tv.stats),
              goals,
              raise: nums(tv.raise).length ? nums(tv.raise) : undefined,
              kind: tv.kind === 'top' ? 'top' : tv.kind === 'stage' ? 'stage' : 'content',
              note: str(tv.note)
            }
          ]
        })
      : undefined
  const toStages = (v: unknown): GuideStage[] | undefined => {
    if (!Array.isArray(v)) return undefined
    const out = v.filter(isObj).flatMap((st, i): GuideStage[] => {
      const name = str(st.name)
      if (!name) return []
      return [
        {
          id: str(st.id) ?? `stage-${i + 1}`,
          name,
          gearScore: typeof st.gearScore === 'number' ? st.gearScore : undefined,
          tags: Array.isArray(st.tags) ? st.tags.filter((x): x is string => typeof x === 'string') : undefined,
          note: str(st.note),
          skills: Array.isArray(st.skills) ? toSkills(st.skills) : undefined,
          combat: normalizeCombat(st.combat),
          daevanion: isObj(st.daevanion) ? toDaevanion(st.daevanion) : undefined,
          titles: toTitles(st.titles),
          arcana: isObj(st.arcana) ? toArcana(st.arcana) : undefined,
          statTargets: toStatTargets(st.statTargets),
          gear: Array.isArray(st.gear)
            ? st.gear.filter(isObj).flatMap((g): GuideStageItem[] =>
                typeof g.slot === 'number' && typeof g.item === 'number'
                  ? [
                      {
                        slot: g.slot,
                        item: g.item,
                        enchant: typeof g.enchant === 'number' ? g.enchant : 0,
                        surpass: typeof g.surpass === 'number' && g.surpass > 0 ? g.surpass : undefined,
                        stats: Array.isArray(g.stats)
                          ? g.stats
                              .filter(isObj)
                              .flatMap((x) => (typeof x.stat === 'number' && typeof x.value === 'number' ? [{ stat: x.stat, value: x.value }] : []))
                          : undefined,
                        skills: nums(g.skills).length ? nums(g.skills) : undefined,
                        manastones: nums(g.manastones).length ? nums(g.manastones) : undefined
                      }
                    ]
                  : []
              )
            : undefined
        }
      ]
    })
    return out.length ? out : undefined
  }

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
    arcana: toArcana(raw.arcana),
    daevanion: toDaevanion(raw.daevanion),
    stages: toStages(raw.stages),
    genus: { stats: genus.stats ? weights(genus.stats) : undefined, notes: str(genus.notes) },
    titles: toTitles(raw.titles),
    statTargets: toStatTargets(raw.statTargets),
    rotation: Array.isArray(raw.rotation) ? raw.rotation.filter((x): x is string => typeof x === 'string') : undefined,
    combat: normalizeCombat(raw.combat),
    tips: Array.isArray(raw.tips)
      ? raw.tips.filter(isObj).flatMap((tv): GuideTip[] => {
          const text = str(tv.text)
          if (!text) return []
          const kind = TIP_KINDS.includes(tv.kind as GuideTipKind) ? (tv.kind as GuideTipKind) : undefined
          const stages = Array.isArray(tv.stages) ? tv.stages.filter((x): x is string => typeof x === 'string') : []
          return [{ id: str(tv.id), kind, title: typeof tv.title === 'string' ? tv.title : '', text, stages: stages.length ? stages : undefined }]
        })
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
        name: optStr(m.name) ?? t('Макрос {p}', { p: i + 1 }),
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

/**
 * Встроенные гайды — билды с Questlog: по 5 самых популярных на класс (builtin/questlog/<класс>.json,
 * собираются `npm run guides`). Внутри класса — по убыванию лайков: первый подходящий — гайд по умолчанию.
 * В конце файла: normalizeGuide и его помощники должны быть уже объявлены.
 */
const QUESTLOG_FILES = import.meta.glob<{ guides: unknown[] }>('./builtin/questlog/*.json', { eager: true, import: 'default' })
const CLASS_ORDER = ['templar', 'gladiator', 'assassin', 'ranger', 'sorcerer', 'spiritmaster', 'cleric', 'chanter']
const fileClass = (file: string) => CLASS_ORDER.indexOf(file.match(/(\w+)\.json$/)?.[1] ?? '')

export const BUILTIN_GUIDES: Guide[] = Object.entries(QUESTLOG_FILES)
  .sort(([a], [b]) => fileClass(a) - fileClass(b))
  .flatMap(([file, data]) => data.guides.map((g, i) => ({ ...normalizeGuide(localizeTexts(g), `${file}-${i}`), builtin: true })))
