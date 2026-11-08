import { describe, expect, it } from 'vitest'
import { parseQuestlogCharacters } from './parse'

const sample = {
  characters: {
    '1:Hero': {
      name: 'Hero',
      server: 1,
      class: 'templar',
      level: 45,
      gearScore: 2600,
      combatPower: 130000,
      legion: 'LEGION',
      race: 'light',
      updatedAt: 5,
      gear: [
        {
          item: 810130002,
          slot: 41,
          enchant: 4,
          itemLevel: 84,
          stats: [],
          skills: [{ skill: 12760000, level: 1 }],
          manastones: [],
          godstones: []
        },
        { item: 110230096, slot: 1, enchant: 14, stats: [{ stat: 28, value: 594 }], manastones: [{ stone: 5, stat: 199, grade: 1 }] },
        { slot: 2 } // кривая запись — пропускаем
      ],
      daevanion: [{ board: 21, nodes: [210113, 'x'] }],
      genus: [
        {
          genus: 'special',
          level: 9,
          effects: [
            { slot: 1, grade: 4, option: 57, value: 81 },
            { slot: 0, grade: 4, option: 50, value: 15 }
          ]
        }
      ],
      skills: [{ skill: 12010000, level: 17, equipped: true, specializations: [1, 2] }],
      abyssSeason: { grade: 18, points: 100000, kills: 6, deaths: 36, assists: 22, rankChange: -7 },
      skins: [{}, {}],
      stats: [{ stat: 2, value: 53 }]
    },
    '1:Alt': { name: 'Alt', level: 1, gear: 'oops' }
  },
  roster: {
    '1:Hero': { name: 'Hero', server: 1, class: 'templar', gender: 'female', level: 45, combatPower: 130000, seenAt: 9 },
    '1:Alt': { name: 'Alt', class: 'elementalist', level: 1, combatPower: 10 },
    '1:Other': { name: 'Other', class: 'sorcerer', level: 16, combatPower: 5579 }
  }
}

describe('разбор файла Questlog', () => {
  it('персонажи и их разделы', () => {
    const { characters } = parseQuestlogCharacters(sample)
    const r = characters[0]
    expect(r.name).toBe('Hero')
    expect(r.cls).toBe('templar')
    expect(r.gender).toBe('female')
    expect(r.gear.map((g) => g.slot)).toEqual([1, 41]) // по порядку слотов, кривая запись выброшена
    expect(r.gear[0].manastones[0]).toEqual({ stone: 5, stat: 199, grade: 1 })
    expect(r.daevanion[0].nodes).toEqual([210113])
    expect(r.genus[0].effects.map((e) => e.slot)).toEqual([0, 1])
    expect(r.genus[0].effects[1]).toEqual({ slot: 1, grade: 4, stat: 57, value: 81 })
    expect(r.skills[0].specs).toEqual([1, 2])
    expect(r.abyss?.points).toBe(100000)
    expect(r.skinsOwned).toBe(2)
  })

  it('класс берётся из списка аккаунта, если в подробностях его нет; elementalist = заклинатель', () => {
    const { characters } = parseQuestlogCharacters(sample)
    const alt = characters.find((c) => c.name === 'Alt')!
    expect(alt.cls).toBe('spiritmaster')
    expect(alt.gear).toEqual([])
  })

  it('список аккаунта помечает, у кого есть подробности', () => {
    const { roster } = parseQuestlogCharacters(sample)
    expect(roster.map((r) => [r.name, r.hasDetails])).toEqual([
      ['Hero', true],
      ['Other', false],
      ['Alt', true]
    ])
  })

  it('не файл оверлея — понятная ошибка', () => {
    expect(() => parseQuestlogCharacters({ foo: 1 })).toThrow(/Questlog/)
    expect(() => parseQuestlogCharacters(null)).toThrow()
  })
})
