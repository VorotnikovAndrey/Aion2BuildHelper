// Арканы — карты в слотах 41–45. Как они устроены (по данным клиента, см. docs/game-mechanics.md):
//   • 5 типов карт; у каждого типа свой пул умений класса (Грааль — все 22, остальные — 5–6);
//   • грейд карты = число разных умений на ней: обычная 1, редкая 2, эпическая 3, уникальная 4;
//   • заточка до +2 / +3 / +4 / +5 (по грейду); каждая заточка даёт +1 случайному умению карты, поровну;
//   • потолок умения на карте — ур. 4;
//   • у каждой карты главный эффект — стат божества; карты «магии» и «жизни» собираются в два сета.

import type { ClassKey } from '../types'
import poolsJson from './generated/arcana-pools.json'

export type ArcanaType = 'chalice' | 'parchment' | 'compass' | 'bell' | 'mirror'
export type ArcanaVariant = 'magic' | 'vigor'
export type ArcanaGrade = 'unique' | 'epic' | 'rare' | 'common'

export const ARCANA_TYPES: { type: ArcanaType; slot: number; ru: string; en: string; pool: 'all' | 'attack' | 'passive' }[] = [
  { type: 'chalice', slot: 41, ru: 'Грааль', en: 'Chalice', pool: 'all' },
  { type: 'parchment', slot: 42, ru: 'Пергамент', en: 'Parchment', pool: 'attack' },
  { type: 'compass', slot: 43, ru: 'Компас', en: 'Compass', pool: 'attack' },
  { type: 'bell', slot: 44, ru: 'Колокол', en: 'Bell', pool: 'passive' },
  { type: 'mirror', slot: 45, ru: 'Зеркало', en: 'Mirror', pool: 'passive' }
]

export const ARCANA_GRADES: Record<ArcanaGrade, { ru: string; skills: number; maxEnchant: number; mainStat: number }> = {
  unique: { ru: 'Уникальная', skills: 4, maxEnchant: 5, mainStat: 20 },
  epic: { ru: 'Эпическая', skills: 3, maxEnchant: 4, mainStat: 16 },
  rare: { ru: 'Редкая', skills: 2, maxEnchant: 3, mainStat: 12 },
  common: { ru: 'Обычная', skills: 1, maxEnchant: 2, mainStat: 8 }
}

/** Потолок уровня одного умения на карте. */
export const ARCANA_SKILL_CAP = 4

/** Главный эффект карты: стат божества (ключ стата) по типу и варианту. */
const MAIN_EFFECT: Record<ArcanaType, Record<ArcanaVariant, string>> = {
  chalice: { magic: 'space', vigor: 'time' },
  parchment: { magic: 'destiny', vigor: 'life' },
  compass: { magic: 'death', vigor: 'freedom' },
  bell: { magic: 'destruction', vigor: 'justice' },
  mirror: { magic: 'wisdom', vigor: 'illusion' }
}

export const ARCANA_SETS: Record<ArcanaVariant, { ru: string; en: string; bonus2: string; bonus4: string }> = {
  magic: {
    ru: 'Магический доспех',
    en: 'Magic Armor',
    bonus2: '+1 500 ОМ, когда ОМ ≤ 20% (раз в 30 с)',
    bonus4: '+1 000 ЗЩТ в PvE, когда ОМ ≥ 50%'
  },
  vigor: {
    ru: 'Первобытная сила',
    en: 'Primal Vigor',
    bonus2: '+60 АТК в PvE, когда ОЗ ≥ 70%',
    bonus4: '+150 АТК в PvE, когда ОЗ ≥ 70%'
  }
}

export interface ArcanaInfo {
  type: ArcanaType
  variant: ArcanaVariant
  grade: ArcanaGrade
  ru: string
  en: string
  mainStatKey: string
}

/**
 * Карта по ID предмета: 81 TT G 000V — TT тип (01 Грааль … 05 Зеркало),
 * G грейд (3 уникальная, 4 эпическая, 5 редкая, 6 обычная), V вариант (1 жизни, 2 магии).
 */
export function arcanaInfo(itemId: number): ArcanaInfo | null {
  if (Math.floor(itemId / 10_000_000) !== 81) return null
  const t = Math.floor(itemId / 100_000) % 100
  const g = Math.floor(itemId / 10_000) % 10
  const v = itemId % 10
  const type = ARCANA_TYPES[t - 1]
  const grade = ({ 3: 'unique', 4: 'epic', 5: 'rare', 6: 'common' } as Record<number, ArcanaGrade>)[g]
  const variant: ArcanaVariant | undefined = v === 1 ? 'vigor' : v === 2 ? 'magic' : undefined
  if (!type || !grade || !variant) return null
  return {
    type: type.type,
    variant,
    grade,
    ru: `${type.ru} ${variant === 'magic' ? 'магии' : 'жизни'}`,
    en: `${type.en} of ${variant === 'magic' ? 'Magic' : 'Vigor'}`,
    mainStatKey: MAIN_EFFECT[type.type][variant]
  }
}

const POOLS = poolsJson as Record<string, Partial<Record<ArcanaType, number[]>>>

/** Какие умения класса могут выпасть на карте этого типа. */
export function arcanaPool(cls: ClassKey, type: ArcanaType): number[] {
  return POOLS[cls]?.[type] ?? []
}
