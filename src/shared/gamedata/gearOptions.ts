// Какие статы встречаются строками на каждом слоте. Нужен, чтобы список «что ловить» не предлагал
// то, что на этом слоте не выпадает (например, «Доп. АТК» бывает только на досках и в роде).
//
// Полной таблицы из клиента у нас нет, поэтому список собирается из наблюдений:
//   • стартовый набор ниже — строки, замеченные на реальных вещах (страж и гладиатор, ноябрь 2026);
//   • при каждом запуске к нему добавляется всё, что есть на вещах всех персонажей из файла оверлея.
// Чем больше вещей видело приложение, тем точнее подсказка. См. docs/game-mechanics.md.

import type { Character } from '../types'
import { slotDef } from './slots'

const SEED: Record<string, number[]> = {
  weapon: [1, 5, 28, 32, 128, 255, 282, 317],
  guarder: [1, 5, 28, 32, 38, 128, 146, 282],
  helmet: [2, 128, 235, 317, 425, 443],
  shoulder: [2, 44, 128, 193, 199, 307, 317, 426, 443],
  torso: [2, 28, 41, 128, 255, 317, 426, 442, 588],
  pants: [70, 128, 133, 159, 312, 317, 425, 442, 588],
  gloves: [128, 282, 307, 317, 426, 442],
  boots: [99, 128, 205, 255, 307, 317, 426, 442, 588],
  cape: [47, 74, 128, 255, 312, 317, 425, 443, 449],
  necklace: [1, 194, 199, 282, 307, 317, 318],
  earring: [1, 133, 193, 200, 205, 255, 307, 317, 318],
  ring: [3, 128, 255, 317]
}

/** Слоты-пары (серьги, кольца) делят один набор. */
function seedKey(slot: number): string {
  const key = slotDef(slot).key
  if (key.endsWith('Earring')) return 'earring'
  if (key.endsWith('Ring')) return 'ring'
  if (key.endsWith('Bracelet')) return 'bracelet'
  return key
}

export type KnownOptions = Map<string, Set<number>>

/** Стартовый набор + всё, что видно на вещах этих персонажей. */
export function learnGearOptions(characters: Character[]): KnownOptions {
  const known: KnownOptions = new Map(Object.entries(SEED).map(([k, v]) => [k, new Set(v)]))
  for (const c of characters) {
    for (const g of c.gear) {
      if (g.slot >= 41) continue
      const k = seedKey(g.slot)
      let set = known.get(k)
      if (!set) known.set(k, (set = new Set()))
      for (const s of g.stats) set.add(s.stat)
    }
  }
  return known
}

/** Статы, которые встречаются на слоте; null — данных мало, фильтровать не стоит. */
export function optionsForSlot(known: KnownOptions | undefined, slot: number): Set<number> | null {
  const set = known?.get(seedKey(slot))
  return set && set.size >= 4 ? set : null
}
