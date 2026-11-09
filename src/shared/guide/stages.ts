// Стадии прокачки гайда: какую взять целью и как она меняет гайд.

import type { Guide, GuideStage } from './types'

/**
 * Целевая стадия. Выбрана вручную — она. Иначе — ближайшая впереди: самая «лёгкая» стадия,
 * у которой уровень снаряжения выше вашего; все пройдены — самая сильная. Без GS у стадий — последняя.
 */
export function pickStage(guide: Guide | null, stageId: string | undefined, gearScore: number): GuideStage | null {
  const stages = guide?.stages ?? []
  if (!stages.length) return null
  const chosen = stageId ? stages.find((s) => s.id === stageId) : undefined
  if (chosen) return chosen
  return autoStage(stages, gearScore)
}

export function autoStage(stages: GuideStage[], gearScore: number): GuideStage {
  const withGs = stages.filter((s) => s.gearScore !== undefined)
  if (!withGs.length) return stages[stages.length - 1]
  const ahead = withGs.filter((s) => s.gearScore! > gearScore).sort((a, b) => a.gearScore! - b.gearScore!)
  return ahead[0] ?? [...withGs].sort((a, b) => b.gearScore! - a.gearScore!)[0]
}

/** Гайд глазами стадии: что задано у стадии, заменяет то же поле гайда. */
export function applyStage(guide: Guide, stage: GuideStage | null): Guide {
  if (!stage) return guide
  return {
    ...guide,
    skills: stage.skills ?? guide.skills,
    combat: stage.combat ?? guide.combat,
    daevanion: stage.daevanion ?? guide.daevanion,
    titles: stage.titles ?? guide.titles,
    arcana: stage.arcana ?? guide.arcana,
    statTargets: stage.statTargets ?? guide.statTargets
  }
}

/** Стадии по возрастанию уровня снаряжения (без GS — в конце, в порядке автора). */
export function sortedStages(guide: Guide | null): GuideStage[] {
  const stages = guide?.stages ?? []
  return [...stages].sort((a, b) => (a.gearScore ?? Infinity) - (b.gearScore ?? Infinity))
}
