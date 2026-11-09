import { motion } from 'motion/react'
import { CountUp } from '@/components/fx'
import { useAnimate } from '@/lib/motion'
import { cn } from '@/lib/format'

const scoreColor = (v: number) => (v >= 85 ? 'var(--color-good)' : v >= 60 ? 'var(--color-warning)' : 'var(--color-critical)')

/** Полоса прогресса 0…100. */
export function ProgressBar({ value, className, color, height = 6 }: { value: number; className?: string; color?: string; height?: number }) {
  const v = Math.max(0, Math.min(100, value))
  const animate = useAnimate()
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-surface-3', className)} style={{ height }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color ?? scoreColor(v) }}
        initial={animate ? { width: 0 } : false}
        animate={{ width: `${v}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  )
}

/** Кольцо с оценкой 0…100 в центре. */
export function ScoreRing({ value, size = 96, stroke = 8, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(100, value))
  const animate = useAnimate()
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-3)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={scoreColor(v)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={animate ? { strokeDashoffset: c } : false}
          animate={{ strokeDashoffset: c * (1 - v / 100) }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tnum text-2xl font-semibold" style={{ fontSize: size / 4 }}>
          <CountUp value={v} duration={1000} />
        </span>
        {label && <span className="text-[10px] tracking-wider text-ink-3 uppercase">{label}</span>}
      </div>
    </div>
  )
}
