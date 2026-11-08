// Знание о видах (Genus Insight): пять родов питомцев, у каждого — ячейки со случайными статами.
// Уровень рода растёт с коллекцией питомцев этого рода; ячейки открываются с уровнем.

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

/**
 * Какие статы бывают в ячейках рода (собрано из наблюдений: ваш персонаж и таблица из приложения друга).
 * Нужен, чтобы «что ловить» не предлагало статы, которых в роде не бывает. Дополняется тем, что видно у персонажей.
 */
const GENUS_OPTIONS_SEED = [19, 28, 31, 38, 47, 50, 51, 52, 56, 57, 69, 70, 98, 100, 104, 110, 128, 193, 196, 199, 255, 284, 379, 380, 443, 587, 588, 591, 592]

/** Максимум стата в ячейке рода (по таблице игроков) — сколько можно поймать в лучшем случае. */
export const GENUS_MAX: Record<number, number> = {
  19: 16, // Доп. АТК
  128: 30, // Крит. удар
  196: 240, // Увеличение ОЗ 2,4%
  379: 400, // Увелич. урона в PvE 4%
  70: 300, // Стойкость к урону 3%
  380: 400, // Стойкость к урону в PvE 4%
  443: 300 // Сокрушающий удар 3%
}

export function genusOptions(characters: { genus: { effects: { stat: number }[] }[] }[] = []): Set<number> {
  const set = new Set(GENUS_OPTIONS_SEED)
  for (const c of characters) for (const g of c.genus) for (const e of g.effects) set.add(e.stat)
  return set
}

/**
 * Грейд ячейки рода: чем выше, тем больше значение стата. Порядок — как у вещей в игре
 * (серый → зелёный → синий → золотой → оранжевый): SolAshur советует «запирать золото сейчас,
 * оранжевое — позже». Русские названия — наши.
 */
export const GENUS_GRADES: Record<number, string> = {
  1: 'Обычная',
  2: 'Редкая',
  3: 'Легендарная',
  4: 'Уникальная',
  5: 'Эпическая'
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
