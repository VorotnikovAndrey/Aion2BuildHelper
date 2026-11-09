// Любой класс должен работать так же, как страж: свой встроенный гайд, русские названия умений
// и специализаций, разбор персонажа, связка и сравнение с топом.

import { describe, expect, it } from 'vitest'
import { analyzeBuild } from '../../analysis/build'
import { compareWithTop } from '../../analysis/top'
import { CLASSES, classInfo, classOfSkill } from '../../gamedata/classes'
import { classBoards } from '../../gamedata/daevanion'
import { classSkills, skillDef, skillSpecs } from '../../gamedata/skills'
import { statDef } from '../../gamedata/stats'
import { titleDef } from '../../gamedata/titles'
import { topData } from '../../gamedata/top'
import { createNamer } from '../../names'
import { makeTemplar } from '../../testing/fixtures'
import type { Character, ClassKey } from '../../types'
import { BUILTIN_GUIDES, normalizeGuide } from '../index'
import type { Guide } from '../types'

const namer = createNamer('ru')

/** Тестовый персонаж класса: шмот и статы от тестового стража, умения — свои. */
function makeChar(cls: ClassKey): Character {
  const base = makeTemplar({ key: `1:${cls}`, name: cls, cls })
  return {
    ...base,
    skills: classSkills(cls, 'active')
      .slice(0, 8)
      .map((s) => ({ skill: s.id, level: 12, equipped: true, specs: [] }))
  }
}

/** Все ID умений, которые упоминает гайд. */
function guideSkillIds(g: Guide): number[] {
  const c = g.combat
  return [
    ...g.skills.map((s) => s.skill),
    ...g.gear.skills.map((s) => s.skill),
    ...g.arcana.attack,
    ...g.arcana.passive,
    ...g.arcana.useless,
    ...g.daevanion.goals.flatMap((d) => d.skills ?? []),
    ...(c?.macros ?? []).flatMap((m) => [...m.skills, ...(m.when ? [m.when.skill] : [])]),
    ...(c?.manual ?? []).map((m) => m.skill),
    ...(c?.opener ?? []).map((o) => o.skill)
  ]
}

function guideStatIds(g: Guide): number[] {
  return [...g.stats, ...(g.gear.weapon ?? []), ...(g.gear.armor ?? []), ...(g.gear.accessory ?? []), ...(g.manastones ?? []), ...(g.genus.stats ?? [])].map(
    (s) => s.stat
  )
}

describe.each(CLASSES.map((c) => [c.ru, c.key] as const))('%s', (_ru, cls) => {
  const guide = BUILTIN_GUIDES.find((g) => g.cls === cls)

  it('есть справочники: умения с русскими названиями, специализации, доски, топ-игроки', () => {
    const skills = classSkills(cls)
    expect(skills.length).toBeGreaterThan(20)
    expect(skills.filter((s) => !s.ru).map((s) => s.en)).toEqual([])
    expect(classBoards(cls).length).toBeGreaterThan(3)
    expect(classBoards(cls).map((b) => Math.floor(b.id / 10))).toEqual(classBoards(cls).map(() => classInfo(cls)!.boardPrefix))
    expect(topData(cls)?.skills.length).toBeGreaterThan(10)
  })

  it('у всех специализаций есть русский текст', () => {
    const missing = classSkills(cls)
      .flatMap((s) => skillSpecs(s.id).map((sp) => ({ s, sp })))
      .filter(({ sp }) => !sp.ru)
      .map(({ s, sp }) => `${s.id}/${sp.n}`)
    expect(missing).toEqual([])
  })

  it('есть встроенный гайд, и он ссылается только на существующие умения, специализации, статы и титулы этого класса', () => {
    expect(guide, `нет встроенного гайда для ${cls}`).toBeDefined()
    const g = guide!
    expect(g.builtin).toBe(true)
    for (const id of guideSkillIds(g)) {
      expect(skillDef(id), `умение ${id}`).toBeDefined()
      expect(classOfSkill(id), `умение ${id} — другого класса`).toBe(cls)
    }
    for (const t of g.skills) {
      const known = skillSpecs(t.skill).map((s) => s.n)
      for (const n of [...(t.specs ?? []), ...(t.earlySpecs ?? [])]) expect(known, `специализация ${t.skill}/${n}`).toContain(n)
    }
    for (const id of guideStatIds(g)) expect(statDef(id), `стат ${id}`).toBeDefined()
    for (const id of [...(g.titles?.attack ?? []), ...(g.titles?.defense ?? []), ...(g.titles?.utility ?? [])])
      expect(titleDef(id), `титул ${id}`).toBeDefined()
    expect(g.sources?.length ?? 0).toBeGreaterThan(1)
  })

  it('разбор персонажа, связка и сравнение с топом работают', () => {
    const char = makeChar(cls)
    const report = analyzeBuild(char, guide!, namer)
    expect(report.scores.overall).toBeGreaterThanOrEqual(0)
    expect(report.steps.length).toBeGreaterThan(0)
    if (guide!.combat?.macros?.length) expect(report.rotation?.macros.length).toBeGreaterThan(0)
    const cmp = compareWithTop(char, report, topData(cls)!)
    expect(cmp.skills.length).toBeGreaterThan(10)
  })

  it('гайд переживает экспорт и импорт', () => {
    const back = normalizeGuide(JSON.parse(JSON.stringify(guide)), 'x')
    expect(back.skills).toEqual(guide!.skills)
    expect(back.combat).toEqual(guide!.combat)
    expect(back.statTargets?.length).toBe(guide!.statTargets?.length)
  })
})
