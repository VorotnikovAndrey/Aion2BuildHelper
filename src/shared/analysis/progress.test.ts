import { describe, expect, it } from 'vitest'
import { templarPveConsensus } from '../guide/builtin/templarPveConsensus'
import { createNamer } from '../names'
import { makeTemplar } from '../testing/fixtures'
import type { Character } from '../types'
import { analyzeBuild } from './build'
import { MAX_EVENTS, notificationText, progressEvents } from './progress'

const namer = createNamer('ru')
const guide = templarPveConsensus
const report = (c: Character) => analyzeBuild(c, guide, namer)
const JUDGMENT = 12240000
const ACCURACY = 318

describe('события прогресса', () => {
  it('без изменений — ничего', () => {
    const c = makeTemplar()
    expect(progressEvents(report(c), report(c), namer)).toEqual([])
  })

  it('порог меткости взят, Суд вырос, заточка выше', () => {
    const before = makeTemplar({
      stats: [
        { stat: 317, value: 1000 },
        { stat: ACCURACY, value: 700 }
      ]
    })
    const after = makeTemplar({
      stats: [
        { stat: 317, value: 1000 },
        { stat: ACCURACY, value: 820 }
      ]
    })
    after.skills = after.skills.map((s) => (s.skill === JUDGMENT ? { ...s, level: 19 } : s))
    after.gear = after.gear.map((g) => (g.slot === 1 ? { ...g, enchant: 11 } : g))
    const events = progressEvents(report(before), report(after), namer)
    const titles = events.map((e) => e.title)
    expect(titles).toContain('Порог взят: Меткость в PvE — Трансцендентность 4')
    expect(titles).toContain('Суд: ур. 18 → 19')
    expect(titles.some((t) => t.includes('заточка +10 → +11'))).toBe(true)
    expect(events.find((e) => e.kind === 'skill')?.skill).toBe(JUDGMENT)
  })

  it('умение дошло до уровня гайда', () => {
    const before = makeTemplar()
    const after = makeTemplar()
    after.skills = after.skills.map((s) => (s.skill === JUDGMENT ? { ...s, level: 20 } : s))
    const events = progressEvents(report(before), report(after), namer)
    expect(events.map((e) => e.title)).toContain('Суд — ур. 20, как в гайде')
  })

  it('не больше MAX_EVENTS; текст уведомления — главное и сколько ещё', () => {
    const many = Array.from({ length: 9 }, (_, i) => ({ id: String(i), kind: 'step' as const, title: `Шаг ${i}` }))
    expect(notificationText(many)).toEqual({ title: 'Шаг 0', body: 'Шаг 1\nШаг 2\nи ещё 6' })
    expect(notificationText([{ id: 'a', kind: 'score', title: 'Оценка билда 60 → 62', text: 'подробнее' }])).toEqual({
      title: 'Оценка билда 60 → 62',
      body: 'подробнее'
    })
    expect(notificationText([])).toBeNull()
    expect(MAX_EVENTS).toBeGreaterThan(3)
  })
})
