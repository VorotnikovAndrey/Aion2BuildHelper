// Знание о видах (Genus Insight): пять родов питомцев, у каждого — ячейки со случайными статами.
// Уровень рода растёт с коллекцией питомцев этого рода; ячейки открываются с уровнем.
// Какие статы и в каких пределах бывают в каждой ячейке — genus-ranges.json (таблица клиента с wikily.gg).

import rangesJson from './genus-ranges.json'
import { t } from '../i18n'

export interface GenusDef {
  key: string
  ru: string
  en: string
}

export const GENUSES: GenusDef[] = [
  { key: 'intellect', ru: 'Разум', en: 'Cogni' },
  { key: 'feral', ru: 'Дикие', en: 'Fera' },
  { key: 'nature', ru: 'Природа', en: 'Natura' },
  { key: 'trans', ru: 'Мутанты', en: 'Varian' },
  { key: 'special', ru: 'Особый', en: 'Special' }
]

export const genusDef = (key: string): GenusDef => GENUSES.find((g) => g.key === key) ?? { key, ru: key, en: key }

/** Что может выпасть в ячейке: стат, грейд ячейки, пределы значения и шанс среди статов этого грейда. */
export interface GenusRoll {
  stat: number
  grade: number
  min: number
  max: number
  /** Шанс этого стата среди статов того же грейда, %. */
  chanceInGrade: number
}

const RANGES = rangesJson as unknown as {
  gradeChances: Record<string, number[]>
  slots: Record<string, Record<string, [number, number, number, number, number][]>>
}

/** Варианты ячейки рода. slot — с нуля, как в данных оверлея. Пусто — для этой ячейки таблицы нет. */
export function genusSlotRolls(genus: string, slot: number): GenusRoll[] {
  return (RANGES.slots[genus]?.[String(slot + 1)] ?? []).map(([stat, grade, min, max, chanceInGrade]) => ({ stat, grade, min, max, chanceInGrade }))
}

/** Пределы стата в ячейке для её грейда. */
export function genusRange(genus: string, slot: number, grade: number, stat: number): GenusRoll | undefined {
  return genusSlotRolls(genus, slot).find((r) => r.grade === grade && r.stat === stat)
}

/** Шансы грейдов (1–5) при анализе ячейки на этом уровне рода, %. Одинаковы у всех родов. */
export function genusGradeChances(level: number): number[] {
  return RANGES.gradeChances[String(Math.min(10, Math.max(1, level)))] ?? [100, 0, 0, 0, 0]
}

/** Шанс за один анализ получить стат в ячейке (любого грейда) на этом уровне рода, %. */
export function genusStatChance(genus: string, slot: number, level: number, stat: number): number {
  const grades = genusGradeChances(level)
  return genusSlotRolls(genus, slot)
    .filter((r) => r.stat === stat)
    .reduce((sum, r) => sum + ((grades[r.grade - 1] ?? 0) * r.chanceInGrade) / 100, 0)
}

/** Максимум стата в Знании о видах (лучшая ячейка, высший грейд) — сколько можно поймать в лучшем случае. */
export const GENUS_MAX: Record<number, number> = (() => {
  const out: Record<number, number> = {}
  for (const slots of Object.values(RANGES.slots))
    for (const rows of Object.values(slots)) for (const [stat, , , max] of rows) out[stat] = Math.max(out[stat] ?? 0, max)
  return out
})()

/** Какие статы вообще бывают в Знании о видах (плюс то, что видно у персонажей). */
export function genusOptions(characters: { genus: { effects: { stat: number }[] }[] }[] = []): Set<number> {
  const set = new Set(Object.keys(GENUS_MAX).map(Number))
  for (const c of characters) for (const g of c.genus) for (const e of g.effects) set.add(e.stat)
  return set
}

/**
 * С какого значения стат в ячейке считаем верхним — «можно запирать»: верхние 20% диапазона грейда.
 * Порог — оценка помощника: гайды говорят «запирайте только верхние значения», без чисел.
 */
export const GENUS_LOCK_SHARE = 0.8
export const genusLockFrom = (r: { min: number; max: number }): number => Math.ceil(r.min + (r.max - r.min) * GENUS_LOCK_SHARE)

/**
 * Грейд ячейки рода: чем выше, тем больше значение стата. Порядок — как у вещей в игре
 * (серый → зелёный → синий → золотой → оранжевый): SolAshur советует «запирать золото сейчас,
 * оранжевое — позже». Русские названия — наши.
 */
export const GENUS_GRADES: Record<number, string> = {
  1: t('Обычная'),
  2: t('Редкая'),
  3: t('Легендарная'),
  4: t('Уникальная'),
  5: t('Эпическая')
}

/** Грейд ячейки → грейд для цвета (те же цвета, что у вещей). */
export const GENUS_GRADE_COLOR: Record<number, 'common' | 'rare' | 'legend' | 'unique' | 'epic'> = {
  1: 'common',
  2: 'rare',
  3: 'legend',
  4: 'unique',
  5: 'epic'
}

/** До какого уровня качать род перед тем, как запирать ячейки (ExpCarry, SolAshur). */
export const GENUS_LEVEL_GOAL = 10
