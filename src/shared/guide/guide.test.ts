import { describe, expect, it } from 'vitest'
import { arcanaPool } from '../gamedata/arcana'
import { classBoards } from '../gamedata/daevanion'
import { classOfSkill } from '../gamedata/classes'
import { skillDef, skillSpecs } from '../gamedata/skills'
import { statDef } from '../gamedata/stats'
import { BUILTIN_GUIDES, normalizeGuide } from './index'

describe('встроенные гайды ссылаются только на существующее', () => {
  for (const g of BUILTIN_GUIDES) {
    it(g.name, () => {
      for (const t of g.skills) {
        expect(skillDef(t.skill), `умение ${t.skill}`).toBeDefined()
        expect(classOfSkill(t.skill)).toBe(g.cls)
        const specs = skillSpecs(t.skill).map((s) => s.n)
        for (const n of [...(t.specs ?? []), ...(t.earlySpecs ?? [])]) expect(specs, `спец. ${n} у ${t.skill}`).toContain(n)
      }
      for (const w of [...g.stats, ...(g.manastones ?? [])]) expect(statDef(w.stat), `стат ${w.stat}`).toBeDefined()
      for (const s of g.gear.skills) expect(skillDef(s.skill)).toBeDefined()
      const pool = new Set([...arcanaPool(g.cls, 'chalice')])
      for (const s of [...g.arcana.attack, ...g.arcana.passive, ...g.arcana.useless]) expect(pool.has(s), `аркана ${s}`).toBe(true)
      const boards = new Set(classBoards(g.cls).map((b) => b.id))
      for (const goal of g.daevanion.goals) for (const b of goal.boards ?? []) expect(boards.has(b)).toBe(true)
    })
  }
})

describe('импорт гайда', () => {
  it('встроенный гайд переживает экспорт в JSON и обратно', () => {
    const g = BUILTIN_GUIDES[0]
    const back = normalizeGuide(JSON.parse(JSON.stringify(g)), 'x')
    expect(back.skills).toEqual(g.skills.map((s) => ({ ...s, level: s.level, specs: s.specs, earlySpecs: s.earlySpecs, equip: s.equip, note: s.note })))
    expect(back.stats).toEqual(g.stats)
    expect(back.daevanion.goals).toHaveLength(g.daevanion.goals.length)
    expect(back.builtin).toBeUndefined() // импортированный гайд всегда свой, его можно править
  })

  it('мусор отсекается, веса ограничиваются 0…5', () => {
    const g = normalizeGuide(
      { name: 'Мой', cls: 'TEMPLAR', skills: [{ skill: 12240000, role: 'wat' }, { foo: 1 }], stats: [{ stat: 317, weight: 9 }, { stat: 'x' }] },
      'id-1'
    )
    expect(g.id).toBe('id-1')
    expect(g.cls).toBe('templar')
    expect(g.skills).toEqual([{ skill: 12240000, role: 'support' }])
    expect(g.stats).toEqual([{ stat: 317, weight: 5 }])
    expect(g.mode).toBe('other')
  })

  it('понятные ошибки', () => {
    expect(() => normalizeGuide([], 'x')).toThrow(/JSON-объект/)
    expect(() => normalizeGuide({ name: 'a' }, 'x')).toThrow(/класс/)
    expect(() => normalizeGuide({ cls: 'templar' }, 'x')).toThrow(/названия/)
  })
})
