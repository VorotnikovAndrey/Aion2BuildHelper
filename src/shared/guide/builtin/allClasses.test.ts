// Любой класс должен работать так же, как страж: встроенные гайды с Questlog (со стадиями),
// русские названия умений и специализаций, разбор персонажа на каждой стадии, сравнение с топом.

import { describe, expect, it } from 'vitest'
import { analyzeBuild } from '../../analysis/build'
import { compareWithTop } from '../../analysis/top'
import { CLASSES, classInfo, classOfSkill } from '../../gamedata/classes'
import { classBoards, findNode } from '../../gamedata/daevanion'
import { classSkills, skillDef, skillSpecs } from '../../gamedata/skills'
import { statByKey, statDef } from '../../gamedata/stats'
import { titleDef } from '../../gamedata/titles'
import { topData } from '../../gamedata/top'
import { createNamer } from '../../names'
import { makeTemplar } from '../../testing/fixtures'
import type { Character, ClassKey } from '../../types'
import { BUILTIN_GUIDES, normalizeGuide } from '../index'
import { applyStage } from '../stages'
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

/** Все ID умений, которые упоминает гайд (с учётом стадий). */
function guideSkillIds(g: Guide): number[] {
  const views = [g, ...(g.stages ?? []).map((s) => applyStage(g, s))]
  return views.flatMap((v) => [
    ...v.skills.map((s) => s.skill),
    ...v.gear.skills.map((s) => s.skill),
    ...v.arcana.attack,
    ...v.arcana.passive,
    ...v.daevanion.goals.flatMap((d) => d.skills ?? []),
    ...(v.combat?.macros ?? []).flatMap((m) => m.skills)
  ])
}

const byClass = (cls: ClassKey) => BUILTIN_GUIDES.filter((g) => g.cls === cls)

describe.each(CLASSES.map((c) => [c.ru, c.key] as const))('%s', (_ru, cls) => {
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

  it('встроенные гайды — 5 популярных билдов Questlog для PvE и до 5 для PvP, по убыванию лайков, со стадиями', () => {
    const all = byClass(cls).filter((g) => g.source?.kind === 'questlog')
    const pve = all.filter((g) => g.mode === 'pve')
    const pvp = all.filter((g) => g.mode === 'pvp')
    expect(pve.length).toBe(5)
    expect(pvp.length).toBeGreaterThan(0)
    expect(pvp.length).toBeLessThanOrEqual(5)
    expect(all.length).toBe(pve.length + pvp.length)
    // PvE — первыми: первый подходящий гайд класса — гайд по умолчанию.
    expect(all[0].mode).toBe('pve')
    for (const guides of [pve, pvp]) {
      const likes = guides.map((g) => g.source?.likes ?? 0)
      expect(likes).toEqual([...likes].sort((a, b) => b - a))
    }
    expect(new Set(all.map((g) => g.id)).size).toBe(all.length)
    for (const g of all) {
      expect(g.builtin).toBe(true)
      expect(g.source?.kind).toBe('questlog')
      expect(g.source?.url).toMatch(/^https:\/\/questlog\.gg\/aion-2\//)
      expect(g.stages?.length, g.name).toBeGreaterThan(0)
      // Советы автора — с текстом и ссылками только на стадии этого гайда.
      const ids = new Set(g.stages?.map((s) => s.id))
      for (const tip of g.tips ?? []) {
        expect(tip.text.trim().length, g.name).toBeGreaterThan(0)
        for (const st of tip.stages ?? []) expect(ids.has(st), `${g.name}: совет к стадии ${st}`).toBe(true)
      }
    }
  })

  it('PvP-гайды из интернета: до 3, не Questlog, со ссылкой на статью, с умениями и статами', () => {
    const web = byClass(cls).filter((g) => g.source?.kind !== 'questlog')
    expect(web.length).toBeLessThanOrEqual(3)
    // После билдов Questlog: гайд по умолчанию — PvE-билд Questlog.
    expect(byClass(cls)[0].source?.kind).toBe('questlog')
    for (const g of web) {
      expect(g.mode, g.name).toBe('pvp')
      expect(g.source?.kind, g.name).toBe('guide')
      expect(g.source?.url, g.name).toMatch(/^https?:\/\//)
      expect(g.source?.url, g.name).not.toMatch(/questlog\.gg/)
      expect(g.skills.filter((s) => s.role === 'core').length, g.name).toBeGreaterThan(0)
      expect(g.stats.length, g.name).toBeGreaterThan(2)
      expect(
        g.stats.every((s) => statDef(s.stat)),
        g.name
      ).toBe(true)
    }
    expect(new Set(web.map((g) => g.id)).size).toBe(web.length)
  })

  it('PvP-гайды берут ориентир меткости в PvP, а не в PvE', () => {
    for (const g of byClass(cls).filter((x) => x.mode === 'pvp'))
      for (const st of g.stages ?? []) {
        const acc = st.statTargets?.find((x) => x.id === 'stage-accuracy')
        if (acc) expect(acc.stats).toContain(statByKey('pvpaccuracy')!.id)
      }
  })

  it('гайды ссылаются только на существующие умения своего класса, специализации, статы, титулы и узлы', () => {
    for (const g of byClass(cls)) {
      for (const id of guideSkillIds(g)) {
        expect(skillDef(id), `${g.name}: умение ${id}`).toBeDefined()
        expect(classOfSkill(id), `${g.name}: умение ${id} — другого класса`).toBe(cls)
      }
      for (const st of [g, ...(g.stages ?? [])]) {
        for (const t of st.skills ?? []) {
          const known = skillSpecs(t.skill).map((s) => s.n)
          for (const n of t.specs ?? []) expect(known, `${g.name}: специализация ${t.skill}/${n}`).toContain(n)
        }
        for (const id of [...(st.titles?.attack ?? []), ...(st.titles?.defense ?? []), ...(st.titles?.utility ?? [])])
          expect(titleDef(id), `${g.name}: титул ${id}`).toBeDefined()
        for (const goal of st.daevanion?.goals ?? []) for (const n of goal.nodes ?? []) expect(findNode(n), `${g.name}: узел ${n}`).toBeDefined()
      }
      for (const w of [...g.stats, ...(g.manastones ?? [])]) expect(statDef(w.stat), `${g.name}: стат ${w.stat}`).toBeDefined()
    }
  })

  it('разбор персонажа работает на каждой стадии каждого гайда, сравнение с топом — тоже', () => {
    const char = makeChar(cls)
    for (const g of byClass(cls)) {
      // Гайд без стадий (из статьи) — разбор по самому гайду.
      if (!g.stages?.length) expect(analyzeBuild(char, g, namer).scores.overall, g.name).toBeGreaterThanOrEqual(0)
      for (const st of g.stages ?? []) {
        const report = analyzeBuild(char, applyStage(g, st), namer)
        expect(report.scores.overall, `${g.name} / ${st.name}`).toBeGreaterThanOrEqual(0)
      }
    }
    const report = analyzeBuild(char, byClass(cls)[0], namer)
    expect(compareWithTop(char, report, topData(cls)!).skills.length).toBeGreaterThan(10)
  })

  it('гайды переживают экспорт и импорт вместе со стадиями', () => {
    for (const g of byClass(cls)) {
      const back = normalizeGuide(JSON.parse(JSON.stringify(g)), 'x')
      expect(back.stages).toEqual(g.stages)
      expect(back.skills).toEqual(g.skills)
    }
  })
})
