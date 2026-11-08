// Тестовый персонаж-страж: небольшой, но со всеми разделами. Не реальные данные игрока.

import type { Character } from '../types'

export function makeTemplar(overrides: Partial<Character> = {}): Character {
  return {
    key: '1:Tester',
    name: 'Tester',
    server: 1,
    cls: 'templar',
    level: 45,
    gearScore: 2000,
    combatPower: 100_000,
    updatedAt: 1_000,
    gear: [
      {
        slot: 1,
        item: 110230096,
        enchant: 10,
        surpass: 0,
        itemLevel: 90,
        // Атака (317) — нужна, Уклонение (312) — бесполезно по встроенному гайду
        stats: [
          { stat: 317, value: 40 },
          { stat: 312, value: 20 }
        ],
        soulStats: [],
        skills: [],
        manastones: [
          { stone: 1, stat: 317, grade: 2 },
          { stone: 1, stat: 116, grade: 1 }
        ],
        godstones: []
      },
      {
        slot: 41,
        item: 810130002, // Грааль магии, уникальная
        enchant: 3,
        surpass: 0,
        itemLevel: 80,
        stats: [],
        soulStats: [],
        skills: [
          { skill: 12240000, level: 1 },
          { skill: 12010000, level: 1 },
          { skill: 12780000, level: 1 },
          { skill: 12260000, level: 1 },
          { skill: 12240000, level: 2 },
          { skill: 12010000, level: 1 }
        ],
        manastones: [],
        godstones: []
      }
    ],
    daevanion: [{ board: 21, nodes: [210113, 210115, 210128, 210127, 210142] }],
    pets: [
      { pet: 1001, level: 3 },
      { pet: 1002, level: 1 },
      { pet: 1003, level: 2 }
    ],
    titles: [],
    ownedTitles: [1, 2],
    skinsOwned: 0,
    monoliths: [],
    pantheon: [],
    wings: [],
    genus: [
      {
        genus: 'intellect',
        level: 3,
        effects: [
          { slot: 0, grade: 3, stat: 128, value: 15 },
          { slot: 1, grade: 3, stat: 116, value: 10 }
        ]
      }
    ],
    skills: [
      { skill: 12240000, level: 18, equipped: true, specs: [1, 2] },
      { skill: 12010000, level: 14, equipped: true, specs: [3] },
      { skill: 12070000, level: 1, equipped: true, specs: [] },
      { skill: 12780000, level: 10, equipped: false, specs: [] }
    ],
    stats: [{ stat: 317, value: 1000 }],
    ...overrides
  }
}
