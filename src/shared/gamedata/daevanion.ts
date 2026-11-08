// Доски Даэваниона: по 6 досок на класс, узлы на сетке. Узел можно взять, только если он
// соединён (по горизонтали/вертикали) с уже взятым — от стартового узла в центре.
// Данные досок — src/shared/gamedata/generated/daevanion/<класс>.json (npm run gamedata).

import type { ClassKey } from '../types'

export type NodeType = 'Start' | 'Stat' | 'SkillLevel'
export type NodeGrade = 'Common' | 'Rare' | 'Legend' | 'Unique' | null

export interface DaevanionNode {
  id: number
  row: number
  col: number
  type: NodeType
  grade: NodeGrade
  /** Стоимость в очках (кристаллах). */
  cost: number
  auto?: boolean
  label: string
  stats?: { stat: string; value: number }[]
  skill?: number
  levels?: number
}

export interface DaevanionBoard {
  id: number
  en: string
  ru: string
  needLevel: number
  nodes: DaevanionNode[]
}

const BOARD_RU: Record<string, string> = {
  Nezekan: 'Незекан',
  Zikel: 'Зикель',
  Vaizel: 'Вайзель',
  Triniel: 'Триниэль',
  Ariel: 'Ариэль',
  Azphel: 'Азфель'
}

/** Чем оплачиваются узлы досок: первые четыре — кристаллы Даэваниона, Ариэль и Азфель — свои. */
export const BOARD_CURRENCY: Record<string, string> = {
  Nezekan: 'Кристаллы Даэваниона',
  Zikel: 'Кристаллы Даэваниона',
  Vaizel: 'Кристаллы Даэваниона',
  Triniel: 'Кристаллы Даэваниона',
  Ariel: 'Кристаллы Ариэль',
  Azphel: 'Кристаллы Азфеля'
}

const files = import.meta.glob<{ default: Omit<DaevanionBoard, 'ru'>[] }>('./generated/daevanion/*.json', { eager: true })

const BOARDS: Partial<Record<ClassKey, DaevanionBoard[]>> = {}
for (const [path, mod] of Object.entries(files)) {
  const cls = path.split('/').pop()!.replace('.json', '') as ClassKey
  BOARDS[cls] = mod.default.map((b) => ({ ...b, ru: BOARD_RU[b.en] ?? b.en }))
}

/** Доски класса. Пусто, если для класса ещё не скачаны данные (npm run gamedata -- --classes <класс>). */
export const classBoards = (cls: ClassKey | null | undefined): DaevanionBoard[] => (cls ? (BOARDS[cls] ?? []) : [])

export const hasBoardData = (cls: ClassKey | null | undefined): boolean => classBoards(cls).length > 0

const nodeIndex = new Map<number, { node: DaevanionNode; board: DaevanionBoard }>()
for (const boards of Object.values(BOARDS)) for (const b of boards!) for (const n of b.nodes) nodeIndex.set(n.id, { node: n, board: b })

export const findNode = (id: number) => nodeIndex.get(id)

export const boardCost = (b: DaevanionBoard): number => b.nodes.reduce((s, n) => s + n.cost, 0)

/** Соседи узла на сетке (вверх, вниз, влево, вправо). */
export function neighbors(board: DaevanionBoard, node: DaevanionNode): DaevanionNode[] {
  const at = cellIndex(board)
  return [
    [node.row - 1, node.col],
    [node.row + 1, node.col],
    [node.row, node.col - 1],
    [node.row, node.col + 1]
  ]
    .map(([r, c]) => at.get(`${r}:${c}`))
    .filter((n): n is DaevanionNode => !!n)
}

const cellCache = new WeakMap<DaevanionBoard, Map<string, DaevanionNode>>()
function cellIndex(board: DaevanionBoard): Map<string, DaevanionNode> {
  let m = cellCache.get(board)
  if (!m) {
    m = new Map(board.nodes.map((n) => [`${n.row}:${n.col}`, n]))
    cellCache.set(board, m)
  }
  return m
}

export interface NodeRoute {
  /** Сколько очков нужно потратить (включая сам узел). 0 — уже взят. */
  cost: number
  /** Узлы, которые придётся взять, по порядку (без уже взятых). */
  path: number[]
}

/**
 * Самый дешёвый путь до узла от уже взятых (алгоритм Дейкстры, вес — стоимость узла).
 * Стартовый узел доски считается взятым всегда.
 */
export function routeTo(board: DaevanionBoard, taken: Set<number>, targetId: number): NodeRoute | null {
  if (taken.has(targetId)) return { cost: 0, path: [] }
  const target = board.nodes.find((n) => n.id === targetId)
  if (!target) return null
  const isTaken = (n: DaevanionNode) => taken.has(n.id) || n.type === 'Start'

  const dist = new Map<number, number>()
  const prev = new Map<number, number>()
  const queue: { id: number; d: number }[] = []
  for (const n of board.nodes) {
    if (isTaken(n)) {
      dist.set(n.id, 0)
      queue.push({ id: n.id, d: 0 })
    }
  }
  const byId = new Map(board.nodes.map((n) => [n.id, n]))
  while (queue.length) {
    queue.sort((a, b) => a.d - b.d)
    const { id, d } = queue.shift()!
    if (d > (dist.get(id) ?? Infinity)) continue
    if (id === targetId) break
    for (const nb of neighbors(board, byId.get(id)!)) {
      const nd = d + (isTaken(nb) ? 0 : nb.cost)
      if (nd < (dist.get(nb.id) ?? Infinity)) {
        dist.set(nb.id, nd)
        prev.set(nb.id, id)
        queue.push({ id: nb.id, d: nd })
      }
    }
  }
  if (!dist.has(targetId)) return null
  const path: number[] = []
  for (let cur: number | undefined = targetId; cur !== undefined && !isTaken(byId.get(cur)!); cur = prev.get(cur)) path.unshift(cur)
  return { cost: dist.get(targetId)!, path }
}
