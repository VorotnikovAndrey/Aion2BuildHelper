import { describe, expect, it } from 'vitest'
import { analyzeBuild } from '../../analysis/build'
import { compareWithTop } from '../../analysis/top'
import { classSkills } from '../../gamedata/skills'
import { topData } from '../../gamedata/top'
import { createNamer } from '../../names'
import { makeTemplar } from '../../testing/fixtures'
import type { Character } from '../../types'
import { BUILTIN_GUIDES, normalizeGuide } from '../index'
import { clericPveConsensus } from './clericPveConsensus'

const namer = createNamer('ru')

/** Тестовый целитель: шмот и статы от тестового стража, умения — целителя. */
function makeCleric(): Character {
  const base = makeTemplar({ key: '1:Healer', name: 'Healer', cls: 'cleric' })
  return {
    ...base,
    skills: classSkills('cleric', 'active')
      .slice(0, 8)
      .map((s) => ({ skill: s.id, level: 12, equipped: true, specs: [] }))
  }
}

describe('целитель', () => {
  it('для целителя по умолчанию — сводный гайд целителя', () => {
    expect(BUILTIN_GUIDES.find((g) => g.cls === 'cleric')?.id).toBe(clericPveConsensus.id)
  })

  it('в справочниках есть всё для класса: доски, топ-игроки, русские названия', () => {
    expect(topData('cleric')?.skills.length).toBeGreaterThan(10)
    expect(namer.skill(17350000).main).toBe('Приговор')
  })

  it('разбор персонажа, связка и сравнение с топом работают', () => {
    const char = makeCleric()
    const report = analyzeBuild(char, clericPveConsensus, namer)
    expect(report.scores.overall).toBeGreaterThanOrEqual(0)
    expect(report.steps.length).toBeGreaterThan(0)
    expect(report.rotation?.macros.length).toBeGreaterThan(1)
    expect(report.daevanion.boards.length).toBeGreaterThan(3)
    const cmp = compareWithTop(char, report, topData('cleric')!)
    expect(cmp.skills.length).toBeGreaterThan(10)
  })

  it('гайд переживает экспорт и импорт', () => {
    const back = normalizeGuide(JSON.parse(JSON.stringify(clericPveConsensus)), 'x')
    expect(back.combat).toEqual(clericPveConsensus.combat)
    expect(back.statTargets?.length).toBe(clericPveConsensus.statTargets?.length)
  })
})
