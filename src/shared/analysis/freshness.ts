// Насколько свежи «медленные» разделы данных: Знание о видах и доски Даэваниона.
// Оверлей Questlog переписывает файл при смене зоны, но эти разделы подтягивает с задержкой
// (доски у владельца пришли примерно через 12 часов, см. docs/data-sources.md). Отдельной отметки
// времени у раздела в файле нет — поэтому смотрим, когда раздел менялся в истории приложения.

import type { Character } from '../types'
import type { HistoryEntry } from './history'

export type SlowSection = 'genus' | 'daevanion'

export interface SectionFreshness {
  /** Когда оверлей последний раз видел персонажа (мс). */
  seenAt: number
  /** Когда в данных оверлея последний раз менялся раздел; null — ни разу, пока ведётся история. */
  changedAt: number | null
  /** С какого момента ведётся история персонажа; null — истории ещё нет. */
  trackedSince: number | null
}

export function sectionFreshness(char: Character, entries: HistoryEntry[], section: SlowSection): SectionFreshness {
  let changedAt: number | null = null
  let trackedSince: number | null = null
  for (const e of entries) {
    const at = e.summary.at || e.savedAt
    // Снимок новее данных на экране (например, старая копия файла в браузерном режиме) — не про эти данные.
    if (at > char.updatedAt) continue
    trackedSince = trackedSince === null ? at : Math.min(trackedSince, at)
    if (e.changes.some((c) => c.kind === section)) changedAt = changedAt === null ? at : Math.max(changedAt, at)
  }
  return { seenAt: char.updatedAt, changedAt, trackedSince }
}
