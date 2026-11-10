// Проверка справочников после патча: что изменилось на metabot.gg по сравнению со справочниками приложения.
// Свежие данные собирает main-процесс (src/main/gamedataCheck.ts) теми же разборщиками, что и `npm run gamedata`.

import type { ClassKey } from '../types'
import arcanaPoolsJson from './generated/arcana-pools.json'
import godstonesJson from './generated/godstones.json'
import metaJson from './generated/meta.json'
import skillsJson from './generated/skills.json'
import specsJson from './generated/specs.json'
import titlesJson from './generated/titles.json'
import { BOARD_RU } from './daevanion'
import { skillDef } from './skills'
import { topData } from './top'
import { intlLocale, t } from '../i18n'

export interface GamedataSnapshot {
  skills: { id: number; en: string; cls: string; type: string; unlock: number | null }[]
  specs: Record<string, { n: number; level: number | null; en: string }[]>
  boards: { id: number; en: string; nodes: { id: number; skill?: number; levels?: number }[] }[]
  arcanaPools: Record<string, Record<string, number[]>>
  titles: { id: number; en: string }[]
  godstones: { id: number; en: string; effect: string }[]
  top: { players: number; medianCp: number; skills: { skill: number; avgLevel: number }[]; stigmas: { skill: number; share: number }[] } | null
}

export type GamedataArea = 'skills' | 'specs' | 'daevanion' | 'arcana' | 'titles' | 'godstones' | 'top'

export interface GamedataChange {
  area: GamedataArea
  text: string
  /** Важное для билда: новые/убранные умения, специализации, узлы досок. Данные топа меняются каждый день — не важные. */
  important: boolean
}

export const AREA_RU: Record<GamedataArea, string> = {
  skills: t('Умения'),
  specs: t('Специализации'),
  daevanion: t('Доски Даэваниона'),
  arcana: t('Арканы'),
  titles: t('Титулы'),
  godstones: t('Священные камни'),
  top: t('Топ-игроки')
}

/** Когда собраны справочники приложения. */
export const GAMEDATA_BUILT_AT: string = (metaJson as { builtAt: string }).builtAt

const boardFiles = import.meta.glob<{ default: GamedataSnapshot['boards'] }>('./generated/daevanion/*.json', { eager: true })

/** Справочники, с которыми собрано приложение, — для сравнения со свежими. */
export function currentSnapshot(cls: ClassKey): GamedataSnapshot {
  const boards = Object.entries(boardFiles).find(([path]) => path.endsWith(`/${cls}.json`))?.[1].default ?? []
  const top = topData(cls)
  return {
    skills: skillsJson as GamedataSnapshot['skills'],
    specs: specsJson as GamedataSnapshot['specs'],
    boards,
    arcanaPools: arcanaPoolsJson as GamedataSnapshot['arcanaPools'],
    titles: titlesJson as GamedataSnapshot['titles'],
    godstones: godstonesJson as GamedataSnapshot['godstones'],
    top
  }
}

const short = (s: string, n = 70) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
const num = (v: number) => v.toLocaleString(intlLocale())

export function diffGamedata(cur: GamedataSnapshot, fresh: GamedataSnapshot, cls: ClassKey): GamedataChange[] {
  const out: GamedataChange[] = []
  const add = (area: GamedataArea, text: string, important = true) => out.push({ area, text, important })
  const name = (id: number, en?: string) => skillDef(id)?.ru ?? en ?? String(id)

  // Умения класса.
  const curSkills = new Map(cur.skills.filter((s) => s.cls === cls).map((s) => [s.id, s]))
  const newSkills = new Map(fresh.skills.filter((s) => s.cls === cls).map((s) => [s.id, s]))
  for (const [id, s] of newSkills) {
    const was = curSkills.get(id)
    if (!was) add('skills', t('Новое умение: {s}', { s: s.en }))
    else {
      if (was.en !== s.en) add('skills', t('{name}: английское название «{was}» → «{s}»', { name: name(id, was.en), was: was.en, s: s.en }))
      if (was.type !== s.type) add('skills', t('{name}: тип умения изменился', { name: name(id, s.en) }))
      if (was.unlock !== s.unlock)
        add('skills', t('{name}: открывается на ур. {p} → {p2}', { name: name(id, s.en), p: was.unlock ?? '—', p2: s.unlock ?? '—' }))
    }
  }
  for (const [id, s] of curSkills) if (!newSkills.has(id)) add('skills', t('Умение пропало: {name}', { name: name(id, s.en) }))

  // Специализации — только у умений класса, которые есть в обоих.
  for (const id of newSkills.keys()) {
    const a = cur.specs[id]
    const b = fresh.specs[id]
    if (!a || !b) continue
    for (const sp of b) {
      const was = a.find((x) => x.n === sp.n)
      if (!was) add('specs', t('{name}: новый вариант {n} — «{short}»', { name: name(id), n: sp.n, short: short(sp.en) }))
      else {
        if (was.en !== sp.en) add('specs', t('{name}: вариант {n} изменился — «{short}»', { name: name(id), n: sp.n, short: short(sp.en) }))
        if (was.level !== sp.level)
          add('specs', t('{name}: вариант {n} открывается на ур. {p} → {p2}', { name: name(id), n: sp.n, p: was.level ?? '—', p2: sp.level ?? '—' }))
      }
    }
    for (const sp of a) if (!b.some((x) => x.n === sp.n)) add('specs', t('{name}: вариант {n} убран', { name: name(id), n: sp.n }))
  }

  // Доски: число узлов и узлы умений.
  for (const board of fresh.boards) {
    const was = cur.boards.find((b) => b.id === board.id)
    const ru = BOARD_RU[board.en] ?? board.en
    if (!was) {
      add('daevanion', t('Новая доска: {ru}', { ru }))
      continue
    }
    if (was.nodes.length !== board.nodes.length)
      add('daevanion', t('{ru}: узлов {nodesCount} → {nodesCount2}', { ru, nodesCount: was.nodes.length, nodesCount2: board.nodes.length }))
    const oldNodes = new Map(was.nodes.map((n) => [n.id, n]))
    for (const n of board.nodes) {
      const o = oldNodes.get(n.id)
      if (n.skill && (!o || o.skill !== n.skill || o.levels !== n.levels)) {
        add('daevanion', t('{ru}: узел «{name} +{p}»{p2}', { ru, name: name(n.skill), p: n.levels ?? 1, p2: o ? t(' изменился') : t(' добавлен') }))
      }
    }
  }

  // Пулы аркан класса.
  const curPools = cur.arcanaPools[cls] ?? {}
  const newPools = fresh.arcanaPools[cls] ?? {}
  for (const [card, list] of Object.entries(newPools)) {
    const was = new Set(curPools[card] ?? [])
    const now = new Set(list)
    const added = list.filter((id) => !was.has(id))
    const removed = [...was].filter((id) => !now.has(id))
    if (added.length) add('arcana', t('Карта {card}: добавлены {map}', { card, map: added.map((id) => name(id)).join(', ') }))
    if (removed.length) add('arcana', t('Карта {card}: убраны {map}', { card, map: removed.map((id) => name(id)).join(', ') }))
  }

  // Титулы и священные камни: новые — списком (первые 5).
  const newTitles = fresh.titles.filter((t) => !cur.titles.some((x) => x.id === t.id))
  if (newTitles.length)
    add(
      'titles',
      t('Новых титулов: {newTitlesCount} — {map}{p}', {
        newTitlesCount: newTitles.length,
        map: newTitles
          .slice(0, 5)
          .map((t) => t.en)
          .join(', '),
        p: newTitles.length > 5 ? '…' : ''
      }),
      false
    )
  const newStones = fresh.godstones.filter((g) => !cur.godstones.some((x) => x.id === g.id))
  if (newStones.length)
    add(
      'godstones',
      t('Новых священных камней: {newStonesCount} — {map}', {
        newStonesCount: newStones.length,
        map: newStones
          .slice(0, 5)
          .map((g) => g.en)
          .join(', ')
      }),
      false
    )
  const changedStones = fresh.godstones.filter((g) => cur.godstones.some((x) => x.id === g.id && x.effect !== g.effect))
  if (changedStones.length) add('godstones', t('Изменился эффект: {map}', { map: changedStones.map((g) => g.en).join(', ') }))

  // Топ-игроки: меняется каждый день — только заметные сдвиги.
  if (cur.top && fresh.top) {
    const a = cur.top
    const b = fresh.top
    if (Math.abs(b.medianCp - a.medianCp) / Math.max(1, a.medianCp) >= 0.03)
      add('top', t('Медиана боевой мощи топа: {num} → {num2}', { num: num(a.medianCp), num2: num(b.medianCp) }), false)
    for (const s of b.skills) {
      const was = a.skills.find((x) => x.skill === s.skill)
      if (was && Math.abs(s.avgLevel - was.avgLevel) >= 0.5)
        add('top', t('{name}: средний уровень у топа {num} → {num2}', { name: name(s.skill), num: num(was.avgLevel), num2: num(s.avgLevel) }), false)
    }
    for (const s of b.stigmas) {
      const was = a.stigmas.find((x) => x.skill === s.skill)
      if (was && Math.abs(s.share - was.share) >= 5)
        add('top', t('{name}: носят {num}% → {num2}% топа', { name: name(s.skill), num: num(was.share), num2: num(s.share) }), false)
    }
  }
  return out
}
