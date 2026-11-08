import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { allArtFiles, arcanaCardArt, frameArt, itemArt, pantheonArt, pantheonKind, stoneInfo } from './art'
import { gradeOfItem } from './slots'

describe('арт игры', () => {
  it('все файлы из art.json скачаны в public/art (npm run art)', () => {
    const publicDir = join(__dirname, '../../renderer/public')
    const missing = allArtFiles().filter((f) => !existsSync(join(publicDir, f)))
    expect(missing).toEqual([])
  })

  it('вещь из списка — с официальным названием и иконкой, грейд по ID', () => {
    const helmet = itemArt(210330053)!
    expect(helmet.ru).toBe('Шлем Нуакума')
    expect(helmet.src).toBe('./art/items/icon_equip_ar_l_idris_01_helmet.webp')
    expect(helmet.grade).toBe('unique')
    expect(itemArt(999999999)).toBeNull()
  })

  it('грейд из списка важнее цифры в ID (руны — «особые»)', () => {
    expect(gradeOfItem(310900001)).toBe('unknown')
    expect(itemArt(310900001)!.grade).toBe('special')
  })

  it('грейды по ID — как в игре: 4 — легендарный (синий), 5 — редкий (зелёный)', () => {
    expect(gradeOfItem(310440017)).toBe('legend')
    expect(gradeOfItem(310430046)).toBe('unique')
    expect(frameArt('legend')).toBe('./art/frames/ut_slotgrade_legend.webp')
    expect(frameArt('unknown')).toBe('./art/frames/ut_slotgrade_common.webp')
  })

  it('камни: маны — в броню и оружие, духовные — в украшения; качество по последней цифре', () => {
    expect(stoneInfo(531360004).ru).toBe('Качественный камень маны')
    expect(stoneInfo(531360003).ru).toBe('Средний камень маны')
    expect(stoneInfo(531360001).ru).toBe('Простой камень маны')
    expect(stoneInfo(533560004).ru).toBe('Качественный духовный камень')
    expect(stoneInfo(533560001)).toMatchObject({ ru: 'Простой духовный камень', kind: 'soul', quality: 1 })
  })

  it('карты аркан: «магия» — синий арт, «жизнь» — золотой', () => {
    expect(arcanaCardArt('chalice', 'magic')).toBe('./art/arcana/icon_arcana_card_grail_u_defenceset2.webp')
    expect(arcanaCardArt('mirror', 'vigor')).toBe('./art/arcana/icon_arcana_card_mirror_u_pveset2.webp')
  })

  it('пантеон: виды слотов и украшения по ID', () => {
    expect(pantheonKind(1)).toBe('painting')
    expect(pantheonKind(12)).toBe('painting')
    expect(pantheonKind(13)).toBe('statue')
    expect(pantheonKind(17)).toBe('colossus')
    expect(pantheonArt(54)?.ru).toBe('Драупнир')
    expect(pantheonArt(1)).toBeNull()
  })
})
