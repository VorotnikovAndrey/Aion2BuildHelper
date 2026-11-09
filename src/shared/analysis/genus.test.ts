import { describe, expect, it } from 'vitest'
import { GENUS_MAX, genusGradeChances, genusLockFrom, genusRange, genusSlotRolls, genusStatChance } from '../gamedata/genus'
import { templarPveConsensus } from '../guide/builtin/templarPveConsensus'
import { makeTemplar } from '../testing/fixtures'
import { analyzeGenus } from './genus'

describe('таблица ячеек рода', () => {
  it('пределы стата по ячейке и грейду: Макс. АТК в ячейке 1 Разума', () => {
    expect(genusRange('intellect', 0, 4, 31)).toMatchObject({ min: 8, max: 16 })
    expect(genusRange('intellect', 0, 5, 31)).toMatchObject({ min: 10, max: 20 })
    // Во второй ячейке Разума атакующих статов нет — только защита
    expect(genusSlotRolls('intellect', 1).some((r) => r.stat === 31)).toBe(false)
  })

  it('шансы: грейды по уровню рода и шанс стата за анализ', () => {
    expect(genusGradeChances(10)).toEqual([20, 30, 30, 15, 5])
    expect(genusGradeChances(1)).toEqual([90, 10, 0, 0, 0])
    // Уникальная 15% × 10% + героическая 5% × 10%
    expect(genusStatChance('intellect', 0, 10, 31)).toBeCloseTo(2)
    expect(genusStatChance('intellect', 0, 3, 31)).toBe(0)
  })

  it('максимумы и порог «верх диапазона»', () => {
    expect(GENUS_MAX[19]).toBe(16) // Доп. АТК
    expect(GENUS_MAX[443]).toBe(300) // Сокрушающий удар 3%
    expect(genusLockFrom({ min: 8, max: 16 })).toBe(15)
  })
})

describe('разбор ячеек рода', () => {
  const char = makeTemplar({
    genus: [
      {
        genus: 'intellect',
        level: 10,
        effects: [
          { slot: 0, grade: 4, stat: 31, value: 12 },
          { slot: 1, grade: 1, stat: 396, value: 10 },
          { slot: 2, grade: 1, stat: 0, value: 0 }
        ]
      }
    ]
  })
  const [g] = analyzeGenus(char, templarPveConsensus).genuses

  it('значение в пределах грейда, порог и лучший случай в ячейке', () => {
    expect(g.slots[0]).toMatchObject({ range: { min: 8, max: 16 }, quality: 0.5, lockFrom: 15, slotMax: 20, empty: false })
  })

  it('перебросить — только на стат, который бывает в этой ячейке', () => {
    const t = g.slots[1].target!
    expect(t.inSlot).toBe(true)
    expect(genusSlotRolls('intellect', 1).map((r) => r.stat)).toContain(t.stat)
    expect(t.chance).toBeGreaterThan(0)
  })

  it('редкий стат (шанс меньше 1%) не советуем, если есть подходящий чаще', () => {
    for (const s of g.slots) if (s.target?.inSlot) expect(s.target.chance).toBeGreaterThanOrEqual(1)
  })

  it('пустая ячейка', () => {
    expect(g.slots[2]).toMatchObject({ empty: true, range: null, weight: 0 })
  })
})
