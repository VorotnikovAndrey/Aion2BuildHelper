// Арканы: какие умения на картах нужны, шансы заточки и шансы новой карты.
//
// Модель (сверена с игровыми данными и подсчётами игроков, см. docs/game-mechanics.md):
//   • на карте K разных умений (K = грейд), каждая заточка даёт +1 одному из них поровну (шанс 1/K);
//   • поэтому число попаданий в нужное умение за r оставшихся заточек — биномиальное B(r, 1/K);
//   • новая карта берёт K разных умений из пула типа (n штук) без повторов: шанс конкретного набора 1/C(n, K).

import {
  ARCANA_GRADES,
  ARCANA_SETS,
  ARCANA_SKILL_CAP,
  ARCANA_TYPES,
  arcanaInfo,
  arcanaPool,
  type ArcanaInfo,
  type ArcanaType,
  type ArcanaVariant
} from '../gamedata/arcana'
import type { Guide } from '../guide/types'
import type { Character, ClassKey, GearItem } from '../types'
import { mergeSkills } from './gear'
import { intlLocale, t } from '../i18n'
import { term } from '../names'

// ───────────────────────── Вероятности ─────────────────────────

export function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  k = Math.min(k, n - k)
  let r = 1
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i
  return r
}

/** P(X ≥ m), X ~ B(r, p). */
export function atLeast(r: number, p: number, m: number): number {
  if (m <= 0) return 1
  if (m > r) return 0
  let sum = 0
  for (let x = m; x <= r; x++) sum += choose(r, x) * p ** x * (1 - p) ** (r - x)
  return Math.min(1, sum)
}

/**
 * Шанс, что новая карта из пула размера n с K умениями содержит все m нужных умений
 * (остальные K − m — любые).
 */
export function pContainsAll(n: number, K: number, m: number): number {
  if (m > K || m > n) return 0
  return choose(n - m, K - m) / choose(n, K)
}

// ───────────────────────── Отчёт по карте ─────────────────────────

export type ArcanaSkillClass = 'wanted' | 'useful' | 'extra' | 'useless'

export interface ArcanaSkillLine {
  skill: number
  level: number
  cls: ArcanaSkillClass
  /** Место в приоритетах гайда для этого типа карты (0 — самое важное). */
  rank: number | null
}

export interface LevelChance {
  level: number
  p: number
}

export interface ArcanaCardReport {
  slot: number
  type: ArcanaType
  item: GearItem | null
  info: ArcanaInfo | null
  enchant: number
  maxEnchant: number
  remaining: number
  /** Сколько разных умений на карте этого грейда. */
  slots: number
  skills: ArcanaSkillLine[]
  pool: number[]
  /** Лучший набор умений для этого типа карты по гайду (первые K из пула по приоритету). */
  desired: number[]
  /** Нужные умения, которых на карте нет. */
  missing: number[]
  /** Главное умение карты — самое важное из того, что на ней есть (или будет искаться). */
  main: number | null
  mainLevel: number
  /** Шансы главного умения дойти до следующих уровней оставшимися заточками. */
  mainChances: LevelChance[]
  newCard: {
    /** Шанс выбить новую карту ровно с нужным набором. */
    pSet: number
    /** …и после всех заточек главное умение дойдёт до ур. 3 / ур. 4. */
    pSetMain: LevelChance[]
  }
  /** 0…100: доля нужных умений и заточка. */
  score: number
  done: boolean
}

function priorityFor(type: ArcanaType, guide: Guide | null): number[] {
  if (!guide) return []
  const kind = ARCANA_TYPES.find((t) => t.type === type)!.pool
  if (kind === 'attack') return guide.arcana.attack
  if (kind === 'passive') return guide.arcana.passive
  // Грааль берёт из общего пула: сначала главные атакующие, потом пассивки, затем остальное по порядку.
  const coreAttack = guide.arcana.attack.slice(0, 4)
  const corePassive = guide.arcana.passive.slice(0, 3)
  const rest = [...guide.arcana.attack.slice(4), ...guide.arcana.passive.slice(3)]
  return [...coreAttack, ...corePassive, ...rest]
}

export function analyzeArcanaCard(cls: ClassKey, type: ArcanaType, item: GearItem | null, guide: Guide | null): ArcanaCardReport {
  const t = ARCANA_TYPES.find((x) => x.type === type)!
  const info = item ? arcanaInfo(item.item) : null
  const grade = ARCANA_GRADES[info?.grade ?? 'unique']
  const K = grade.skills
  const pool = arcanaPool(cls, type)
  const priority = priorityFor(type, guide).filter((s) => pool.includes(s))
  const useless = new Set(guide?.arcana.useless ?? [])
  const desired = priority.slice(0, K)
  const rankOf = (s: number) => {
    const i = priority.indexOf(s)
    return i < 0 ? null : i
  }

  const merged = item ? mergeSkills(item) : []
  const skills: ArcanaSkillLine[] = merged
    .map((s) => {
      const rank = rankOf(s.skill)
      const cls: ArcanaSkillClass = useless.has(s.skill) ? 'useless' : desired.includes(s.skill) ? 'wanted' : rank !== null ? 'useful' : 'extra'
      return { skill: s.skill, level: s.level, cls, rank }
    })
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))

  const present = new Set(skills.map((s) => s.skill))
  const missing = desired.filter((s) => !present.has(s))
  const mainLine = skills.find((s) => s.cls === 'wanted') ?? null
  const main = mainLine?.skill ?? desired[0] ?? null
  const mainLevel = mainLine?.level ?? 0

  const enchant = item?.enchant ?? 0
  const maxEnchant = grade.maxEnchant
  const remaining = item ? Math.max(0, maxEnchant - enchant) : 0
  const p = 1 / K
  const mainChances: LevelChance[] = []
  if (mainLine) {
    for (let lvl = mainLevel + 1; lvl <= ARCANA_SKILL_CAP; lvl++) {
      const chance = atLeast(remaining, p, lvl - mainLevel)
      if (chance > 0) mainChances.push({ level: lvl, p: chance })
    }
  }

  const pSet = desired.length ? pContainsAll(pool.length, K, desired.length) : 0
  const pSetMain: LevelChance[] = [3, 4].map((lvl) => ({ level: lvl, p: pSet * atLeast(maxEnchant, p, lvl - 1) }))

  const wantedCount = skills.filter((s) => s.cls === 'wanted').length
  const quality = desired.length ? wantedCount / desired.length : 0
  const score = item ? Math.round((quality * 0.7 + (maxEnchant ? enchant / maxEnchant : 0) * 0.3) * 100) : 0

  return {
    slot: t.slot,
    type,
    item,
    info,
    enchant,
    maxEnchant,
    remaining,
    slots: K,
    skills,
    pool,
    desired,
    missing,
    main,
    mainLevel,
    mainChances,
    newCard: { pSet, pSetMain },
    score,
    done: !!item && missing.length === 0 && remaining === 0
  }
}

export interface ArcanaReport {
  cards: ArcanaCardReport[]
  sets: { variant: ArcanaVariant; count: number; active: 0 | 2 | 4; name: string; bonus2: string; bonus4: string }[]
  /** Сумма уровней умений со всех карт. */
  levels: Map<number, number>
  score: number
}

export function analyzeArcana(char: Character, guide: Guide | null): ArcanaReport {
  const cls = char.cls ?? guide?.cls ?? 'templar'
  const cards = ARCANA_TYPES.map((t) => analyzeArcanaCard(cls, t.type, char.gear.find((g) => g.slot === t.slot) ?? null, guide))
  const counts: Record<ArcanaVariant, number> = { magic: 0, vigor: 0 }
  for (const c of cards) if (c.info) counts[c.info.variant]++
  const sets = (['vigor', 'magic'] as ArcanaVariant[]).map((v) => ({
    variant: v,
    count: counts[v],
    active: (counts[v] >= 4 ? 4 : counts[v] >= 2 ? 2 : 0) as 0 | 2 | 4,
    name: term(ARCANA_SETS[v]),
    bonus2: ARCANA_SETS[v].bonus2,
    bonus4: ARCANA_SETS[v].bonus4
  }))
  const levels = new Map<number, number>()
  for (const c of cards) for (const s of c.skills) levels.set(s.skill, (levels.get(s.skill) ?? 0) + s.level)
  const score = Math.round(cards.reduce((s, c) => s + c.score, 0) / cards.length)
  return { cards, sets, levels, score }
}

/** «1 из 7 315» — так шансы понятнее, чем 0,0137%. */
export function oneIn(p: number): string {
  if (p <= 0) return t('никогда')
  if (p >= 0.995) return t('точно')
  if (p >= 0.1) return `${(p * 100).toLocaleString(intlLocale(), { maximumFractionDigits: 1 })}%`
  return t('1 из {p}', { p: Math.round(1 / p).toLocaleString(intlLocale()) })
}
