// Классы игры. Номера: префикс ID умений (12xxxxxx — страж) и досок Даэваниона (21–26 — страж).

import type { ClassKey } from '../types'

export interface ClassInfo {
  key: ClassKey
  ru: string
  en: string
  /** Первые две цифры ID умений класса. */
  skillPrefix: number
  /** Номер класса в ID досок Даэваниона: доски стража — 21…26. */
  boardPrefix: number
  weapon: { ru: string; en: string }
}

export const CLASSES: ClassInfo[] = [
  { key: 'gladiator', ru: 'Гладиатор', en: 'Gladiator', skillPrefix: 11, boardPrefix: 1, weapon: { ru: 'Двуручный меч', en: 'Greatsword' } },
  { key: 'templar', ru: 'Страж', en: 'Templar', skillPrefix: 12, boardPrefix: 2, weapon: { ru: 'Меч', en: 'Longsword' } },
  { key: 'assassin', ru: 'Убийца', en: 'Assassin', skillPrefix: 13, boardPrefix: 3, weapon: { ru: 'Кинжалы', en: 'Daggers' } },
  { key: 'ranger', ru: 'Стрелок', en: 'Ranger', skillPrefix: 14, boardPrefix: 4, weapon: { ru: 'Лук', en: 'Bow' } },
  { key: 'sorcerer', ru: 'Волшебник', en: 'Sorcerer', skillPrefix: 15, boardPrefix: 5, weapon: { ru: 'Книга', en: 'Spellbook' } },
  { key: 'spiritmaster', ru: 'Заклинатель', en: 'Spiritmaster', skillPrefix: 16, boardPrefix: 6, weapon: { ru: 'Сфера', en: 'Orb' } },
  { key: 'cleric', ru: 'Целитель', en: 'Cleric', skillPrefix: 17, boardPrefix: 7, weapon: { ru: 'Булава', en: 'Mace' } },
  { key: 'chanter', ru: 'Чародей', en: 'Chanter', skillPrefix: 18, boardPrefix: 8, weapon: { ru: 'Посох', en: 'Staff' } }
]

export const classInfo = (key: ClassKey | null | undefined): ClassInfo | undefined => CLASSES.find((c) => c.key === key)

/** Класс по ID умения: 12240000 → страж. */
export function classOfSkill(skillId: number): ClassKey | null {
  const prefix = Math.floor(skillId / 1_000_000)
  return CLASSES.find((c) => c.skillPrefix === prefix)?.key ?? null
}

export const RACES: Record<string, { ru: string; en: string }> = {
  light: { ru: 'Элиец', en: 'Elyos' },
  dark: { ru: 'Асмодианин', en: 'Asmodian' }
}
