// Даэванион: что взято на досках, сколько очков вложено, что осталось до целей гайда и во что это обойдётся.

import { boardCost, classBoards, routeTo, type DaevanionBoard, type DaevanionNode } from '../gamedata/daevanion'
import { statByKey } from '../gamedata/stats'
import type { DaevanionGoal, Guide } from '../guide/types'
import type { Character } from '../types'

export interface BoardReport {
  board: DaevanionBoard
  /** Доска доступна по уровню персонажа. */
  open: boolean
  taken: Set<number>
  takenCount: number
  /** Узлов без стартового. */
  totalCount: number
  spent: number
  total: number
  skillNodes: { node: DaevanionNode; taken: boolean }[]
}

export interface GoalStep {
  node: DaevanionNode
  board: DaevanionBoard
  /** Очков на этот шаг (включая промежуточные узлы). */
  cost: number
  /** Сколько промежуточных узлов придётся взять по пути. */
  via: number
  path: number[]
}

export interface GoalReport {
  goal: DaevanionGoal
  required: { node: DaevanionNode; board: DaevanionBoard; taken: boolean; locked: boolean }[]
  done: number
  /** Порядок взятия оставшихся узлов: сначала самые дешёвые (с учётом уже взятого по пути). */
  plan: GoalStep[]
  /** Сколько очков нужно на всё оставшееся. */
  remainingCost: number
  /** Узлы на ещё закрытых по уровню досках. */
  lockedCount: number
}

export interface DaevanionReport {
  available: boolean
  boards: BoardReport[]
  goals: GoalReport[]
  spent: number
  /** Статы, которые дают взятые узлы (ID стата → сумма). */
  stats: Map<number, number>
  /** Уровни умений от досок. */
  skillLevels: Map<number, number>
  score: number
}

export function analyzeDaevanion(char: Character, guide: Guide | null): DaevanionReport {
  const boards = classBoards(char.cls ?? guide?.cls)
  const takenAll = new Set(char.daevanion.flatMap((b) => b.nodes))
  const stats = new Map<number, number>()
  const skillLevels = new Map<number, number>()

  const boardReports: BoardReport[] = boards.map((board) => {
    const taken = new Set(board.nodes.filter((n) => takenAll.has(n.id) || (n.type === 'Start' && hasAny(board, takenAll))).map((n) => n.id))
    let spent = 0
    for (const n of board.nodes) {
      if (!taken.has(n.id)) continue
      spent += n.cost
      for (const s of n.stats ?? []) {
        const def = statByKey(s.stat)
        if (def) stats.set(def.id, (stats.get(def.id) ?? 0) + s.value)
      }
      if (n.type === 'SkillLevel' && n.skill) skillLevels.set(n.skill, (skillLevels.get(n.skill) ?? 0) + (n.levels ?? 1))
    }
    const real = board.nodes.filter((n) => n.type !== 'Start')
    return {
      board,
      open: char.level >= board.needLevel,
      taken,
      takenCount: real.filter((n) => taken.has(n.id)).length,
      totalCount: real.length,
      spent,
      total: boardCost(board),
      skillNodes: board.nodes.filter((n) => n.type === 'SkillLevel').map((node) => ({ node, taken: taken.has(node.id) }))
    }
  })

  const goals = (guide?.daevanion.goals ?? []).map((g) => analyzeGoal(g, boardReports))
  const spent = boardReports.reduce((s, b) => s + b.spent, 0)
  const score = goals.length
    ? Math.round((goals.reduce((s, g) => s + (g.required.length ? g.done / g.required.length : 1), 0) / goals.length) * 100)
    : boardReports.length
      ? Math.round(
          (boardReports.filter((b) => b.open).reduce((s, b) => s + b.spent / b.total, 0) / Math.max(1, boardReports.filter((b) => b.open).length)) * 100
        )
      : 0

  return { available: boards.length > 0, boards: boardReports, goals, spent, stats, skillLevels, score }
}

function hasAny(board: DaevanionBoard, taken: Set<number>): boolean {
  return board.nodes.some((n) => taken.has(n.id))
}

function analyzeGoal(goal: DaevanionGoal, boards: BoardReport[]): GoalReport {
  const scope = boards.filter((b) => !goal.boards || goal.boards.includes(b.board.id))
  const required: GoalReport['required'] = []
  for (const b of scope) {
    for (const n of b.board.nodes) {
      const bySkill = goal.skills && n.type === 'SkillLevel' && n.skill && goal.skills.includes(n.skill)
      const byNode = goal.nodes?.includes(n.id)
      if (bySkill || byNode) required.push({ node: n, board: b.board, taken: b.taken.has(n.id), locked: !b.open })
    }
  }

  // Жадный план: каждый раз берём самый дешёвый оставшийся узел, «покупаем» путь к нему и пересчитываем.
  const takenByBoard = new Map(scope.map((b) => [b.board.id, new Set(b.taken)]))
  const left = required.filter((r) => !r.taken && !r.locked)
  const plan: GoalStep[] = []
  while (left.length) {
    let best: { i: number; route: NonNullable<ReturnType<typeof routeTo>> } | null = null
    left.forEach((r, i) => {
      const route = routeTo(r.board, takenByBoard.get(r.board.id)!, r.node.id)
      if (route && (!best || route.cost < best.route.cost)) best = { i, route }
    })
    if (!best) break
    const { i, route } = best as { i: number; route: NonNullable<ReturnType<typeof routeTo>> }
    const r = left.splice(i, 1)[0]
    const set = takenByBoard.get(r.board.id)!
    for (const id of route.path) set.add(id)
    plan.push({ node: r.node, board: r.board, cost: route.cost, via: Math.max(0, route.path.length - 1), path: route.path })
  }

  return {
    goal,
    required,
    done: required.filter((r) => r.taken).length,
    plan,
    remainingCost: plan.reduce((s, p) => s + p.cost, 0),
    lockedCount: required.filter((r) => !r.taken && r.locked).length
  }
}
