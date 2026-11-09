// Схема макроса мыши на полосе времени: когда зажата каждая клавиша, где границы кадров при 60 FPS
// и что короче кадра. Бегунок идёт в 20 раз медленнее, чтобы глаз успевал за нажатиями.

import { useMemo } from 'react'
import { FRAME_60_MS, keyIntervals } from '@shared/analysis/inputMacro'
import type { InputEvent } from '@shared/guide/types'
import { cn } from '@/lib/format'

const ROW = 26
const SLOWDOWN = 20

export function MacroTimeline({
  events,
  repeatMs,
  macroKey,
  purpose
}: {
  events: InputEvent[]
  repeatMs: number
  macroKey?: string
  purpose: (key: string) => string
}) {
  const t = useMemo(() => keyIntervals(events, repeatMs, 2), [events, repeatMs])
  if (!t.totalMs) return null
  const x = (ms: number) => (ms / t.totalMs) * 1000
  const frames = Array.from({ length: Math.floor(t.totalMs / FRAME_60_MS) }, (_, i) => (i + 1) * FRAME_60_MS)
  const height = t.keys.length * ROW

  return (
    <div className="mt-4">
      <div className="flex items-end justify-between gap-3 text-[11px] text-ink-3">
        <span>Два прогона подряд</span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-sm bg-accent" /> клавиша связки зажата
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-sm bg-aether" /> клик
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-sm border border-warning" /> короче кадра
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-px bg-ink-3" /> кадр при 60 FPS
          </span>
        </span>
      </div>
      <div className="mt-2 grid grid-cols-[88px_minmax(0,1fr)] gap-x-3">
        <div className="flex flex-col">
          {t.keys.map((k) => (
            <div key={k} className="flex items-center gap-1.5 text-[11px] text-ink-2" style={{ height: ROW }}>
              <span className="font-semibold text-ink">{k}</span>
              <span className="truncate text-ink-3">{purpose(k)}</span>
            </div>
          ))}
        </div>
        <div className="relative overflow-hidden rounded-lg border border-line bg-surface-2/60">
          <svg viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none" className="block w-full" style={{ height }} aria-hidden>
            {frames.map((f) => (
              <line key={f} x1={x(f)} x2={x(f)} y1={0} y2={height} stroke="var(--color-line-strong)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            ))}
            <line
              x1={x(t.cycleMs)}
              x2={x(t.cycleMs)}
              y1={0}
              y2={height}
              stroke="var(--color-ink-3)"
              strokeDasharray="3 3"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            {t.intervals.map((iv, i) => {
              const row = t.keys.indexOf(iv.key)
              const short = iv.end - iv.start < FRAME_60_MS && iv.key !== macroKey
              return (
                <rect
                  key={i}
                  x={x(iv.start)}
                  y={row * ROW + 6}
                  width={Math.max(2, x(iv.end) - x(iv.start))}
                  height={ROW - 12}
                  rx={3}
                  fill={iv.key === macroKey ? 'var(--color-accent)' : 'var(--color-aether)'}
                  stroke={short ? 'var(--color-warning)' : 'none'}
                  strokeWidth={short ? 2 : 0}
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </svg>
          {/* Бегунок — только при «Полных» анимациях (fx-ambient). */}
          <span
            className="fx-ambient fx-playhead pointer-events-none absolute top-0 bottom-0 w-0.5 bg-ink/80"
            style={{ animationDuration: `${t.totalMs * SLOWDOWN}ms` }}
          />
        </div>
      </div>
      <div className={cn('mt-1 grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 text-[10.5px] text-ink-3')}>
        <span />
        <span className="tnum flex justify-between">
          <span>0</span>
          <span>{Math.round(t.cycleMs)} мс — новый прогон</span>
          <span>{Math.round(t.totalMs)} мс</span>
        </span>
      </div>
    </div>
  )
}
