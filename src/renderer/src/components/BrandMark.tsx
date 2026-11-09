// Значок приложения: золотые крылья даэва вокруг кристалла эфира. Та же геометрия, что build/icon.svg
// (из него собираются icon.png и icon.ico) — меняйте вместе. Здесь значок разобран на части с классами,
// чтобы заставка (Splash) анимировала их по отдельности; в боковом меню он просто стоит.

import { useId, type CSSProperties } from 'react'
import { cn } from '@/lib/format'

/** Перья одного крыла (правого; левое — зеркально), сверху вниз — в этом порядке они и раскрываются. */
const FEATHERS: { d: string; dark?: boolean }[] = [
  { d: 'M106,118 C128,98 146,76 156,50 C164,38 172,32 178,30 C176,54 164,80 144,100 C132,110 120,117 110,122 Z' },
  { d: 'M108,124 C132,112 154,100 180,90 C172,108 156,118 136,126 C126,129 118,130 110,130 Z' },
  { d: 'M108,132 C130,130 154,128 178,132 C162,144 140,148 116,142 Z', dark: true },
  { d: 'M106,140 C124,146 140,154 154,166 C134,168 120,160 104,150 Z', dark: true }
]
const CRYSTAL = 'M100,36 L120,98 L100,166 L80,98 Z'
const SPARK = 'M0,-10 c1.5,7 3,8.5 10,10 c-7,1.5 -8.5,3 -10,10 c-1.5,-7 -3,-8.5 -10,-10 c7,-1.5 8.5,-3 10,-10 z'

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties

export function BrandMark({ size = 34, className }: { size?: number | string; className?: string }) {
  // Несколько значков на странице (меню и заставка) — у градиентов должны быть разные id.
  const id = useId().replace(/:/g, '')
  const u = (name: string) => `url(#${name}-${id})`
  const wing = (side: 'r' | 'l') => (
    <g className={cn('a2m-wing', `a2m-wing--${side}`)} stroke="var(--color-brand-line)" strokeWidth={2.4} strokeLinejoin="round">
      {FEATHERS.map((f, i) => (
        <path key={i} className="a2m-feather" style={delay(0.5 + i * 0.08)} d={f.d} fill={u(f.dark ? 'gold-dark' : 'gold')} />
      ))}
    </g>
  )
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={cn('a2m', className)} aria-hidden>
      <defs>
        <radialGradient id={`bg-${id}`} cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stopColor="var(--color-brand-bg-1)" />
          <stop offset="0.6" stopColor="var(--color-brand-bg-2)" />
          <stop offset="1" stopColor="var(--color-brand-bg-3)" />
        </radialGradient>
        <linearGradient id={`gold-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-brand-gold-1)" />
          <stop offset="0.5" stopColor="var(--color-brand-gold-2)" />
          <stop offset="1" stopColor="var(--color-brand-gold-3)" />
        </linearGradient>
        <linearGradient id={`gold-dark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-brand-gold-4)" />
          <stop offset="1" stopColor="var(--color-brand-gold-5)" />
        </linearGradient>
        <linearGradient id={`rim-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-brand-rim-1)" />
          <stop offset="0.5" stopColor="var(--color-brand-rim-2)" />
          <stop offset="1" stopColor="var(--color-brand-rim-3)" />
        </linearGradient>
        <linearGradient id={`crystal-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-brand-crystal-1)" />
          <stop offset="0.35" stopColor="var(--color-brand-crystal-2)" />
          <stop offset="1" stopColor="var(--color-brand-crystal-3)" />
        </linearGradient>
        <radialGradient id={`halo-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.55" stopColor="var(--color-brand-halo)" stopOpacity="0" />
          <stop offset="0.78" stopColor="var(--color-brand-halo)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--color-brand-halo)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`glow-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--color-brand-glow)" stopOpacity="0.75" />
          <stop offset="1" stopColor="var(--color-brand-glow)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`glint-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--color-brand-crystal-1)" stopOpacity="0" />
          <stop offset="0.5" stopColor="var(--color-brand-crystal-1)" stopOpacity="0.95" />
          <stop offset="1" stopColor="var(--color-brand-crystal-1)" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`crystal-clip-${id}`}>
          <path d={CRYSTAL} />
        </clipPath>
      </defs>

      <g className="a2m-tile">
        <rect x="6" y="6" width="188" height="188" rx="46" fill={u('bg')} />
        <rect x="6" y="6" width="188" height="188" rx="46" fill="none" stroke={u('rim')} strokeWidth="5" />
      </g>
      <circle className="a2m-halo" cx="100" cy="100" r="70" fill={u('halo')} />
      <circle className="a2m-glow" cx="100" cy="98" r="40" fill={u('glow')} />
      <circle className="a2m-ring" cx="100" cy="100" r="58" fill="none" stroke="var(--color-brand-halo)" strokeWidth="2" opacity="0" />

      {wing('r')}
      {/* Левое крыло — зеркало правого: анимация внутри зеркала раскрывает их симметрично. */}
      <g transform="translate(200 0) scale(-1 1)">{wing('l')}</g>

      <g className="a2m-crystal">
        <path d={CRYSTAL} fill={u('crystal')} stroke="var(--color-brand-line)" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M100,38 L118.5,98 L100,98 Z" fill="var(--color-brand-crystal-1)" fillOpacity="0.45" />
        <path d="M100,98 L118.5,98 L100,164 Z" fill="var(--color-brand-crystal-shade)" fillOpacity="0.35" />
        <g clipPath={u('crystal-clip')}>
          <rect className="a2m-glint" x="60" y="30" width="26" height="150" fill={u('glint')} opacity="0" />
        </g>
      </g>

      <g transform="translate(142 54)">
        <path className="a2m-spark" d={SPARK} fill="var(--color-brand-spark)" />
      </g>
    </svg>
  )
}
