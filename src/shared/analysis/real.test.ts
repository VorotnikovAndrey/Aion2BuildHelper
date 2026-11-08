// Проверка на реальных данных: если положить свой characters.json в samples/private (не в git),
// тест разберёт персонажа и напечатает сводку. Без файла — пропускается.
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { templarPveMobalytics } from '../guide/builtin/templarPveMobalytics'
import { createNamer } from '../names'
import { parseQuestlogCharacters } from '../questlog/parse'
import { analyzeBuild } from './build'
import { learnGearOptions } from '../gamedata/gearOptions'

const file = resolve(import.meta.dirname, '../../../samples/private/characters.json')

describe.skipIf(!existsSync(file))('реальные данные (samples/private)', () => {
  it('разбирается без ошибок', () => {
    const data = parseQuestlogCharacters(JSON.parse(readFileSync(file, 'utf8')))
    const char = data.characters.find((c) => c.cls === 'templar')
    expect(char).toBeDefined()
    const n = createNamer('ru')
    const r = analyzeBuild(char!, templarPveMobalytics, n, { knownOptions: learnGearOptions(data.characters) })
    if (process.env.SHOW) {
      console.log(char!.name, r.scores)
      for (const s of r.steps) console.log(`[${s.impact}] ${s.title} — ${s.detail ?? ''}`)
      for (const c of r.arcana.cards) console.log(c.info?.ru, '+' + c.enchant, c.skills.map((s) => `${n.skill(s.skill).main}:${s.level}:${s.cls}`).join(' | '))
      for (const g of r.daevanion.goals) console.log(g.goal.name, g.done + '/' + g.required.length, 'осталось очков', g.remainingCost, 'закрыто', g.lockedCount)
      for (const s of r.skills.filter((x) => x.target))
        console.log(
          n.skill(s.skill).main,
          s.level,
          '/',
          s.targetLevel ?? '-',
          s.status,
          JSON.stringify(s.bonus),
          s.specs ? `спец ${s.specs.current}→${s.specs.wanted}` : ''
        )
    }
    expect(r.scores.overall).toBeGreaterThan(0)
  })
})
