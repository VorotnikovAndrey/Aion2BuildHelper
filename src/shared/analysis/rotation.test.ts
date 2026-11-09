import { describe, expect, it } from 'vitest'
import { templarPveConsensus } from '../guide/builtin/templarPveConsensus'
import { normalizeGuide } from '../guide'
import { createNamer } from '../names'
import { makeTemplar } from '../testing/fixtures'
import type { Character } from '../types'
import { analyzeRotation, macroFits, pickStatHint } from './rotation'
import { analyzeSkills } from './skills'

const guide = templarPveConsensus
const namer = createNamer('ru')
const JUDGMENT = 12240000
const PUNISHMENT = 12090000
const TAUNT = 12120000
const COMBAT_SPEED = 282

function rotation(char: Character) {
  return analyzeRotation(char, guide, analyzeSkills(char, guide), false, namer)!
}

describe('ротация', () => {
  it('ячейка по уровню умения: до 16 и от 16', () => {
    const early = guide.combat!.macros!.find((m) => m.id === 'judgment-early')!
    const main = guide.combat!.macros!.find((m) => m.id === 'judgment')!
    expect(macroFits(early, 15)).toBe(true)
    expect(macroFits(early, 16)).toBe(false)
    expect(macroFits(main, 16)).toBe(true)
    expect(macroFits(main, 12)).toBe(false)
  })

  it('Суд ниже 16 — подходит ранняя ячейка, совет когда переходить', () => {
    const char = makeTemplar()
    char.skills = char.skills.map((s) => (s.skill === JUDGMENT ? { ...s, level: 12 } : s))
    const r = rotation(char)
    expect(r.macros.find((m) => m.macro.id === 'judgment-early')?.active).toBe(true)
    expect(r.macros.find((m) => m.macro.id === 'judgment')?.active).toBe(false)
    const tip = r.advice.find((a) => a.id === 'macro-judgment')!
    expect(tip.title).toContain('пока Суд ниже 16')
    expect(tip.text).toContain('ур. 12')
    expect(tip.text).toContain('С ур. 16')
  })

  it('Суд от 16 — основная ячейка, без совета о переходе', () => {
    const r = rotation(makeTemplar()) // Суд ур. 18
    expect(r.macros.find((m) => m.macro.id === 'judgment')?.active).toBe(true)
    expect(r.advice.some((a) => a.id.startsWith('macro-'))).toBe(false)
  })

  it('чего нет: неизученные умения и ненадетые стигмы', () => {
    const char = makeTemplar()
    char.skills.push({ skill: TAUNT, level: 5, equipped: false, specs: [] })
    const r = rotation(char)
    const missing = r.advice.find((a) => a.id === 'missing')!
    expect(missing.tone).toBe('bad') // Удара щитом нет — дыра в связке
    expect(missing.title).toContain('Удар щитом')
    expect(r.manual.find((m) => m.entry.skill === TAUNT)?.skill.use).toBe('unequipped')
    expect(r.advice.find((a) => a.id === 'unequipped')?.title).toBe('Стигма не надета: Провокация')
    // Запасные стигмы не требуются
    expect(missing.skills).not.toContain(12320000)
    expect(r.advice.some((a) => a.id === 'ready')).toBe(false)
  })

  it('подсказка по скорости боя для Кровавой мести', () => {
    const hint = guide.combat!.manual!.find((m) => m.skill === PUNISHMENT)!.byStat!
    expect(pickStatHint(hint, 1314)).toContain('быстрый каст')
    expect(pickStatHint(hint, 5500)).toContain('50–60%')
    expect(pickStatHint(hint, 6500)).toContain('полный заряд')

    const char = makeTemplar()
    char.skills.push({ skill: PUNISHMENT, level: 16, equipped: true, specs: [] })
    char.stats.push({ stat: COMBAT_SPEED, value: 1314 })
    const tip = rotation(char).advice.find((a) => a.id === `stat-${PUNISHMENT}`)!
    expect(tip.title).toBe('Кровавая месть: у вас СКР боя 13,14%')
    expect(tip.text).toContain('быстрый каст')
  })

  it('гайд без раздела «Бой» — разбора нет', () => {
    const char = makeTemplar()
    const plain = { ...guide, combat: undefined }
    expect(analyzeRotation(char, plain, analyzeSkills(char, plain), false, namer)).toBeNull()
  })

  it('раздел «Бой» переживает экспорт и импорт гайда', () => {
    const back = normalizeGuide(JSON.parse(JSON.stringify(guide)), 'x')
    expect(back.combat).toEqual(guide.combat)
    const broken = normalizeGuide({ ...JSON.parse(JSON.stringify(guide)), combat: { macros: [{ name: 'пусто', skills: [] }], delayMs: -5 } }, 'y')
    expect(broken.combat).toBeUndefined()
  })
})
