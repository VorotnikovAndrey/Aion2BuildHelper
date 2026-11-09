import { describe, expect, it } from 'vitest'
import { ATTRIBUTE_EFFECT, DEITIES } from './deities'
import { statByKey } from './stats'

describe('статы богов и характеристики', () => {
  it('у всех 10 богов окна игры есть стат и описание', () => {
    expect(DEITIES).toHaveLength(10)
    for (const d of DEITIES) {
      expect(statByKey(d.key), d.key).toBeDefined()
      expect(d.effect.length).toBeGreaterThan(10)
    }
  })

  it('шесть характеристик с описанием', () => {
    expect(Object.keys(ATTRIBUTE_EFFECT).sort()).toEqual(['agi', 'con', 'dex', 'int', 'str', 'wis'])
    for (const k of Object.keys(ATTRIBUTE_EFFECT)) expect(statByKey(k), k).toBeDefined()
  })
})
