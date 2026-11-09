// Значок статуса — нарисован в Figma («Aion2 Build Helper — значки статуса», компонент StatusBadge)
// и перенесён сюда как SVG на сетке 16 px. Форма различает статусы и без цвета:
//   ok — круг с галочкой, warn — ромб с «!», bad — восьмиугольник с крестиком, info — скруглённый квадрат с «i».
// Цвета — из токенов темы: верх градиента — токен + 35% белого, низ — токен × 0,78, обводка — токен × 0,28.

import { useId } from 'react'
import { hash01 } from '@/components/fx'
import { cn } from '@/lib/format'
import type { Tone } from '@/lib/status'

export type BadgeKind = Tone | 'info'

const TOKEN: Record<Exclude<BadgeKind, 'neutral'>, string> = {
  ok: 'var(--color-good)',
  warn: 'var(--color-warning)',
  bad: 'var(--color-critical)',
  info: 'var(--color-info)'
}

// Формы (контуры совпадают с Figma, скругления посчитаны дугами).
const SHAPE: Record<Exclude<BadgeKind, 'neutral'>, string> = {
  ok: 'M8 0a8 8 0 1 1 0 16a8 8 0 1 1 0-16z',
  // Ромб оптически крупнее на 2 px — иначе кажется мельче соседей.
  warn: 'M6.232 0.768A2.5 2.5 0 0 1 9.768 0.768L15.232 6.232A2.5 2.5 0 0 1 15.232 9.768L9.768 15.232A2.5 2.5 0 0 1 6.232 15.232L0.768 9.768A2.5 2.5 0 0 1 0.768 6.232Z',
  bad: 'M5.307 0L10.693 0A1.5 1.5 0 0 1 11.753 0.439L15.561 4.247A1.5 1.5 0 0 1 16 5.307L16 10.693A1.5 1.5 0 0 1 15.561 11.753L11.753 15.561A1.5 1.5 0 0 1 10.693 16L5.307 16A1.5 1.5 0 0 1 4.247 15.561L0.439 11.753A1.5 1.5 0 0 1 0 10.693L0 5.307A1.5 1.5 0 0 1 0.439 4.247L4.247 0.439A1.5 1.5 0 0 1 5.307 0Z',
  info: 'M5 0H11A5 5 0 0 1 16 5V11A5 5 0 0 1 11 16H5A5 5 0 0 1 0 11V5A5 5 0 0 1 5 0Z'
}

function Glyph({ kind, ink }: { kind: Exclude<BadgeKind, 'neutral'>; ink: string }) {
  const line = { fill: 'none', style: { stroke: ink }, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  switch (kind) {
    case 'ok':
      return <path d="M4.5 8L7 10.5L11.5 5.25" {...line} />
    case 'bad':
      return <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" {...line} />
    case 'warn':
      return (
        <>
          <rect x={7.1} y={3.4} width={1.8} height={6.2} rx={0.9} style={{ fill: ink }} />
          <circle cx={8} cy={11.7} r={0.9} style={{ fill: ink }} />
        </>
      )
    case 'info':
      return (
        <>
          <circle cx={8} cy={4.3} r={0.9} style={{ fill: ink }} />
          <rect x={7.1} y={6.4} width={1.8} height={6.2} rx={0.9} style={{ fill: ink }} />
        </>
      )
  }
}

/** Значок статуса: цвет всегда вместе с формой и знаком. neutral — ничего не рисуем. */
export function StatusBadge({ tone, size = 15, className }: { tone: BadgeKind; size?: number; className?: string }) {
  const raw = useId()
  if (tone === 'neutral') return null
  const id = raw.replace(/[^a-zA-Z0-9_-]/g, '')
  const token = TOKEN[tone]
  const shape = SHAPE[tone]
  // На жёлтом белый знак теряется — у «обратить внимание» знак тёмный.
  const ink = tone === 'warn' ? `color-mix(in srgb, ${token}, black 85%)` : 'white'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      overflow="visible"
      aria-hidden
      className={cn('fx-pop shrink-0', className)}
      style={{
        filter: `drop-shadow(0 ${size / 16}px ${size / 16}px rgb(0 0 0 / 0.5))`,
        ['--pop-delay' as string]: `${Math.round(hash01(raw) * 220)}ms`
      }}
    >
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: `color-mix(in srgb, ${token}, white 35%)` }} />
          <stop offset="0.5" style={{ stopColor: token }} />
          <stop offset="1" style={{ stopColor: `color-mix(in srgb, ${token}, black 22%)` }} />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <path d={shape} />
        </clipPath>
        <filter id={`${id}s`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0.5" stdDeviation="0.35" floodColor="black" floodOpacity="0.35" />
        </filter>
      </defs>
      <path d={shape} fill={`url(#${id}g)`} />
      <g clipPath={`url(#${id}c)`}>
        {/* Блик сверху и обводка внутрь 1 px. */}
        <ellipse cx={8} cy={2.5} rx={6.5} ry={4} fill="white" opacity={0.24} />
        <path d={shape} fill="none" strokeWidth={2} style={{ stroke: `color-mix(in srgb, ${token}, black 72%)` }} />
      </g>
      <g filter={`url(#${id}s)`}>
        <Glyph kind={tone} ink={ink} />
      </g>
    </svg>
  )
}
