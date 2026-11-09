import { describe, expect, it } from 'vitest'
import { templarPveConsensus } from '../testing/templarPveConsensus'
import { topData } from '../gamedata/top'
import { createNamer } from '../names'
import { makeTemplar } from '../testing/fixtures'
import { analyzeBuild } from './build'
import { compareWithTop, cpPercentile } from './top'

const namer = createNamer('ru')

describe('сравнение с топ-игроками', () => {
  it('данные о топ-стражах собраны', () => {
    const top = topData('templar')!
    expect(top.players).toBeGreaterThan(1000)
    expect(top.skills.find((s) => s.skill === 12240000)?.avgLevel).toBeGreaterThan(10)
    expect(top.enchant.find((e) => e.label === 'Main hand')?.slots).toEqual([1])
    expect(topData('cleric')?.players).toBeGreaterThan(500)
    expect(topData(null)).toBeNull()
  })

  it('процентиль боевой мощи по корзинам', () => {
    const buckets = [
      { from: 0, to: 99, count: 50 },
      { from: 100, to: 199, count: 50 }
    ]
    expect(cpPercentile(50, buckets)).toBe(25)
    expect(cpPercentile(100, buckets)).toBe(50)
    expect(cpPercentile(500, buckets)).toBe(100)
    expect(cpPercentile(-5, buckets)).toBe(0)
  })

  it('умения, стигмы, заточка и список отставаний', () => {
    const char = makeTemplar()
    const r = compareWithTop(char, analyzeBuild(char, templarPveConsensus, namer), topData('templar')!)
    const judgment = r.skills.find((s) => s.skill === 12240000)!
    expect(judgment.level).toBe(18)
    expect(judgment.tone).toBe('ok') // 18 против ~18,1
    const pummel = r.skills.find((s) => s.skill === 12040000)!
    expect(pummel.learned).toBe(false)
    expect(r.gaps.some((g) => g.id === 'skill-12040000')).toBe(true)
    expect(r.stigmas.find((s) => s.skill === 12070000)?.equipped).toBe(true) // Щит погибели надет
    const weapon = r.enchant.find((e) => e.ru === 'Оружие')!
    expect(weapon.yours).toBe(10)
    expect(weapon.tone).not.toBe('ok')
    expect(r.cp.percentile).toBeGreaterThanOrEqual(0)
  })
})
