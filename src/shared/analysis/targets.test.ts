import { describe, expect, it } from 'vitest'
import { templarPveConsensus } from '../testing/templarPveConsensus'
import { makeTemplar } from '../testing/fixtures'
import { analyzeGear } from './gear'
import { statTargetStatus, stoneWeightFn } from './targets'

const withStats = (stats: Record<number, number>) => ({
  ...makeTemplar(),
  stats: Object.entries(stats).map(([stat, value]) => ({ stat: Number(stat), value }))
})

describe('пороги статов', () => {
  it('меткость = базовая + доп. + в PvE; ближайший порог — Трансцендентность 4', () => {
    const t = statTargetStatus(withStats({ 318: 200, 104: 317, 110: 85 }), templarPveConsensus).find((x) => x.target.id === 'accuracy')!
    expect(t.current).toBe(602)
    expect(t.next?.value).toBe(800)
    expect(t.reached).toBeNull()
  })

  it('пока порог не взят, камни доп. меткости — важнее всего; взят — почти не нужны', () => {
    const low = stoneWeightFn(templarPveConsensus, statTargetStatus(withStats({ 104: 300 }), templarPveConsensus))(104)
    expect(low.weight).toBe(5)
    expect(low.reason).toMatch(/300 из 800/)
    const high = stoneWeightFn(templarPveConsensus, statTargetStatus(withStats({ 104: 1300 }), templarPveConsensus))(104)
    expect(high.weight).toBeLessThanOrEqual(2)
  })

  it('ориентиры «как у топ-стражей» не влияют на камни', () => {
    const t = statTargetStatus(withStats({ 1: 13 }), templarPveConsensus).find((x) => x.target.id === 'top-1')!
    expect(t.target.kind).toBe('top')
    expect(t.next?.value).toBe(53.9)
  })
})

describe('план по камням', () => {
  it('в меткость — столько слабых камней, сколько нужно до порога; остальные слабые — в АТК; блок остаётся', () => {
    const base = makeTemplar()
    const stone = (stat: number) => ({ stone: 531360001, stat, grade: 1 })
    const char = {
      ...withStats({ 318: 200, 104: 580 }), // 780: до 800 не хватает 20 ≈ 3 камня по ~9,5
      gear: [
        {
          ...base.gear[0],
          manastones: [stone(199), stone(116), stone(133), stone(199), stone(307), stone(255)]
        }
      ]
    }
    const [item] = analyzeGear(char, templarPveConsensus)
    const to = item.stoneSwaps.map((x) => `${x.from.stat}→${x.to}`)
    expect(to.filter((x) => x.endsWith('→104'))).toHaveLength(3)
    expect(to).toContain('307→317') // ЗЩТ (важность 2) — в АТК
    expect(to.some((x) => x.startsWith('255→'))).toBe(false) // блок (3) не трогаем
  })
})
