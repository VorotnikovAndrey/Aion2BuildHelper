import { describe, expect, it } from 'vitest'
import { classBoards, routeTo } from '../gamedata/daevanion'
import { templarPveMobalytics } from '../guide/builtin/templarPveMobalytics'
import { createNamer } from '../names'
import { makeTemplar } from '../testing/fixtures'
import { analyzeBuild } from './build'
import { analyzeDaevanion } from './daevanion'
import { analyzeGear, planSwaps, type GearLine } from './gear'
import { analyzeGenus } from './genus'
import { describeChange, diffCharacters } from './history'
import { analyzePets } from './pets'
import { analyzeSkills, checkSpecs, skillBonuses, stigmaLoadout, unexplainedLevels } from './skills'

const guide = templarPveMobalytics
const namer = createNamer('ru')

describe('умения', () => {
  it('бонусные уровни с досок и аркан', () => {
    const b = skillBonuses(makeTemplar())
    expect(b.get(12240000)).toEqual({ daevanion: 0, arcana: 3, gear: 0 })
    expect(b.get(12780000)?.arcana).toBe(1)
  })

  it('специализации: что поставить на текущем уровне', () => {
    const judgment = guide.skills.find((s) => s.skill === 12240000)!
    // ур. 18 → 2 слота, вариант 5 открыт с 16
    expect(checkSpecs(judgment, 18, [1, 2])).toMatchObject({ slots: 2, wanted: [5, 3], missing: [5, 3], extra: [1, 2], ok: false })
    // ур. 12 → 2 слота, но вариант 5 ещё закрыт → берём запасной 3
    expect(checkSpecs(judgment, 12, [3])).toMatchObject({ slots: 2, wanted: [3], missing: [], ok: true, locked: [{ n: 5, level: 16 }] })
    expect(checkSpecs(judgment, 5, [])).toMatchObject({ slots: 0, wanted: [], ok: true })
  })

  it('отчёт: главные умения первыми, статусы', () => {
    const reports = analyzeSkills(makeTemplar(), guide)
    expect(reports[0].role).toBe('core')
    const judgment = reports.find((r) => r.skill === 12240000)!
    expect(judgment.status).toBe('progress') // уровень есть, специализации не те
    expect(judgment.base).toBe(15)
    const pummel = reports.find((r) => r.skill === 12040000)!
    expect(pummel.status).toBe('missing')
  })

  it('стигмы: чего не хватает', () => {
    const s = stigmaLoadout(makeTemplar(), guide)
    expect(s.equipped).toEqual([12070000])
    expect(s.missing).toEqual(expect.arrayContaining([12110000, 12230000, 12450000]))
    expect(s.extra).toEqual([])
  })
})

describe('шмот', () => {
  it('полезные и бесполезные строки, что ловить', () => {
    const [weapon] = analyzeGear(makeTemplar(), guide)
    expect(weapon.slot).toBe(1)
    expect(weapon.useful).toBe(1)
    expect(weapon.total).toBe(2)
    expect(weapon.replace.map((l) => l.id)).toEqual([312])
    expect(weapon.wishlist.every((w) => w.weight >= 4)).toBe(true)
    expect(weapon.wishlist.some((w) => w.id === 317)).toBe(false) // уже есть
    expect(weapon.manastones.map((m) => m.verdict)).toEqual(['great', 'bad'])
  })

  it('без гайда всё считается бесполезным, но не падает', () => {
    const [weapon] = analyzeGear(makeTemplar(), null)
    expect(weapon.score).toBe(0)
  })
})

describe('Даэванион', () => {
  const boards = classBoards('templar')

  it('данные досок стража загружены', () => {
    expect(boards.map((b) => b.en)).toEqual(['Nezekan', 'Zikel', 'Vaizel', 'Triniel', 'Ariel', 'Azphel'])
  })

  it('путь до узла считается от уже взятых', () => {
    const nezekan = boards[0]
    // Соседний со стартом узел (8:10 → 8:9 нет, 7:8 — да) стоит свою цену
    const near = routeTo(nezekan, new Set(), 210098)
    expect(near).toEqual({ cost: 1, path: [210098] })
    expect(routeTo(nezekan, new Set([210098]), 210098)).toEqual({ cost: 0, path: [] })
    const far = routeTo(nezekan, new Set(), 210033)!
    expect(far.cost).toBeGreaterThan(4)
    expect(far.path[far.path.length - 1]).toBe(210033)
  })

  it('цели гайда: что взято и план', () => {
    const r = analyzeDaevanion(makeTemplar(), guide)
    expect(r.available).toBe(true)
    expect(r.boards[0].takenCount).toBe(4)
    const early = r.goals[0]
    expect(early.required).toHaveLength(16) // 4 умения × 4 доски
    expect(early.done).toBe(0)
    expect(early.plan.length).toBe(16)
    expect(early.plan[0].cost).toBeLessThanOrEqual(early.plan[early.plan.length - 1].cost)
    expect(r.stats.size).toBeGreaterThan(0)
  })
})

describe('род, питомцы, итог', () => {
  it('познание рода', () => {
    const g = analyzeGenus(makeTemplar(), guide)
    expect(g.genuses[0].useful).toBe(1)
    expect(g.genuses[0].reroll.map((s) => s.stat)).toEqual([116])
  })

  it('питомцы', () => {
    expect(analyzePets(makeTemplar())).toMatchObject({ owned: 3, maxed: 1, levelsLeft: 3, progress: 67 })
  })

  it('полный разбор и шаги', () => {
    const r = analyzeBuild(makeTemplar(), guide, namer)
    expect(r.scores.overall).toBeGreaterThan(0)
    expect(r.scores.overall).toBeLessThan(100)
    expect(r.steps[0].impact).toBe('high')
    expect(r.steps.some((s) => s.id === 'spec-12240000')).toBe(true)
    expect(r.steps.find((s) => s.id === 'spec-12240000')!.title).toContain('Убирает перезарядку')
  })

  it('без гайда шагов нет', () => {
    expect(analyzeBuild(makeTemplar(), null, namer).steps).toEqual([])
  })
})

describe('история', () => {
  it('замечает заточку, уровни и новые узлы', () => {
    const a = makeTemplar()
    const b = makeTemplar({
      combatPower: 101_000,
      gear: a.gear.map((g) => (g.slot === 1 ? { ...g, enchant: 11 } : g)),
      skills: a.skills.map((s) => (s.skill === 12010000 ? { ...s, level: 15 } : s)),
      daevanion: [{ board: 21, nodes: [...a.daevanion[0].nodes, 210098] }]
    })
    const changes = diffCharacters(a, b)
    expect(changes.map((c) => c.kind)).toEqual(['cp', 'skill', 'enchant', 'daevanion'])
    expect(describeChange(changes[0], namer)).toEqual({ text: 'Боевая мощь 100 000 → 101 000 (+1 000)', good: true })
    expect(describeChange(changes[2], namer).text).toBe('Блестящий длинный меч Короля истинных драконов: заточка +10 → +11')
  })

  it('одинаковые снимки — без изменений', () => {
    expect(diffCharacters(makeTemplar(), makeTemplar())).toEqual([])
  })
})

describe('устаревшие доски в файле оверлея', () => {
  it('уровень выше, чем объясняют очки (до 10) и бонусы, — значит, доски в файле старые', () => {
    const base = makeTemplar()
    // Суд: очки 10 + доска 1 (узел 210050) + арканы — ровно объясняется
    const ok = { ...base, daevanion: [{ board: 21, nodes: [210113, 210050] }], skills: [{ skill: 12240000, level: 11 + 3, equipped: true, specs: [] }] }
    expect(unexplainedLevels(ok)).toEqual([])
    // Тот же персонаж, но уровень на 1 выше — узла, который его даёт, в файле нет
    const stale = { ...ok, skills: [{ skill: 12240000, level: 15, equipped: true, specs: [] }] }
    expect(unexplainedLevels(stale)).toEqual([{ skill: 12240000, level: 15, explained: 14 }])
  })

  it('стигмы не проверяются: их уровни — из своих очков', () => {
    const char = { ...makeTemplar(), skills: [{ skill: 12070000, level: 20, equipped: true, specs: [] }] }
    expect(unexplainedLevels(char)).toEqual([])
  })
})

describe('цель по вещи: что на что перековать', () => {
  const line = (id: number, weight: number, kind: 'stat' | 'skill' = 'stat'): GearLine => ({ kind, id, value: 1, weight, verdict: 'good' })

  it('самая слабая строка — на самый важный стат слота, пока выигрыш не меньше 2', () => {
    // Оружие: урон 5, АТК 5, крит 4, блок 3; на слоте бывают СКР боя 5 и Мощь 4
    const lines = [line(28, 5), line(317, 5), line(128, 4), line(255, 3)]
    const swaps = planSwaps(
      lines,
      [
        { kind: 'stat', id: 1, weight: 4 },
        { kind: 'stat', id: 282, weight: 5 }
      ],
      []
    )
    expect(swaps.map((x) => [x.from.id, x.to.id])).toEqual([[255, 282]]) // Блок → СКР боя; крит 4 → Мощь 4 не выигрыш
  })

  it('стат меняется на стат, умение — на умение', () => {
    const swaps = planSwaps([line(52, 1), line(12720000, 1, 'skill')], [{ kind: 'stat', id: 317, weight: 5 }], [{ kind: 'skill', id: 12780000, weight: 5 }])
    expect(swaps.map((x) => `${x.from.kind}:${x.from.id}→${x.to.id}`)).toEqual(['stat:52→317', 'skill:12720000→12780000'])
  })

  it('без кандидатов замен нет', () => {
    expect(planSwaps([line(52, 0)], [], [])).toEqual([])
  })
})
