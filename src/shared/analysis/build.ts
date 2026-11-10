// Полный разбор персонажа по гайду: оценки разделов и список «что сделать дальше».

import { ARCANA_TYPES } from '../gamedata/arcana'
import type { Guide } from '../guide/types'
import type { Namer } from '../names'
import type { Character } from '../types'
import { analyzeArcana, oneIn, type ArcanaReport } from './arcana'
import { analyzeDaevanion, type DaevanionReport } from './daevanion'
import { analyzeGear, gearScore, type ItemReport } from './gear'
import { analyzeGenus } from './genus'
import { analyzePets, type PetsReport } from './pets'
import { analyzeRotation, type RotationReport } from './rotation'
import { analyzeSkills, skillsScore, specsLookLikeSlots, stigmaLoadout, unexplainedLevels, type SkillReport, type UnexplainedLevel } from './skills'
import { statTargetStatus, type TargetStatus } from './targets'
import { analyzeTitles, type TitlesReport } from './titles'
import type { KnownOptions } from '../gamedata/gearOptions'
import { t } from '../i18n'
import { term } from '../names'

export type StepArea = 'skills' | 'stigmas' | 'gear' | 'arcana' | 'daevanion' | 'genus'
export type Impact = 'high' | 'medium' | 'low'

export interface NextStep {
  id: string
  area: StepArea
  impact: Impact
  title: string
  detail?: string
  /** Умение, о котором шаг (для иконки в интерфейсе). */
  skill?: number
}

export interface SectionScores {
  skills: number
  gear: number
  arcana: number
  daevanion: number
  genus: number
  overall: number
}

export interface BuildReport {
  guide: Guide | null
  /** Оверлей, похоже, не знает выбранных специализаций (см. specsLookLikeSlots). */
  specsUncertain: boolean
  /** Уровни умений, которые не объясняются видимыми досками, — доски в файле, похоже, устарели. */
  boardsStale: UnexplainedLevel[]
  skills: SkillReport[]
  stigmas: ReturnType<typeof stigmaLoadout>
  gear: ItemReport[]
  arcana: ArcanaReport
  genus: ReturnType<typeof analyzeGenus>
  daevanion: DaevanionReport
  pets: PetsReport
  titles: TitlesReport
  /** Пороги статов из гайда и где персонаж сейчас. */
  statTargets: TargetStatus[]
  /** Стопки макроса, ручные умения и личные советы по ротации (если в гайде есть раздел «Бой»). */
  rotation: RotationReport | null
  scores: SectionScores
  steps: NextStep[]
}

/** Веса разделов в общей оценке. Умения и доски решают больше всего — так и в гайдах. */
export const SECTION_WEIGHTS: Record<keyof Omit<SectionScores, 'overall'>, number> = {
  skills: 0.35,
  daevanion: 0.2,
  gear: 0.2,
  arcana: 0.15,
  genus: 0.1
}

export interface BuildOptions {
  /** Специализации, отмеченные игроком вручную. */
  manualSpecs?: Record<number, number[]>
  /** Какие статы встречаются на слотах (для «что ловить»). */
  knownOptions?: KnownOptions
}

export function analyzeBuild(char: Character, guide: Guide | null, namer: Namer, opts: BuildOptions = {}): BuildReport {
  const specsUncertain = specsLookLikeSlots(char)
  const skills = analyzeSkills(char, guide, opts.manualSpecs, specsUncertain)
  const stigmas = stigmaLoadout(char, guide)
  const gear = analyzeGear(char, guide, opts.knownOptions)
  const arcana = analyzeArcana(char, guide)
  const genus = analyzeGenus(char, guide)
  const daevanion = analyzeDaevanion(char, guide)
  const pets = analyzePets(char)
  const titles = analyzeTitles(char, guide)

  const parts = {
    skills: skillsScore(skills),
    gear: gearScore(gear),
    arcana: arcana.score,
    daevanion: daevanion.score,
    genus: genus.score
  }
  const overall = Math.round((Object.keys(parts) as (keyof typeof parts)[]).reduce((s, k) => s + parts[k] * SECTION_WEIGHTS[k], 0))

  const report: BuildReport = {
    guide,
    specsUncertain,
    boardsStale: unexplainedLevels(char),
    skills,
    stigmas,
    gear,
    arcana,
    genus,
    daevanion,
    pets,
    titles,
    statTargets: statTargetStatus(char, guide),
    rotation: analyzeRotation(char, guide, skills, specsUncertain, namer),
    scores: { ...parts, overall },
    steps: []
  }
  report.steps = guide ? nextSteps(report, namer) : []
  return report
}

const IMPACT_ORDER: Record<Impact, number> = { high: 0, medium: 1, low: 2 }

function nextSteps(r: BuildReport, n: Namer): NextStep[] {
  const steps: NextStep[] = []
  const name = (id: number) => n.skill(id).main
  const specList = (skill: number, list: number[]) => list.map((x) => t('{x} «{spec}»', { x, spec: n.spec(skill, x).main })).join(', ')

  // ── Умения: специализации и уровни
  // Если оверлей не знает выбранных вариантов, не дублируем десять одинаковых пунктов —
  // собираем «проверьте специализации» в один пункт для главных умений и один для остальных.
  const unsureSpecs: { core: string[]; other: string[] } = { core: [], other: [] }
  for (const s of r.skills) {
    if (!s.target || !s.learned) continue
    const important = s.role === 'core'
    if (s.specs && s.specs.missing.length) {
      const unsure = r.specsUncertain && s.specsSource === 'overlay'
      if (unsure) {
        unsureSpecs[important ? 'core' : 'other'].push(`${name(s.skill)} — ${s.specs.wanted.join(t(' и '))}`)
      } else {
        steps.push({
          id: `spec-${s.skill}`,
          skill: s.skill,
          area: 'skills',
          impact: important ? 'high' : 'medium',
          title: t('{name}: поставить {p} {specList}', {
            name: name(s.skill),
            p: s.specs.missing.length > 1 ? t('специализации') : t('специализацию'),
            specList: specList(s.skill, s.specs.missing)
          }),
          detail:
            (s.specs.current.length ? t('Сейчас: {specs}. ', { specs: s.specs.current.join(', ') }) : t('Сейчас специализаций нет. ')) +
            t('Уровень {level} — слотов: {slots}.', { level: s.level, slots: s.specs.slots })
        })
      }
    }
    if (s.levelGap > 0 && s.role !== 'stigma') {
      const nextLock = s.specs?.locked[0]
      steps.push({
        id: `lvl-${s.skill}`,
        skill: s.skill,
        area: 'skills',
        impact: important ? (s.levelGap <= 3 ? 'high' : 'medium') : 'low',
        title: t('{name}: ур. {level} → {targetLevel}', { name: name(s.skill), level: s.level, targetLevel: s.targetLevel }),
        detail:
          t('Не хватает {levelGap} ур. Сейчас от досок +{daevanion}, от аркан +{arcana}, от шмота +{gear}.', {
            levelGap: s.levelGap,
            daevanion: s.bonus.daevanion,
            arcana: s.bonus.arcana,
            gear: s.bonus.gear
          }) +
          (nextLock
            ? t(' На ур. {level} откроется специализация {n} «{spec}».', { level: nextLock.level, n: nextLock.n, spec: n.spec(s.skill, nextLock.n).main })
            : '')
      })
    }
  }

  const UNSURE_NOTE = t('Оверлей не различает выбранные варианты — отметьте на странице «Умения», что стоит на самом деле, и пункт уточнится.')
  if (unsureSpecs.core.length) {
    steps.push({
      id: 'specs-core',
      area: 'skills',
      impact: 'high',
      title: t('Проверить специализации главных умений ({coreCount})', { coreCount: unsureSpecs.core.length }),
      detail: t('Нужны: {core}. {UNSURE_NOTE}', { core: unsureSpecs.core.join('; '), UNSURE_NOTE })
    })
  }
  if (unsureSpecs.other.length) {
    steps.push({
      id: 'specs-other',
      area: 'skills',
      impact: 'medium',
      title: t('Проверить специализации остальных умений ({otherCount})', { otherCount: unsureSpecs.other.length }),
      detail: t('Нужны: {other}. {UNSURE_NOTE}', { other: unsureSpecs.other.join('; '), UNSURE_NOTE })
    })
  }

  // ── Стигмы
  for (const id of r.stigmas.missing) {
    steps.push({
      id: `stigma-${id}`,
      skill: id,
      area: 'stigmas',
      impact: 'high',
      title: t('Надеть стигму «{name}»', { name: name(id) }),
      detail: t('Гайд держит её надетой постоянно.')
    })
  }
  for (const s of r.skills) {
    if (s.role === 'stigma' && s.target?.equip && s.equipped && s.levelGap > 0) {
      steps.push({
        id: `stigma-lvl-${s.skill}`,
        skill: s.skill,
        area: 'stigmas',
        impact: 'medium',
        title: t('Стигма «{name}»: ур. {level} → {targetLevel}', { name: name(s.skill), level: s.level, targetLevel: s.targetLevel }),
        detail: s.target.note
      })
    }
  }

  // ── Даэванион: ближайшие шаги по первой незавершённой цели
  const goal = r.daevanion.goals.find((g) => g.plan.length)
  if (goal) {
    for (const step of goal.plan.slice(0, 3)) {
      steps.push({
        id: `daev-${step.node.id}`,
        skill: step.node.skill,
        area: 'daevanion',
        impact: step.cost <= 6 ? 'high' : 'medium',
        title: t('{board}: взять «{node}»', { board: term(step.board), node: n.node(step.node) }),
        detail: t('{cost} очк.{p} Цель «{goal}».', {
          cost: step.cost,
          p: step.via ? t(', по пути ещё {via} узл.', { via: step.via }) : '',
          goal: goal.goal.name
        })
      })
    }
  }

  // ── Арканы
  for (const c of r.arcana.cards) {
    const typeRu = term(ARCANA_TYPES.find((x) => x.type === c.type))
    const title = c.info ? term(c.info) : typeRu
    if (!c.item) {
      steps.push({
        id: `arc-empty-${c.slot}`,
        area: 'arcana',
        impact: 'high',
        title: t('{typeRu}: слот пустой', { typeRu }),
        detail: t('Любая карта лучше пустого слота.')
      })
      continue
    }
    const wantedOnCard = c.skills.filter((s) => s.cls === 'wanted').length
    if (c.remaining > 0 && wantedOnCard > 0) {
      const next = c.mainChances[0]
      const best = c.mainChances[c.mainChances.length - 1]
      const chances = [next, best !== next ? best : null]
        .filter((x): x is NonNullable<typeof x> => !!x)
        .map((x) => t('до {level}: {oneIn}', { level: x.level, oneIn: oneIn(x.p) }))
        .join(', ')
      steps.push({
        id: `arc-enchant-${c.slot}`,
        skill: c.main ?? undefined,
        area: 'arcana',
        impact: 'medium',
        title: t('{title}: заточить (+{enchant}/{maxEnchant})', { title, enchant: c.enchant, maxEnchant: c.maxEnchant }),
        detail:
          t('Нужных умений на карте: {wantedOnCard} из {desiredCount}.', { wantedOnCard, desiredCount: c.desired.length }) +
          (c.main && chances ? t(' «{name}» сейчас ур. {mainLevel}, {chances}.', { name: name(c.main), mainLevel: c.mainLevel, chances }) : '')
      })
    }
    if (c.missing.length && wantedOnCard < Math.ceil(c.desired.length / 2)) {
      steps.push({
        id: `arc-new-${c.slot}`,
        area: 'arcana',
        impact: 'low',
        title: t('{typeRu}: искать карту лучше', { typeRu }),
        detail: t('Не хватает: {map}. Точный нужный набор — {oneIn}.', { map: c.missing.map(name).join(', '), oneIn: oneIn(c.newCard.pSet) })
      })
    }
  }

  // ── Шмот
  const lineName = (l: { kind: 'stat' | 'skill'; id: number }) => (l.kind === 'stat' ? n.stat(l.id).main : n.skill(l.id).main)
  for (const item of r.gear) {
    if (item.swaps.length) {
      steps.push({
        id: `gear-${item.slot}`,
        area: 'gear',
        // Строка, которую гайд вообще не ценит, — важнее, чем замена приемлемой на лучшую.
        impact: item.swaps.some((x) => x.from.verdict === 'bad') ? 'medium' : 'low',
        title: `${n.item(item.item.item, item.slot).main}: ${item.swaps.map((x) => `${lineName(x.from)} → ${lineName(x.to)}`).join(', ')}`,
        detail: t('Перековать эти строки: справа — что важнее по гайду и бывает на этом слоте.')
      })
    } else if (item.replace.length) {
      steps.push({
        id: `gear-${item.slot}`,
        area: 'gear',
        impact: 'low',
        title: t('{item}: строка {map} не по гайду', { item: n.item(item.item.item, item.slot).main, map: item.replace.map(lineName).join(', ') }),
        detail: t('Заметно лучшей замены на этом слоте не нашлось — при случае перековать.')
      })
    }
  }
  // Камни: во что перековывать слабые — с учётом порогов (пока меткость ниже порога, сначала в неё).
  const stoneSwaps = r.gear.flatMap((i) => i.stoneSwaps)
  if (stoneSwaps.length) {
    const groups = new Map<number, typeof stoneSwaps>()
    for (const x of stoneSwaps) groups.set(x.to, [...(groups.get(x.to) ?? []), x])
    const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length)
    const reason = sorted.find(([, list]) => list[0].reason)?.[1][0].reason
    const kinds = [...new Set(stoneSwaps.map((x) => n.stat(x.from.stat).main))]
    steps.push({
      id: 'manastones',
      area: 'gear',
      impact: stoneSwaps.some((x) => x.from.weight <= 1) ? 'medium' : 'low',
      title: t('Камни: {map}', { map: sorted.map(([to, list]) => `${list.length} → ${n.stat(to).main}`).join(', ') }),
      detail: t('Перековать слабые: {kinds}.{p}', { kinds: kinds.join(', '), p: reason ? ` ${reason}.` : '' })
    })
  }

  // ── Знание о видах
  const rerolls = r.genus.genuses.flatMap((g) => g.reroll.map((s) => ({ g, s })))
  if (rerolls.length) {
    steps.push({
      id: 'genus',
      area: 'genus',
      impact: 'low',
      title: t('Знание о видах: {rerollsCount} ячеек под переброс', { rerollsCount: rerolls.length }),
      detail: rerolls
        .slice(0, 4)
        .map(({ g, s }) => `${term(g.def)} ${s.slot + 1}: ${s.empty ? t('пусто') : n.stat(s.stat).main}`)
        .join('; ')
    })
  }

  return steps.sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact])
}
