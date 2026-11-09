import { describe, expect, it } from 'vitest'
import { templarPveConsensus } from '../guide/builtin/templarPveConsensus'
import type { InputEvent } from '../guide/types'
import { analyzeInputMacro, keyIntervals } from './inputMacro'

const ev = (key: string, down: boolean, waitMs: number): InputEvent => ({ key, down, waitMs })

describe('макрос мыши', () => {
  it('ПКМ↓ 10 ЛКМ↓ 10 ЛКМ↑ 10 ПКМ↑, автоповтор 10: цикл 40 мс, ЛКМ — 10 мс', () => {
    const r = analyzeInputMacro([ev('ПКМ', true, 10), ev('ЛКМ', true, 10), ev('ЛКМ', false, 10), ev('ПКМ', false, 0)], 10, 'ПКМ')
    expect(r.cycleMs).toBe(40)
    const rmb = r.keys.find((k) => k.key === 'ПКМ')!
    const lmb = r.keys.find((k) => k.key === 'ЛКМ')!
    expect(rmb).toMatchObject({ holdMs: 30, gapMs: 10, pressesPerSec: 25, stuck: false })
    expect(lmb).toMatchObject({ holdMs: 10, gapMs: 30, pressesPerSec: 25 })
    expect(r.warnings.map((w) => w.kind).sort()).toEqual(['macro-release', 'short-hold'])
    expect(r.warnings.find((w) => w.kind === 'short-hold')?.text).toContain('меньше одного кадра')
    expect(r.warnings.find((w) => w.kind === 'macro-release')?.text).toContain('25 раз в секунду на 10 мс')
  })

  it('ЛКМ 20 мс и пауза 35 мс — без предупреждения о коротком нажатии', () => {
    const r = analyzeInputMacro([ev('ПКМ', true, 10), ev('ЛКМ', true, 20), ev('ЛКМ', false, 35), ev('ПКМ', false, 0)], 10, 'ПКМ')
    expect(r.cycleMs).toBe(75)
    expect(r.keys.find((k) => k.key === 'ЛКМ')).toMatchObject({ holdMs: 20, gapMs: 55 })
    expect(r.keys.find((k) => k.key === 'ПКМ')).toMatchObject({ holdMs: 65, gapMs: 10 })
    expect(r.warnings.map((w) => w.kind)).toEqual(['macro-release'])
  })

  it('несколько кликов за прогон и незакрытое нажатие', () => {
    const r = analyzeInputMacro([ev('ЛКМ', true, 20), ev('ЛКМ', false, 30), ev('ЛКМ', true, 20), ev('ЛКМ', false, 30), ev('1', true, 0)], 0)
    expect(r.cycleMs).toBe(100)
    expect(r.keys.find((k) => k.key === 'ЛКМ')).toMatchObject({ presses: 2, holdMs: 20, gapMs: 30, pressesPerSec: 20 })
    expect(r.warnings.find((w) => w.key === '1')?.kind).toBe('stuck')
  })
})

describe('«одна кнопка» в сводном гайде', () => {
  it('без коротких нажатий и залипаний — только напоминание про клавишу связки', () => {
    const c = templarPveConsensus.combat!
    const r = analyzeInputMacro(c.oneButton!.events, c.oneButton!.repeatMs, c.macroKey)
    expect(r.warnings.map((w) => w.kind)).toEqual(['macro-release'])
    // Последний шаг связки — ячейка Суда (в ней всегда готов Град ударов).
    const steps = c.macros!.filter((m) => !m.when || m.when.minLevel !== undefined)
    expect(steps[steps.length - 1].id).toBe('judgment')
  })
})

describe('схема нажатий', () => {
  it('два прогона ПКМ↓ 10 ЛКМ↓ 10 ЛКМ↑ 10 ПКМ↑, автоповтор 10', () => {
    const r = keyIntervals([ev('ПКМ', true, 10), ev('ЛКМ', true, 10), ev('ЛКМ', false, 10), ev('ПКМ', false, 0)], 10)
    expect(r).toMatchObject({ cycleMs: 40, totalMs: 80, keys: ['ПКМ', 'ЛКМ'] })
    expect(r.intervals.filter((i) => i.key === 'ПКМ')).toEqual([
      { key: 'ПКМ', start: 0, end: 30 },
      { key: 'ПКМ', start: 40, end: 70 }
    ])
    expect(r.intervals.filter((i) => i.key === 'ЛКМ').map((i) => [i.start, i.end])).toEqual([
      [10, 20],
      [50, 60]
    ])
  })
})
