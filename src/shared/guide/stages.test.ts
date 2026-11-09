import { describe, expect, it } from 'vitest'
import { applyStage, pickStage, sortedStages } from './stages'
import { emptyGuide, type Guide } from './types'

const guide: Guide = {
  ...emptyGuide('templar', 'g'),
  skills: [{ skill: 12240000, role: 'core', level: 20 }],
  stages: [
    { id: 'final', name: 'Финал', gearScore: 3500, skills: [{ skill: 12240000, role: 'core', level: 20 }] },
    { id: 's1600', name: '1600 GS', gearScore: 1600, skills: [{ skill: 12240000, role: 'core', level: 12 }] },
    { id: 's1800', name: '1800 GS', gearScore: 1800 }
  ]
}

describe('стадии гайда', () => {
  it('без выбора — ближайшая стадия впереди по уровню снаряжения', () => {
    expect(pickStage(guide, undefined, 1500)?.id).toBe('s1600')
    expect(pickStage(guide, undefined, 1700)?.id).toBe('s1800')
    expect(pickStage(guide, undefined, 4000)?.id).toBe('final')
  })

  it('выбранная вручную стадия важнее; неизвестный ID — как без выбора', () => {
    expect(pickStage(guide, 'final', 1500)?.id).toBe('final')
    expect(pickStage(guide, 'nope', 1500)?.id).toBe('s1600')
    expect(pickStage(emptyGuide('templar', 'x'), undefined, 1500)).toBeNull()
  })

  it('стадия заменяет только то, что у неё задано', () => {
    expect(applyStage(guide, guide.stages![1]).skills[0].level).toBe(12)
    expect(applyStage(guide, guide.stages![2]).skills[0].level).toBe(20)
    expect(applyStage(guide, null)).toBe(guide)
  })

  it('по возрастанию GS', () => {
    expect(sortedStages(guide).map((s) => s.id)).toEqual(['s1600', 's1800', 'final'])
  })
})
