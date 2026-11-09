// Что носят топ-игроки класса (metabot.gg, раздел «What top … players run»): умения, стигмы, заточка,
// арканы, камни, титулы, распределение боевой мощи. Собирается `npm run gamedata` в generated/top/<класс>.json.

import type { ClassKey } from '../types'

export interface TopData {
  cls: ClassKey
  players: number
  medianCp: number
  top10Cp: number
  avgItemLevel: number
  cpBuckets: { from: number; to: number; count: number }[]
  skills: { skill: number; share: number; avgLevel: number }[]
  stigmas: { skill: number; share: number; avgLevel: number }[]
  boards: { name: string; picked: number; total: number }[]
  enchant: { label: string; slots: number[]; avg: number; most: number; mostShare: number }[]
  gear: { label: string; slots: number[]; items: { name: string; share: number; avgEnchant: number }[] }[]
  manastones: { stat: number; share: number; avg: number }[]
  arcana: { slot: number; cards: { name: string; variant: 'vigor' | 'magic' | null; share: number; avgEnchant: number }[] }[]
  titles: Record<'attack' | 'defense' | 'other', { name: string; share: number }[]>
  wings: { name: string; share: number }[]
  source: string
  fetchedAt: string
}

const files = import.meta.glob<{ default: TopData }>('./generated/top/*.json', { eager: true })
const BY_CLASS = new Map<string, TopData>(Object.values(files).map((m) => [m.default.cls, m.default]))

export function topData(cls: ClassKey | null | undefined): TopData | null {
  return cls ? (BY_CLASS.get(cls) ?? null) : null
}

/** Русские подписи слотов из таблицы заточки (у колец, серёг, браслетов и рун — по два слота). */
export const TOP_SLOT_RU: Record<string, string> = {
  'Main hand': 'Оружие',
  'Off-hand': 'Наручи',
  Helmet: 'Шлем',
  Shoulders: 'Наплечники',
  Chest: 'Нагрудник',
  Legs: 'Набедренники',
  Gloves: 'Перчатки',
  Boots: 'Сапоги',
  Cape: 'Плащ',
  Necklace: 'Ожерелье',
  Earring: 'Серьги',
  Ring: 'Кольца',
  Bracelet: 'Браслеты',
  Belt: 'Пояс',
  Amulet: 'Амулет',
  Rune: 'Руны'
}
