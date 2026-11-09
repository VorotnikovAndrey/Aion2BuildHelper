import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Lock, Maximize2, Minus, Plus, Waypoints } from 'lucide-react'
import type { BoardReport, GoalReport } from '@shared/analysis/daevanion'
import { BOARD_CURRENCY, neighbors, type DaevanionNode } from '@shared/gamedata/daevanion'
import { skillIconSrc } from '@shared/gamedata/art'
import { formatStatValue } from '@shared/gamedata/stats'
import { DataFreshness } from '@/components/DataFreshness'
import { GuideSwitcher } from '@/components/GuideSwitcher'
import { StaleBoardsNotice } from '@/components/StaleBoardsNotice'
import { Card } from '@/components/ui/Card'
import { EmptyState, Legend, PageHeader } from '@/components/ui/misc'
import { Pill, toneOfShare } from '@/components/ui/Pill'
import { ProgressBar } from '@/components/ui/Progress'
import { cn, fmt } from '@/lib/format'
import { shareTone, TONE_TEXT, type Tone } from '@/lib/status'
import { SkillIcon } from '@/components/icons'
import { Tooltip } from '@/components/ui/InfoTip'
import { useCharacterContext } from '@/lib/report'

type Ctx = NonNullable<ReturnType<typeof useCharacterContext>>

export function DaevanionPage() {
  const ctx = useCharacterContext()!
  const { char, report, namer, guide } = ctx
  const d = report.daevanion
  const [boardId, setBoardId] = useState<number>(d.boards[0]?.board.id ?? 0)
  const board = d.boards.find((b) => b.board.id === boardId) ?? d.boards[0]
  const neededIds = new Set(d.goals.flatMap((g) => g.required.map((r) => r.node.id)))

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

      <StaleBoardsNotice list={ctx.report.boardsStale} namer={ctx.namer} className="mb-5" />
      <DataFreshness char={char} section="daevanion" className="mb-5" />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
        {d.boards.map((b) => {
          const need = d.goals.flatMap((g) => g.required.filter((r) => r.board.id === b.board.id))
          const needDone = need.filter((r) => r.taken).length
          const tone = shareTone(needDone, need.length)
          return (
            <Tooltip
              key={b.board.id}
              block
              wide
              content={`${b.board.ru} (${b.board.en}): открывается на ур. ${b.board.needLevel}, оплата — ${BOARD_CURRENCY[b.board.en] ?? 'кристаллы'}. Взято ${b.takenCount} из ${b.totalCount} узлов, вложено ${b.spent} из ${b.total} очк.${need.length ? ` Нужных по гайду узлов: ${needDone} из ${need.length}.` : ' Гайд на этой доске ничего не требует.'}`}
            >
              <button
                onClick={() => setBoardId(b.board.id)}
                className={cn(
                  'w-full rounded-xl border px-3 py-2.5 text-left transition-colors',
                  b.board.id === board.board.id ? 'border-accent/60 bg-accent-soft' : 'border-line bg-surface hover:border-line-strong'
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[13px] font-semibold">{b.board.ru}</span>
                  {!b.open ? (
                    <Lock size={12} className="text-ink-3" />
                  ) : need.length ? (
                    <span className={cn('tnum text-[11px]', TONE_TEXT[tone])}>
                      {needDone}/{need.length}
                    </span>
                  ) : null}
                </div>
                <div className="tnum mt-1 text-[11px] text-ink-3">
                  {b.takenCount}/{b.totalCount} узлов · {b.spent}/{b.total} очк.
                </div>
                <ProgressBar value={(b.spent / b.total) * 100} height={3} className="mt-1.5" color="var(--color-accent)" />
              </button>
            </Tooltip>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card
          title={`${board.board.ru} · ${board.board.en}`}
          hint={`Открывается с ур. ${board.board.needLevel}. Оплата: ${BOARD_CURRENCY[board.board.en] ?? 'кристаллы'}.`}
          actions={
            <Pill tone={board.open ? 'accent' : 'neutral'} tip="Сколько очков вложено в эту доску из стоимости всех её узлов.">
              {board.open ? `вложено ${board.spent} из ${board.total}` : `откроется на ур. ${board.board.needLevel}`}
            </Pill>
          }
        >
          <BoardView board={board} goals={d.goals} ctx={ctx} />
          <Legend
            items={[
              { swatch: <Swatch className="border-2 border-good bg-surface-3" />, text: 'иконка умения: +1 к уровню (зелёная рамка — взят)' },
              { swatch: <Swatch className="bg-teal" />, text: 'взят: стат' },
              { swatch: <Swatch className="rotate-45 bg-grade-legend" />, text: 'взят: крупный стат' },
              { swatch: <Swatch className="rotate-45 bg-grade-unique" />, text: 'взят: уникальный узел' },
              { swatch: <Swatch className="border-2 border-aether bg-transparent" />, text: 'нужен по гайду (ещё не взят)' },
              { swatch: <Swatch className="border border-dashed border-aether bg-transparent" />, text: 'путь к нужному' }
            ]}
          />
        </Card>

        <div className="flex min-w-0 flex-col gap-5">
          <Card title="Узлы умений на доске" hint="Узлы «+1 к уровню умения» — главное, ради чего гайды качают доски.">
            <div className="-mx-2 max-h-80 overflow-y-auto">
              {board.skillNodes
                .slice()
                .sort((a, b) => Number(neededIds.has(b.node.id)) - Number(neededIds.has(a.node.id)) || Number(b.taken) - Number(a.taken))
                .map(({ node, taken }) => {
                  const needed = neededIds.has(node.id)
                  const tone: Tone = needed ? (taken ? 'ok' : 'bad') : 'neutral'
                  const why = needed
                    ? taken
                      ? 'Взят — гайд его просит.'
                      : `Не взят, а гайд его просит. Стоит ${node.cost} очк. (плюс узлы по пути — см. план ниже).`
                    : taken
                      ? 'Взят; гайд этот узел не требует.'
                      : 'Не взят; гайд этот узел не требует.'
                  return (
                    <Tooltip key={node.id} block content={`${namer.node(node)}. ${why}`} wide>
                      <div className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] hover:bg-surface-2">
                        {node.skill && <SkillIcon id={node.skill} size={22} tone={tone} dim={!taken} />}
                        <span className={cn('min-w-0 flex-1', needed ? TONE_TEXT[tone] : taken ? 'text-ink-2' : 'text-ink-3')}>
                          {taken ? '✓ ' : ''}
                          {namer.node(node)}
                        </span>
                        <span className="tnum shrink-0 text-[11px] text-ink-3">{node.cost} очк.</span>
                      </div>
                    </Tooltip>
                  )
                })}
              {board.skillNodes.length === 0 && <p className="px-2 text-[13px] text-ink-3">На этой доске нет узлов умений — только статы.</p>}
            </div>
          </Card>
          <Card title="Статы со всех досок" hint="Сумма бонусов от всех взятых узлов.">
            <div className="-mx-2">
              {[...d.stats.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([stat, value]) => (
                  <Tooltip key={stat} block content={`${namer.stat(stat).main}: столько дают все взятые узлы на всех досках.`}>
                    <div className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-[13px] hover:bg-surface-2">
                      <span className="text-ink-2">{namer.stat(stat).main}</span>
                      <span className="tnum">{formatStatValue(stat, value, { sign: true })}</span>
                    </div>
                  </Tooltip>
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
        <Pill tone={toneOfShare(g.done, g.required.length)} tip={`Взято ${g.done} из ${g.required.length} узлов, которые просит эта цель.`}>
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
            <Tooltip content="Порядок взятия: каждый раз самый дешёвый оставшийся узел с учётом уже купленного пути. Нажмите на шаг — откроется его доска.">
              <span>План: сначала самое дешёвое</span>
            </Tooltip>
            <Tooltip content="Сколько очков (кристаллов) нужно на все оставшиеся узлы цели, включая узлы по пути.">
              <span className="tnum">всего {fmt(g.remainingCost)} очк.</span>
            </Tooltip>
          </div>
          <ol className="-mx-2 max-h-72 overflow-y-auto">
            {g.plan.map((step, i) => (
              <li key={step.node.id}>
                <Tooltip
                  block
                  wide
                  content={`${step.board.ru}: «${ctx.namer.node(step.node)}» — ${step.cost} очк.${step.via ? `, из них ${step.via} промежуточных узл. по пути` : ''}. Нажмите, чтобы открыть доску — нужный узел обведён голубым.`}
                >
                  <button
                    onClick={() => onBoard(step.board.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-surface-2"
                  >
                    <span className="tnum w-5 shrink-0 text-[11px] text-ink-3">{i + 1}.</span>
                    {step.node.skill && <SkillIcon id={step.node.skill} size={20} />}
                    <span className="min-w-0 flex-1 truncate">
                      <span className="text-ink-3">{step.board.ru}:</span> {ctx.namer.node(step.node)}
                    </span>
                    <span className="tnum shrink-0 text-[11px] text-ink-3">
                      {step.cost} очк.{step.via ? ` (+${step.via} по пути)` : ''}
                    </span>
                  </button>
                </Tooltip>
              </li>
            ))}
          </ol>
          {g.lockedCount > 0 && <p className="mt-2 text-xs text-ink-3">Ещё {g.lockedCount} узл. — на досках, закрытых по уровню.</p>}
        </>
      )}
    </Card>
  )
}

/** Размер клетки в «единицах доски»: SVG рисуется в них и растягивается под нужный масштаб. */
const CELL = 36
/** Доска по умолчанию — по ширине карточки, но не выше этой высоты (в пикселях). */
const FIT_MAX_HEIGHT = 680
const ZOOM_MIN = 0.6
const ZOOM_MAX = 4
const ZOOM_STEP = 1.25

/** Масштаб доски: «вписать» по ширине карточки, кнопки, Ctrl+колесо и перетаскивание мышью. */
function useBoardZoom(w: number, h: number) {
  const wrap = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [zoom, setZoom] = useState(1)
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null)

  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const fit = width ? Math.max(1, Math.min((width - 8) / w, FIT_MAX_HEIGHT / h)) : 1
  const scale = fit * zoom

  // Ctrl+колесо — масштаб вокруг курсора; обычное колесо прокручивает страницу как обычно.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      e.stopPropagation()
      const rect = el.getBoundingClientRect()
      const px = e.clientX - rect.left + el.scrollLeft
      const py = e.clientY - rect.top + el.scrollTop
      setZoom((z) => {
        const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, e.deltaY < 0 ? z * 1.12 : z / 1.12))
        const k = next / z
        requestAnimationFrame(() => {
          el.scrollLeft = px * k - (e.clientX - rect.left)
          el.scrollTop = py * k - (e.clientY - rect.top)
        })
        return next
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = wrap.current
    if (!el || e.button !== 0) return
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop }
  }, [])
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = wrap.current
    const d = drag.current
    if (!el || !d) return
    el.scrollLeft = d.left - (e.clientX - d.x)
    el.scrollTop = d.top - (e.clientY - d.y)
  }, [])
  const onPointerUp = useCallback(() => {
    drag.current = null
  }, [])

  return {
    wrap,
    scale,
    zoom,
    zoomIn: () => setZoom((z) => Math.min(ZOOM_MAX, z * ZOOM_STEP)),
    zoomOut: () => setZoom((z) => Math.max(ZOOM_MIN, z / ZOOM_STEP)),
    reset: () => setZoom(1),
    pan: { onPointerDown, onPointerMove, onPointerUp, onPointerLeave: onPointerUp }
  }
}

function ZoomButton({ onClick, tip, children }: { onClick: () => void; tip: string; children: React.ReactNode }) {
  return (
    <Tooltip content={tip}>
      <button
        onClick={onClick}
        className="flex h-7 min-w-7 items-center justify-center rounded-md border border-line-strong bg-surface-2 px-1.5 text-ink-2 hover:border-accent/50 hover:text-ink"
      >
        {children}
      </button>
    </Tooltip>
  )
}

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
    if (n.grade === 'Unique') return 'var(--color-grade-unique)'
    if (n.grade === 'Legend') return 'var(--color-grade-legend)'
    return 'var(--color-teal)'
  }

  const z = useBoardZoom(w, h)
  const W = w * z.scale
  const H = h * z.scale
  const zoomed = z.zoom > 1.001

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 z-20 flex items-center gap-1">
        <ZoomButton onClick={z.zoomOut} tip="Уменьшить (Ctrl + колесо вниз)">
          <Minus size={14} />
        </ZoomButton>
        <ZoomButton onClick={z.reset} tip="Вписать доску по ширине">
          <span className="tnum text-[11px] font-semibold">{Math.round(z.zoom * 100)}%</span>
        </ZoomButton>
        <ZoomButton onClick={z.zoomIn} tip="Увеличить (Ctrl + колесо вверх)">
          <Plus size={14} />
        </ZoomButton>
        <ZoomButton onClick={z.reset} tip="Вписать">
          <Maximize2 size={13} />
        </ZoomButton>
      </div>
      <div
        ref={z.wrap}
        {...z.pan}
        className={cn('relative overflow-auto pt-9', zoomed ? 'cursor-grab active:cursor-grabbing' : null)}
        style={{ maxHeight: zoomed ? '75vh' : undefined }}
      >
        <div className="relative mx-auto" style={{ width: W, height: H }}>
          <svg width={W} height={H} viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 select-none">
            <defs>
              <filter id="node-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="2.4" />
              </filter>
            </defs>
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
                  strokeOpacity={lit ? 0.75 : 1}
                  strokeWidth={lit ? 2.2 : 1}
                />
              )
            })}
            {nodes.map((n) => {
              const taken = board.taken.has(n.id) || n.type === 'Start'
              const skill = n.type === 'SkillLevel' && n.skill
              const diamond = n.grade === 'Unique' || n.grade === 'Legend'
              const r = n.type === 'Start' ? 12 : skill ? 13 : diamond ? 10 : 6.5
              const dim = !board.open && !taken
              return (
                <g key={n.id} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(null)} className="cursor-default" opacity={dim ? 0.45 : 1}>
                  {wanted.has(n.id) && <circle cx={x(n)} cy={y(n)} r={r + 5} fill="none" stroke="var(--color-aether)" strokeWidth={2} />}
                  {path.has(n.id) && !wanted.has(n.id) && (
                    <circle cx={x(n)} cy={y(n)} r={r + 4} fill="none" stroke="var(--color-aether)" strokeWidth={1.2} strokeDasharray="3 2" />
                  )}
                  {/* Свечение взятых крупных узлов — как подсветка в окне Даэваниона */}
                  {taken && (diamond || skill || n.type === 'Start') && (
                    <rect
                      x={x(n) - r}
                      y={y(n) - r}
                      width={r * 2}
                      height={r * 2}
                      rx={skill ? 5 : 2}
                      transform={diamond ? `rotate(45 ${x(n)} ${y(n)})` : undefined}
                      fill={skill ? 'var(--color-good)' : fill(n)}
                      opacity={0.55}
                      filter="url(#node-glow)"
                    />
                  )}
                  {skill ? (
                    <>
                      <rect
                        x={x(n) - r - 1.5}
                        y={y(n) - r - 1.5}
                        width={r * 2 + 3}
                        height={r * 2 + 3}
                        rx={6}
                        fill="var(--color-bg)"
                        stroke={taken ? 'var(--color-good)' : 'var(--color-line-strong)'}
                        strokeWidth={1.5}
                      />
                      <image
                        href={skillIconSrc(n.skill!)}
                        x={x(n) - r}
                        y={y(n) - r}
                        width={r * 2}
                        height={r * 2}
                        preserveAspectRatio="xMidYMid slice"
                        style={{ clipPath: 'inset(0 round 4.5px)', filter: taken ? undefined : 'grayscale(1) brightness(0.55)' }}
                      />
                    </>
                  ) : (
                    <rect
                      x={x(n) - r}
                      y={y(n) - r}
                      width={r * 2}
                      height={r * 2}
                      rx={diamond ? 2 : 2.5}
                      transform={diamond ? `rotate(45 ${x(n)} ${y(n)})` : undefined}
                      fill={fill(n)}
                      stroke={taken ? 'rgb(255 255 255 / 0.35)' : 'var(--color-line-strong)'}
                      strokeWidth={taken ? 1 : 1}
                    />
                  )}
                  {n.type === 'Start' && (
                    <text x={x(n)} y={y(n) + 4} textAnchor="middle" fontSize="12" fill="var(--color-on-accent)" fontWeight={700}>
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
              style={{ left: Math.min(x(hover) * z.scale + 14 * z.scale, W - 230), top: Math.max(0, (y(hover) - 10) * z.scale) }}
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
    </div>
  )
}
