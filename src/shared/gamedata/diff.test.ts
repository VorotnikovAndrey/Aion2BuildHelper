import { describe, expect, it } from 'vitest'
import { currentSnapshot, diffGamedata, type GamedataSnapshot } from './diff'

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))

describe('проверка справочников после патча', () => {
  it('без изменений — пусто', () => {
    const cur = currentSnapshot('templar')
    expect(cur.skills.length).toBeGreaterThan(200)
    expect(cur.boards.length).toBeGreaterThan(3)
    expect(diffGamedata(cur, clone(cur), 'templar')).toEqual([])
  })

  it('новое умение, изменённая специализация, узел доски, пул арканы, топ', () => {
    const cur = currentSnapshot('templar')
    const fresh: GamedataSnapshot = clone(cur)
    fresh.skills.push({ id: 12999000, en: 'Holy Shield Wall', cls: 'templar', type: 'active', unlock: 45 })
    fresh.specs['12240000'] = fresh.specs['12240000'].map((s) => (s.n === 5 ? { ...s, level: 18 } : s))
    const board = fresh.boards[0]
    board.nodes = board.nodes.slice(0, -1)
    fresh.arcanaPools.templar.compass = [...(fresh.arcanaPools.templar.compass ?? []), 12999000]
    fresh.top = { ...fresh.top!, skills: fresh.top!.skills.map((s) => (s.skill === 12240000 ? { ...s, avgLevel: s.avgLevel + 1 } : s)) }

    const changes = diffGamedata(cur, fresh, 'templar')
    const texts = changes.map((c) => c.text)
    expect(texts).toContain('Новое умение: Holy Shield Wall')
    expect(texts).toContain('Суд: вариант 5 открывается на ур. 16 → 18')
    expect(texts.some((t) => /узлов \d+ → \d+/.test(t))).toBe(true)
    expect(texts.some((t) => t.startsWith('Карта compass: добавлены'))).toBe(true)
    expect(changes.find((c) => c.area === 'top')?.important).toBe(false)
    expect(changes.find((c) => c.area === 'skills')?.important).toBe(true)
  })
})
