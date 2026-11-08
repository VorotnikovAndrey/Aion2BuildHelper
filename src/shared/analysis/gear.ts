// Шмот: какие строки (статы и умения) полезны по гайду, что менять, что ловить, как с манакамнями.

import { itemArt } from '../gamedata/art'
import { optionsForSlot, type KnownOptions } from '../gamedata/gearOptions'
import { godstoneSlots } from '../gamedata/godstones'
import { STONE_AVG_VALUE, STONE_STAT_POOL } from '../gamedata/stones'
import { skillDef } from '../gamedata/skills'
import { gradeOfItem, slotDef, SLOT_ORDER, type ItemGrade, type SlotGroup } from '../gamedata/slots'
import type { Guide } from '../guide/types'
import type { Character, GearItem } from '../types'
import { statTargetStatus, stoneWeightFn, type StoneWeight, type TargetStatus } from './targets'
import { guideWeights, isUseful, verdictOf, type GuideWeights, type Verdict } from './weights'

export interface GearLine {
  kind: 'stat' | 'skill'
  id: number
  value: number
  weight: number
  verdict: Verdict
}

export interface ManastoneLine {
  /** ID камня: по нему — вид и качество («Качественный камень маны»). */
  stone: number
  stat: number
  grade: number
  weight: number
  verdict: Verdict
  /** Почему вес отличается от гайда: порог стата не взят или уже взят. */
  reason?: string
}

export interface Wish {
  kind: 'stat' | 'skill'
  id: number
  weight: number
}

/** Цель по строке: перековать эту строку на нужный по гайду стат или умение. */
export interface LineSwap {
  from: GearLine
  to: Wish
}

/** Камень: перековать в другой стат (тот же камень может стоять в нескольких гнёздах). */
export interface StoneSwap {
  index: number
  from: ManastoneLine
  to: number
  weight: number
  reason?: string
}

/** Замену советуем, только если новая строка заметно важнее по гайду: на 2 и больше из 5. */
export const SWAP_GAIN = 2

export interface ItemReport {
  slot: number
  group: SlotGroup
  item: GearItem
  grade: ItemGrade
  lines: GearLine[]
  manastones: ManastoneLine[]
  useful: number
  total: number
  /** Строки, которые стоит перековать (бесполезные по гайду). */
  replace: GearLine[]
  /** Что ловить на этот слот вместо них. */
  wishlist: Wish[]
  /** Цель: какие строки на что перековать (самая слабая — на самую важную, что бывает на слоте). */
  swaps: LineSwap[]
  /** Священные камни в вещи и сколько для них гнёзд. */
  godstones: number[]
  godstoneSlots: number
  /** Цель по камням: какие камни во что перековать — с учётом порогов статов. */
  stoneSwaps: StoneSwap[]
  /** 0…100 */
  score: number
  manastoneScore: number | null
}

const WISHLIST_SIZE = 4

function analyzeItem(item: GearItem, w: GuideWeights, stoneW: (stat: number) => StoneWeight, known?: KnownOptions): ItemReport {
  const group = slotDef(item.slot).group
  const possible = optionsForSlot(known, item.slot)
  const lines: GearLine[] = [
    ...item.stats.map((s) => {
      const weight = w.stat(group, s.stat)
      return { kind: 'stat' as const, id: s.stat, value: s.value, weight, verdict: verdictOf(weight) }
    }),
    ...mergeSkills(item).map((s) => {
      const weight = w.gearSkill(s.skill)
      return { kind: 'skill' as const, id: s.skill, value: s.level, weight, verdict: verdictOf(weight) }
    })
  ]
  const manastones: ManastoneLine[] = item.manastones.map((m) => {
    const { weight, reason } = stoneW(m.stat)
    return { stone: m.stone, stat: m.stat, grade: m.grade, weight, verdict: verdictOf(weight), reason }
  })
  const present = new Set(lines.map((l) => `${l.kind}:${l.id}`))
  const hasSkills = item.skills.length > 0
  // Вещь без случайных строк (браслеты, пояс…) и без известных опций слота — ловить на ней нечего.
  const canRoll = item.stats.length > 0 || item.skills.length > 0 || !!possible
  const wishlist: Wish[] = (canRoll ? w.topStats(group) : [])
    .filter((s) => s.weight >= 3 && !present.has(`stat:${s.stat}`) && (!possible || possible.has(s.stat)))
    .slice(0, WISHLIST_SIZE)
    .map((s) => ({ kind: 'stat' as const, id: s.stat, weight: s.weight }))
  // Умения ловим только там, где умения в принципе бывают (на вещи уже есть строка-умение).
  // Активные умения выпадают на оружии, гарде и кольцах, пассивные — на броне и остальных украшениях.
  if (hasSkills) {
    const wantActive = activeSkillSlot(item.slot)
    const skillWishes = w
      .topGearSkills()
      .filter((s) => s.weight >= 4 && !present.has(`skill:${s.skill}`))
      .filter((s) => (skillDef(s.skill)?.type === 'active') === wantActive)
      .slice(0, 2)
      .map((s) => ({ kind: 'skill' as const, id: s.skill, weight: s.weight }))
    wishlist.push(...skillWishes)
  }

  // Кандидаты для замен — все подходящие статы и умения слота, а не только первые в «что ловить».
  const statCands: Wish[] = (canRoll ? w.topStats(group) : [])
    .filter((s) => s.weight >= SWAP_GAIN && !present.has(`stat:${s.stat}`) && (!possible || possible.has(s.stat)))
    .map((s) => ({ kind: 'stat' as const, id: s.stat, weight: s.weight }))
  const skillCands: Wish[] = hasSkills
    ? w
        .topGearSkills()
        .filter((s) => s.weight >= SWAP_GAIN && !present.has(`skill:${s.skill}`))
        .filter((s) => (skillDef(s.skill)?.type === 'active') === activeSkillSlot(item.slot))
        .map((s) => ({ kind: 'skill' as const, id: s.skill, weight: s.weight }))
    : []
  const swaps = planSwaps(lines, statCands, skillCands)

  const total = lines.length
  const useful = lines.filter((l) => isUseful(l.verdict)).length
  const score = total ? Math.round((lines.reduce((s, l) => s + l.weight, 0) / (total * 5)) * 100) : 0
  const manastoneScore = manastones.length ? Math.round((manastones.reduce((s, m) => s + m.weight, 0) / (manastones.length * 5)) * 100) : null
  return {
    slot: item.slot,
    group,
    item,
    // Грейд из списка арта важнее цифры в ID (у рун цифры нет — они «особые»).
    grade: itemArt(item.item)?.grade ?? gradeOfItem(item.item),
    lines,
    manastones,
    useful,
    total,
    replace: lines.filter((l) => l.verdict === 'bad'),
    wishlist,
    swaps,
    godstones: item.godstones,
    godstoneSlots: godstoneSlots(item.slot),
    stoneSwaps: [],
    score,
    manastoneScore
  }
}

/**
 * Замены «что → на что»: самые слабые строки по очереди меняются на самые важные кандидаты того же
 * вида (стат на стат, умение на умение). Останавливаемся, когда выигрыш меньше SWAP_GAIN.
 */
export function planSwaps(lines: GearLine[], statCands: Wish[], skillCands: Wish[]): LineSwap[] {
  const out: LineSwap[] = []
  for (const [kind, cands] of [
    ['stat', statCands],
    ['skill', skillCands]
  ] as const) {
    const own = lines.filter((l) => l.kind === kind).sort((a, b) => a.weight - b.weight)
    const best = [...cands].sort((a, b) => b.weight - a.weight)
    for (let i = 0; i < own.length && i < best.length; i++) {
      if (best[i].weight < own[i].weight + SWAP_GAIN) break
      out.push({ from: own[i], to: best[i] })
    }
  }
  return out
}

/**
 * План по камням на всю экипировку сразу (порог — общий для персонажа):
 *  1) пока стат ниже порога (меткость < 800), в него перековываются самые слабые камни —
 *     столько, сколько примерно нужно до порога (по среднему значению камня);
 *  2) остальные слабые камни (важность 0–2) — в лучший по гайду стат, не связанный с порогом;
 *  приемлемые (3+) не трогаем.
 */
export function planStones(items: ItemReport[], stoneW: (stat: number) => StoneWeight, statuses: TargetStatus[]): void {
  const all = items.flatMap((it) => it.manastones.map((m, index) => ({ it, m, index })))
  if (!all.length) return
  const pool = [...new Set([...STONE_STAT_POOL, ...all.map((x) => x.m.stat)])].map((stat) => ({ stat, ...stoneW(stat) }))
  const boosted = new Set(pool.filter((p) => p.progress !== undefined).map((p) => p.stat))
  const order = [...all].sort((a, b) => a.m.weight - b.m.weight || a.m.grade - b.m.grade)
  const taken = new Set<(typeof all)[number]>()
  const assign = (x: (typeof all)[number], to: { stat: number; weight: number; reason?: string }) => {
    taken.add(x)
    x.it.stoneSwaps.push({ index: x.index, from: x.m, to: to.stat, weight: to.weight, reason: to.reason })
  }

  // 1) Пороги: сколько камней нужно до ближайшего.
  for (const t of statuses) {
    if (!t.next) continue
    const stat = (t.target.raise ?? []).find((s) => STONE_AVG_VALUE[s] && pool.some((p) => p.stat === s))
    if (!stat) continue
    const target = pool.find((p) => p.stat === stat)!
    let need = Math.ceil((t.next.value - t.current) / STONE_AVG_VALUE[stat])
    for (const x of order) {
      if (need <= 0) break
      if (taken.has(x) || x.m.stat === stat || x.m.weight >= 5) continue
      assign(x, target)
      need--
    }
  }

  // 2) Остальные слабые — в лучший стат без порога.
  const best = pool.filter((p) => !boosted.has(p.stat)).sort((a, b) => b.weight - a.weight)[0]
  if (!best) return
  for (const x of order) {
    if (taken.has(x) || x.m.stat === best.stat || x.m.weight > 2 || best.weight < x.m.weight + SWAP_GAIN) continue
    assign(x, best)
  }
  for (const it of items) it.stoneSwaps.sort((a, b) => a.index - b.index)
}

/** На каких слотах строкой выпадают активные умения (по данным клиента: оружие, гарда, кольца). */
export function activeSkillSlot(slot: number): boolean {
  const key = slotDef(slot).key
  return slot === 1 || slot === 2 || key.endsWith('Ring')
}

/** На арканах одно умение может быть записано несколько раз — складываем уровни. */
export function mergeSkills(item: GearItem): { skill: number; level: number }[] {
  const map = new Map<number, number>()
  for (const s of item.skills) map.set(s.skill, (map.get(s.skill) ?? 0) + s.level)
  return [...map.entries()].map(([skill, level]) => ({ skill, level }))
}

/**
 * @param known какие статы встречаются на слотах (gamedata/gearOptions) — чтобы «что ловить»
 *   не предлагало невозможное. Без него список берётся просто из приоритетов гайда.
 */
export function analyzeGear(char: Character, guide: Guide | null, known?: KnownOptions): ItemReport[] {
  const w = guideWeights(guide)
  const statuses = statTargetStatus(char, guide)
  const stoneW = stoneWeightFn(guide, statuses)
  const order = (slot: number) => {
    const i = SLOT_ORDER.indexOf(slot)
    return i < 0 ? 999 : i
  }
  const items = char.gear
    .filter((g) => slotDef(g.slot).group !== 'arcana')
    .map((g) => analyzeItem(g, w, stoneW, known))
    .sort((a, b) => order(a.slot) - order(b.slot))
  planStones(items, stoneW, statuses)
  return items
}

/** Оценка раздела «Шмот» 0…100: средняя по вещам со строками + манакамни с меньшим весом. */
export function gearScore(items: ItemReport[]): number {
  const withLines = items.filter((i) => i.total > 0)
  const lines = withLines.length ? withLines.reduce((s, i) => s + i.score, 0) / withLines.length : 0
  const stones = items.filter((i) => i.manastoneScore !== null)
  const ms = stones.length ? stones.reduce((s, i) => s + (i.manastoneScore ?? 0), 0) / stones.length : lines
  return Math.round(lines * 0.75 + ms * 0.25)
}
