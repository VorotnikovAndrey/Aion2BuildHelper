import { describe, expect, it } from 'vitest'
import { titleDef } from '../gamedata/titles'
import { templarPveConsensus } from '../guide/builtin/templarPveConsensus'
import { templarPveMobalytics } from '../guide/builtin/templarPveMobalytics'
import { makeTemplar } from '../testing/fixtures'
import { analyzeTitles, titleScore } from './titles'

describe('титулы', () => {
  it('справочник: бонусы в игровых ID, русские названия из клиента', () => {
    const saint = titleDef(12030003)!
    expect(saint.ru).toBe('Святой Бертрона')
    expect(saint.category).toBe('defense')
    expect(saint.grade).toBe('unique')
    // Доп. ЗЩТ 300, Стойкость к урону 3% (в сотых долях), Блок 100
    expect(saint.equip).toEqual([
      [52, 300],
      [70, 300],
      [255, 100]
    ])
  })

  it('надетые раскладываются по категориям, «при наличии» суммируется по всем собранным', () => {
    const char = { ...makeTemplar(), titles: [12030002, 12030003], ownedTitles: [12030002, 12030003, 13010010] }
    const r = analyzeTitles(char, templarPveMobalytics)
    expect(r.slots.map((s) => s.equipped?.id ?? null)).toEqual([12030002, 12030003, null])
    // ОЗ +120 от «Предстать перед истоком Кайсинеля», ОМ +20 от «Святого Бертрона», АТК в PvE +4
    expect(r.collection.get(193)).toBe(120)
    expect(r.collection.get(199)).toBe(20)
    expect(r.owned).toBe(3)
  })

  it('польза учитывает величину бонуса, а не только важность стата', () => {
    const weight = (stat: number) => (stat === 379 ? 5 : 0)
    // «+3% урона в PvE» слабее лучших титулов с тем же статом, но заметно полезнее, чем ничего
    const s = titleScore(titleDef(12030002)!, weight)
    expect(s).toBeGreaterThan(2)
    expect(s).toBeLessThan(5)
  })

  it('советует собранный титул, только если он заметно полезнее по гайду', () => {
    const char = { ...makeTemplar(), titles: [11010001], ownedTitles: [11010001, 12030002] }
    const attack = analyzeTitles(char, templarPveMobalytics).slots[0]
    expect(attack.equipped?.id).toBe(11010001)
    expect(attack.better?.title.id).toBe(12030002)
  })

  it('без гайда ничего не советует', () => {
    const char = { ...makeTemplar(), titles: [11010001], ownedTitles: [11010001, 12030002] }
    expect(analyzeTitles(char, null).slots[0].better).toBeNull()
  })

  it('если гайд называет титулы — совет по его списку, а лучший несобранный становится целью', () => {
    const char = {
      ...makeTemplar(),
      titles: [12030002, 12030003, 13010010],
      ownedTitles: [12030002, 12030003, 13010010, 12010061]
    }
    const [attack, defense, utility] = analyzeTitles(char, templarPveConsensus).slots
    // «Прошедший огонь и воду» уже собран и стоит в списке гайда первым
    expect(utility.better).toMatchObject({ title: { id: 12010061 }, reason: 'guide' })
    // «Святой Бертрона» — первый в списке защиты: менять нечего
    expect(defense.better).toBeNull()
    expect(defense.goal).toBeNull()
    // Лучшего атакующего титула ещё нет — он цель, а надетый остаётся
    expect(attack.better).toBeNull()
    expect(attack.goal?.id).toBe(13010021)
  })

  it('у цели — как её получить и сколько уже набрано', () => {
    const char = {
      ...makeTemplar(),
      titles: [12030002, 12030003, 13010010],
      ownedTitles: [12030002, 12030003, 13010010],
      genus: [
        { genus: 'intellect', level: 7, effects: [] },
        { genus: 'special', level: 9, effects: [] }
      ]
    }
    const [attack] = analyzeTitles(char, templarPveConsensus).slots
    expect(attack.goal?.id).toBe(13010021)
    expect(attack.goalHow?.achievement).toBe('Genus Genius')
    expect(attack.goalHow?.progress).toEqual({ current: 7, goal: 10 }) // самый низкий род — 7
  })
})
