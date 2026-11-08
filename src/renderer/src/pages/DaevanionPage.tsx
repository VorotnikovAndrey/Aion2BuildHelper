import { useMemo, useState } from 'react'
import { Lock, Waypoints } from 'lucide-react'
import type { BoardReport, GoalReport } from '@shared/analysis/daevanion'
import { BOARD_CURRENCY, neighbors, type DaevanionNode } from '@shared/gamedata/daevanion'
import { formatStatValue } from '@shared/gamedata/stats'
import { GuideSwitcher } from '@/components/GuideSwitcher'
import { Card } from '@/components/ui/Card'
import { EmptyState, Legend, PageHeader } from '@/components/ui/misc'
import { Pill, toneOfShare } from '@/components/ui/Pill'
import { ProgressBar } from '@/components/ui/Progress'
import { cn, fmt } from '@/lib/format'
import { useCharacterContext } from '@/lib/report'

type Ctx = NonNullable<ReturnType<typeof useCharacterContext>>

export function DaevanionPage() {
  const ctx = useCharacterContext()!
  const { char, report, namer, guide } = ctx
  const d = report.daevanion
  const [boardId, setBoardId] = useState<number>(d.boards[0]?.board.id ?? 0)
  const board = d.boards.find((b) => b.board.id === boardId) ?? d.boards[0]

  if (!d.available) {
    return (
      <>
        <PageHeader icon={<Waypoints size={22} />} title="Даэванион" actions={<GuideSwitcher char={char} />} />
        <EmptyState title="Для этого класса ещё нет данных досок">
          Доски скачиваются командой <code className="text-ink-2">npm run gamedata -- --classes {char.cls}</code> (см. docs/data-sources.md).
        </EmptyState>
      </>
    )
  }

  return (
    <>
      <PageHeader
        icon={<Waypoints size={22} />}
        title="Даэванион"
        subtitle="Шесть досок: узел можно взять, только если он соединён со взятым. Голубая обводка — узлы, которые просит гайд; пунктир — самый дешёвый путь к ним."
        actions={<GuideSwitcher char={char} />}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
        {d.boards.map((b) => (
          <button
            key={b.board.id}
            onClick={() => setBoardId(b.board.id)}
            className={cn(
              'rounded-xl border px-3 py-2.5 text-left transition-colors',
              b.board.id === board.board.id ? 'border-accent/60 bg-accent-soft' : 'border-line bg-surface hover:border-line-strong'
            )}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[13px] font-semibold">{b.board.ru}</span>
              {!b.open && <Lock size={12} className="text-ink-3" />}
            </div>
            <div className="tnum mt-1 text-[11px] text-ink-3">
              {b.takenCount}/{b.totalCount} узлов · {b.spent}/{b.total} очк.
            </div>
            <ProgressBar value={(b.spent / b.total) * 100} height={3} className="mt-1.5" color="var(--color-accent)" />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card
          title={`${board.board.ru} · ${board.board.en}`}
          hint={`Открывается с ур. ${board.board.needLevel}. Оплата: ${BOARD_CURRENCY[board.board.en] ?? 'кристаллы'}.`}
          actions={
            <Pill tone={board.open ? 'accent' : 'neutral'}>
              {board.open ? `вложено ${board.spent} из ${board.total}` : `откроется на ур. ${board.board.needLevel}`}
            </Pill>
          }
        >
          <BoardView board={board} goals={d.goals} ctx={ctx} />
          <Legend
            items={[
              { swatch: <Swatch className="bg-accent" />, text: 'взят: +1 к умению' },
              { swatch: <Swatch className="bg-teal" />, text: 'взят: стат' },
              { swatch: <Swatch className="bg-grade-epic" />, text: 'взят: крупный стат' },
              { swatch: <Swatch className="border-2 border-aether bg-transparent" />, text: 'нужен по гайду' },
              { swatch: <Swatch className="border border-dashed border-aether bg-transparent" />, text: 'путь к нужному' }
            ]}
          />
        </Card>

        <div className="flex min-w-0 flex-col gap-5">
          <Card title="Узлы умений на доске" hint="Узлы «+1 к уровню умения» — главное, ради чего гайды качают доски.">
            <div className="-mx-2 max-h-80 overflow-y-auto">
              {board.skillNodes
                .slice()
                .sort((a, b) => Number(b.taken) - Number(a.taken))
                .map(({ node, taken }) => (
                  <div key={node.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[13px] hover:bg-surface-2">
                    <span className={taken ? 'text-ink' : 'text-ink-3'}>
                      {taken ? '✓ ' : ''}
                      {namer.node(node)}
                    </span>
                    <span className="tnum shrink-0 text-[11px] text-ink-3">{node.cost} очк.</span>
                  </div>
                ))}
              {board.skillNodes.length === 0 && <p className="px-2 text-[13px] text-ink-3">На этой доске нет узлов умений — только статы.</p>}
            </div>
          </Card>
          <Card title="Статы со всех досок" hint="Сумма бонусов от всех взятых узлов.">
            <div className="-mx-2">
              {[...d.stats.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([stat, value]) => (
                  <div key={stat} className="flex items-center justify-between rounded-lg px-2 py-1 text-[13px] hover:bg-surface-2">
                    <span className="text-ink-2">{namer.stat(stat).main}</span>
                    <span className="tnum">{formatStatValue(stat, value, { sign: true })}</span>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>

      {guide && d.goals.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {d.goals.map((g) => (
            <GoalCard key={g.goal.id} g={g} ctx={ctx} onBoard={setBoardId} />
          ))}
        </div>
      )}
      {guide?.daevanion.notes && <p className="mt-4 text-xs leading-relaxed text-ink-3">{guide.daevanion.notes}</p>}
    </>
  )
}

function Swatch({ className }: { className: string }) {
  return <span className={cn('inline-block h-3 w-3 rounded-[3px]', className)} />
}

function GoalCard({ g, ctx, onBoard }: { g: GoalReport; ctx: Ctx; onBoard: (id: number) => void }) {
  const done = g.required.length > 0 && g.done === g.required.length
  return (
    <Card
      title={g.goal.name}
      actions={
        <Pill tone={toneOfShare(g.done, g.required.length)}>
          {g.done} / {g.required.length}
        </Pill>
      }
    >
      {g.goal.description && <p className="mb-3 text-xs leading-relaxed text-ink-3">{g.goal.description}</p>}
      <ProgressBar value={g.required.length ? (g.done / g.required.length) * 100 : 100} />
      {done ? (
        <p className="mt-3 text-[13px] text-good">Цель выполнена.</p>
      ) : (
        <>
          <div className="mt-3 mb-1.5 flex items-center justify-between text-xs text-ink-3">
            <span>План: сначала самое дешёвое</span>
            <span className="tnum">всего {fmt(g.remainingCost)} очк.</span>
          </div>
          <ol className="-mx-2 max-h-72 overflow-y-auto">
            {g.plan.map((step, i) => (
              <li key={step.node.id}>
                <button
                  onClick={() => onBoard(step.board.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-surface-2"
                >
                  <span className="tnum w-5 shrink-0 text-[11px] text-ink-3">{i + 1}.</span>
                  <span className="min-w-0 flex-1 truncate">
                    <span className="text-ink-3">{step.board.ru}:</span> {ctx.namer.node(step.node)}
                  </span>
                  <span className="tnum shrink-0 text-[11px] text-ink-3">
                    {step.cost} очк.{step.via ? ` (+${step.via} по пути)` : ''}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {g.lockedCount > 0 && <p className="mt-2 text-xs text-ink-3">Ещё {g.lockedCount} узл. — на досках, закрытых по уровню.</p>}
        </>
      )}
    </Card>
  )
}

const CELL = 34

function BoardView({ board, goals, ctx }: { board: BoardReport; goals: GoalReport[]; ctx: Ctx }) {
  const [hover, setHover] = useState<DaevanionNode | null>(null)
  const nodes = board.board.nodes
  const rows = Math.max(...nodes.map((n) => n.row))
  const cols = Math.max(...nodes.map((n) => n.col))
  const minRow = Math.min(...nodes.map((n) => n.row))
  const minCol = Math.min(...nodes.map((n) => n.col))
  const w = (cols - minCol + 1) * CELL
  const h = (rows - minRow + 1) * CELL
  const x = (n: DaevanionNode) => (n.col - minCol) * CELL + CELL / 2
  const y = (n: DaevanionNode) => (n.row - minRow) * CELL + CELL / 2

  const { wanted, path } = useMemo(() => {
    const wanted = new Set<number>()
    const path = new Set<number>()
    for (const g of goals) {
      for (const r of g.required) if (r.board.id === board.board.id && !r.taken) wanted.add(r.node.id)
      for (const s of g.plan) if (s.board.id === board.board.id) s.path.forEach((id) => path.add(id))
    }
    return { wanted, path }
  }, [goals, board.board.id])

  const edges = useMemo(() => {
    const out: [DaevanionNode, DaevanionNode][] = []
    for (const n of nodes) for (const m of neighbors(board.board, n)) if (m.id > n.id) out.push([n, m])
    return out
  }, [nodes, board.board])

  const fill = (n: DaevanionNode) => {
    if (n.type === 'Start') return 'var(--color-accent)'
    if (!board.taken.has(n.id)) return 'var(--color-surface-2)'
    if (n.type === 'SkillLevel') return 'var(--color-accent)'
    if (n.grade === 'Unique' || n.grade === 'Legend') return 'var(--color-grade-epic)'
    return 'var(--color-teal)'
  }

  return (
    <div className="relative overflow-x-auto">
      <div className="relative mx-auto" style={{ width: w, height: h }}>
        <svg width={w} height={h} className="absolute inset-0">
          {edges.map(([a, b]) => {
            const lit = board.taken.has(a.id) && board.taken.has(b.id)
            return (
              <line
                key={`${a.id}-${b.id}`}
                x1={x(a)}
                y1={y(a)}
                x2={x(b)}
                y2={y(b)}
                stroke={lit ? 'var(--color-accent)' : 'var(--color-line-strong)'}
                strokeOpacity={lit ? 0.7 : 1}
                strokeWidth={lit ? 2 : 1}
              />
            )
          })}
          {nodes.map((n) => {
            const taken = board.taken.has(n.id) || n.type === 'Start'
            const big = n.type === 'SkillLevel' || n.grade === 'Unique' || n.grade === 'Legend'
            const r = n.type === 'Start' ? 11 : big ? 10 : 7
            return (
              <g key={n.id} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(null)} className="cursor-default">
                {wanted.has(n.id) && <circle cx={x(n)} cy={y(n)} r={r + 4} fill="none" stroke="var(--color-aether)" strokeWidth={2} />}
                {path.has(n.id) && !wanted.has(n.id) && (
                  <circle cx={x(n)} cy={y(n)} r={r + 3} fill="none" stroke="var(--color-aether)" strokeWidth={1.2} strokeDasharray="3 2" />
                )}
                <rect
                  x={x(n) - r}
                  y={y(n) - r}
                  width={r * 2}
                  height={r * 2}
                  rx={n.type === 'SkillLevel' ? r : 3}
                  transform={n.grade === 'Unique' || n.grade === 'Legend' ? `rotate(45 ${x(n)} ${y(n)})` : undefined}
                  fill={fill(n)}
                  stroke={taken ? 'transparent' : 'var(--color-line-strong)'}
                  opacity={board.open || taken ? 1 : 0.45}
                />
                {n.type === 'Start' && (
                  <text x={x(n)} y={y(n) + 4} textAnchor="middle" fontSize="11" fill="var(--color-on-accent)" fontWeight={700}>
                    ★
                  </text>
                )}
              </g>
            )
          })}
        </svg>
        {hover && (
          <div
            className="pointer-events-none absolute z-10 w-56 rounded-lg border border-line-strong bg-surface-3 px-3 py-2 text-xs shadow-xl shadow-black/40"
            style={{ left: Math.min(x(hover) + 14, w - 230), top: Math.max(0, y(hover) - 10) }}
          >
            <div className="font-semibold text-ink">{ctx.namer.node(hover)}</div>
            <div className="mt-0.5 text-ink-3">
              {hover.type === 'Start' ? 'Стартовый узел' : `${hover.cost} очк. · ${board.taken.has(hover.id) ? 'взят' : 'не взят'}`}
              {wanted.has(hover.id) ? ' · нужен по гайду' : path.has(hover.id) ? ' · по пути к нужному' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
