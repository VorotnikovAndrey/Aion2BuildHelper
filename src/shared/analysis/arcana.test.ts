import { describe, expect, it } from 'vitest'
import { arcanaInfo } from '../gamedata/arcana'
import { templarPveMobalytics } from '../guide/builtin/templarPveMobalytics'
import { makeTemplar } from '../testing/fixtures'
import { analyzeArcana, analyzeArcanaCard, atLeast, choose, oneIn, pContainsAll } from './arcana'

describe('вероятности аркан', () => {
  it('сочетания', () => {
    expect(choose(22, 4)).toBe(7315)
    expect(choose(6, 4)).toBe(15)
    expect(choose(5, 4)).toBe(5)
    expect(choose(3, 5)).toBe(0)
  })

  // Те же цифры, что считает приложение друга (скриншот в задаче): карта с 4 умениями, шанс 1/4 на заточку.
  it('шанс поднять умение оставшимися заточками', () => {
    expect(atLeast(2, 0.25, 1)).toBeCloseTo(0.4375, 4) // ур. 3/4, осталось 2 → 43,8%
    expect(atLeast(3, 0.25, 1)).toBeCloseTo(0.578, 3) // осталось 3, до +1 → 57,8%
    expect(atLeast(3, 0.25, 2)).toBeCloseTo(0.156, 3) // до +2 → 15,6%
    expect(atLeast(1, 0.25, 1)).toBeCloseTo(0.25, 5) // Компас: осталась 1 → 25%
    expect(atLeast(0, 0.25, 1)).toBe(0)
    expect(atLeast(5, 0.25, 0)).toBe(1)
  })

  it('шанс новой карты с нужным набором', () => {
    expect(1 / pContainsAll(22, 4, 4)).toBeCloseTo(7315, 0)
    expect(1 / pContainsAll(6, 4, 4)).toBeCloseTo(15, 5)
    expect(pContainsAll(5, 4, 3)).toBeCloseTo(0.4, 5) // Колокол: нужны 3 из 5 → 40%
    // Набор + главное умение до ур. 3 / ур. 4 после 5 заточек: 1 из 19 922 и 1 из 70 666
    const set = pContainsAll(22, 4, 4)
    expect(Math.round(1 / (set * atLeast(5, 0.25, 2)))).toBe(19922)
    expect(Math.round(1 / (set * atLeast(5, 0.25, 3)))).toBe(70666)
  })

  it('понятная запись шанса', () => {
    expect(oneIn(1 / 7315)).toBe('1 из 7 315')
    expect(oneIn(0.4375)).toBe('43,8%')
    expect(oneIn(0)).toBe('никогда')
  })
})

describe('карты аркан', () => {
  it('тип, грейд и вариант по ID', () => {
    expect(arcanaInfo(810130002)).toMatchObject({ type: 'chalice', grade: 'unique', variant: 'magic', ru: 'Грааль магии' })
    expect(arcanaInfo(810530001)).toMatchObject({ type: 'mirror', grade: 'unique', variant: 'vigor', ru: 'Зеркало жизни' })
    expect(arcanaInfo(810560002)).toMatchObject({ type: 'mirror', grade: 'common' })
    expect(arcanaInfo(110230096)).toBeNull()
  })

  it('складывает уровни повторяющихся умений и раскладывает по нужности', () => {
    const char = makeTemplar()
    const card = analyzeArcanaCard(
      'templar',
      'chalice',
      char.gear.find((g) => g.slot === 41)!,
      templarPveMobalytics
    )
    const judgment = card.skills.find((s) => s.skill === 12240000)!
    expect(judgment.level).toBe(3)
    expect(judgment.cls).toBe('wanted')
    expect(card.skills.find((s) => s.skill === 12260000)!.cls).toBe('useless') // Снятие шока — в «бесполезных»
    expect(card.remaining).toBe(2)
    expect(card.main).toBe(12240000)
    expect(card.mainChances[0]).toMatchObject({ level: 4 })
    expect(card.mainChances[0].p).toBeCloseTo(0.4375, 4)
    expect(card.desired).toEqual([12240000, 12010000, 12040000, 12090000])
  })

  it('пустые слоты и сеты', () => {
    const report = analyzeArcana(makeTemplar(), templarPveMobalytics)
    expect(report.cards).toHaveLength(5)
    expect(report.cards.filter((c) => !c.item)).toHaveLength(4)
    expect(report.sets.find((s) => s.variant === 'magic')).toMatchObject({ count: 1, active: 0 })
    expect(report.levels.get(12240000)).toBe(3)
  })
})
