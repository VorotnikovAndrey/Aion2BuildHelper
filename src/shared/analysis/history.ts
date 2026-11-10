// История персонажа: короткая сводка каждого снимка и что изменилось между снимками.
// Снимок пишется, когда оверлей обновил данные персонажа (см. src/main/history.ts).

import { classSkills } from '../gamedata/skills'
import type { Namer } from '../names'
import type { Character } from '../types'
import { mergeSkills } from './gear'
import { intlLocale, t } from '../i18n'

export interface SnapshotSummary {
  /** Когда оверлей видел персонажа (мс). */
  at: number
  combatPower: number
  gearScore: number
  level: number
  skills: Record<number, number>
  daevanionNodes: number
  pets: number
  petLevels: number
  abyssPoints?: number
}

export function summarize(char: Character): SnapshotSummary {
  const own = char.cls ? new Set(classSkills(char.cls).map((s) => s.id)) : null
  const skills: Record<number, number> = {}
  for (const s of char.skills) if (!own || own.has(s.skill)) skills[s.skill] = s.level
  return {
    at: char.updatedAt,
    combatPower: char.combatPower,
    gearScore: char.gearScore,
    level: char.level,
    skills,
    daevanionNodes: char.daevanion.reduce((s, b) => s + b.nodes.length, 0),
    pets: char.pets.length,
    petLevels: char.pets.reduce((s, p) => s + p.level, 0),
    abyssPoints: char.abyss?.points
  }
}

export type Change =
  | { kind: 'cp'; from: number; to: number }
  | { kind: 'gearScore'; from: number; to: number }
  | { kind: 'level'; from: number; to: number }
  | { kind: 'skill'; skill: number; from: number; to: number }
  | { kind: 'specs'; skill: number; from: number[]; to: number[] }
  | { kind: 'equip'; skill: number; on: boolean }
  | { kind: 'item'; slot: number; from: number | null; to: number | null }
  | { kind: 'enchant'; slot: number; item: number; from: number; to: number }
  | { kind: 'itemLines'; slot: number; item: number }
  | { kind: 'manastones'; slot: number; item: number }
  | { kind: 'daevanion'; added: number; removed: number }
  | { kind: 'pets'; added: number; levels: number }
  | { kind: 'genus'; genus: string; slot: number; from: number | null; to: number }
  | { kind: 'titles'; added: number }

export interface HistoryEntry {
  /** Когда приложение записало снимок (мс). */
  savedAt: number
  summary: SnapshotSummary
  changes: Change[]
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

export function diffCharacters(prev: Character, next: Character): Change[] {
  const out: Change[] = []
  if (prev.combatPower !== next.combatPower) out.push({ kind: 'cp', from: prev.combatPower, to: next.combatPower })
  if (prev.gearScore !== next.gearScore) out.push({ kind: 'gearScore', from: prev.gearScore, to: next.gearScore })
  if (prev.level !== next.level) out.push({ kind: 'level', from: prev.level, to: next.level })

  const prevSkills = new Map(prev.skills.map((s) => [s.skill, s]))
  const own = next.cls ? new Set(classSkills(next.cls).map((s) => s.id)) : null
  for (const s of next.skills) {
    if (own && !own.has(s.skill)) continue
    const p = prevSkills.get(s.skill)
    if ((p?.level ?? 0) !== s.level) out.push({ kind: 'skill', skill: s.skill, from: p?.level ?? 0, to: s.level })
    if (p && !same([...p.specs].sort(), [...s.specs].sort())) out.push({ kind: 'specs', skill: s.skill, from: p.specs, to: s.specs })
    if (p && p.equipped !== s.equipped) out.push({ kind: 'equip', skill: s.skill, on: s.equipped })
  }

  const slots = new Set([...prev.gear.map((g) => g.slot), ...next.gear.map((g) => g.slot)])
  for (const slot of [...slots].sort((a, b) => a - b)) {
    const a = prev.gear.find((g) => g.slot === slot)
    const b = next.gear.find((g) => g.slot === slot)
    if (!a || !b || a.item !== b.item) {
      out.push({ kind: 'item', slot, from: a?.item ?? null, to: b?.item ?? null })
      continue
    }
    if (a.enchant !== b.enchant) out.push({ kind: 'enchant', slot, item: b.item, from: a.enchant, to: b.enchant })
    if (!same(a.stats, b.stats) || !same(mergeSkills(a), mergeSkills(b))) {
      // У аркан строки умений меняет заточка — это уже видно по «enchant».
      if (!(slot >= 41 && a.enchant !== b.enchant)) out.push({ kind: 'itemLines', slot, item: b.item })
    }
    if (!same(a.manastones, b.manastones)) out.push({ kind: 'manastones', slot, item: b.item })
  }

  const pn = new Set(prev.daevanion.flatMap((b) => b.nodes))
  const nn = new Set(next.daevanion.flatMap((b) => b.nodes))
  const added = [...nn].filter((x) => !pn.has(x)).length
  const removed = [...pn].filter((x) => !nn.has(x)).length
  if (added || removed) out.push({ kind: 'daevanion', added, removed })

  const petAdded = next.pets.length - prev.pets.length
  const petLevels = next.pets.reduce((s, p) => s + p.level, 0) - prev.pets.reduce((s, p) => s + p.level, 0)
  if (petAdded || petLevels) out.push({ kind: 'pets', added: petAdded, levels: petLevels })

  for (const g of next.genus) {
    const pg = prev.genus.find((x) => x.genus === g.genus)
    for (const e of g.effects) {
      const pe = pg?.effects.find((x) => x.slot === e.slot)
      if (!pe || pe.stat !== e.stat || pe.value !== e.value) out.push({ kind: 'genus', genus: g.genus, slot: e.slot, from: pe?.stat ?? null, to: e.stat })
    }
  }

  const titles = next.ownedTitles.length - prev.ownedTitles.length
  if (titles > 0) out.push({ kind: 'titles', added: titles })
  return out
}

const fmt = (n: number) => n.toLocaleString(intlLocale())
const signed = (n: number) => (n > 0 ? '+' : '') + fmt(n)

/** Текст изменения для ленты истории. good: true — рост, false — потеря, undefined — нейтрально. */
export function describeChange(c: Change, n: Namer): { text: string; good?: boolean } {
  switch (c.kind) {
    case 'cp':
      return { text: t('Боевая мощь {from} → {to} ({signed})', { from: fmt(c.from), to: fmt(c.to), signed: signed(c.to - c.from) }), good: c.to > c.from }
    case 'gearScore':
      return { text: t('Уровень снаряжения {from} → {to}', { from: fmt(c.from), to: fmt(c.to) }), good: c.to > c.from }
    case 'level':
      return { text: t('Уровень персонажа {from} → {to}', { from: c.from, to: c.to }), good: c.to > c.from }
    case 'skill':
      return { text: t('{skill}: ур. {from} → {to}', { skill: n.skill(c.skill).main, from: c.from, to: c.to }), good: c.to > c.from }
    case 'specs':
      return { text: t('{skill}: специализации {p} → {p2}', { skill: n.skill(c.skill).main, p: c.from.join(', ') || '—', p2: c.to.join(', ') || '—' }) }
    case 'equip':
      return { text: `${n.skill(c.skill).main}: ${c.on ? t('надета') : t('снята')}` }
    case 'item':
      return {
        text: c.to === null ? t('{item}: снято', { item: n.item(c.from ?? 0, c.slot).main }) : t('{item}: новая вещь', { item: n.item(c.to, c.slot).main }),
        good: c.to !== null
      }
    case 'enchant':
      return { text: t('{item}: заточка +{from} → +{to}', { item: n.item(c.item, c.slot).main, from: c.from, to: c.to }), good: c.to > c.from }
    case 'itemLines':
      return { text: t('{item}: изменились характеристики', { item: n.item(c.item, c.slot).main }) }
    case 'manastones':
      return { text: t('{item}: изменились манакамни', { item: n.item(c.item, c.slot).main }) }
    case 'daevanion':
      return {
        text: t('Даэванион: {p}{p2}{p3}', {
          p: c.added ? t('взято узлов +{added}', { added: c.added }) : '',
          p2: c.added && c.removed ? ', ' : '',
          p3: c.removed ? t('сброшено {removed}', { removed: c.removed }) : ''
        }),
        good: c.added > c.removed
      }
    case 'pets':
      return {
        text: t('Питомцы: {p}{p2}{p3}', {
          p: c.added ? t('новых {signed}', { signed: signed(c.added) }) : '',
          p2: c.added && c.levels ? ', ' : '',
          p3: c.levels ? t('уровней {signed}', { signed: signed(c.levels) }) : ''
        }),
        good: c.added >= 0 && c.levels >= 0
      }
    case 'genus':
      return {
        text: t('Знание о видах, ячейка {p}: {p2}{stat}', { p: c.slot + 1, p2: c.from !== null ? n.stat(c.from).main + ' → ' : '', stat: n.stat(c.to).main })
      }
    case 'titles':
      return { text: t('Новых титулов: {added}', { added: c.added }), good: true }
  }
}
