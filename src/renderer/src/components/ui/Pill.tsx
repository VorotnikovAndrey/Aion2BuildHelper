import type { ReactNode } from 'react'
import { cn } from '@/lib/format'

export type Tone = 'neutral' | 'accent' | 'good' | 'warning' | 'critical' | 'info' | 'aether' | 'teal'

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-ink-2 border-line-strong',
  accent: 'bg-accent-soft text-accent-2 border-accent/30',
  good: 'bg-good-soft text-good border-good/30',
  warning: 'bg-warning-soft text-warning border-warning/30',
  critical: 'bg-critical-soft text-critical border-critical/30',
  info: 'bg-info/10 text-info border-info/30',
  aether: 'bg-aether-soft text-aether border-aether/30',
  teal: 'bg-teal/10 text-teal border-teal/30'
}

export function Pill({ tone = 'neutral', children, className, icon }: { tone?: Tone; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-4 font-medium whitespace-nowrap',
        TONES[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  )
}

/** Тон по доле готовности: зелёный — всё, жёлтый — больше половины, красный — меньше. */
export function toneOfShare(done: number, total: number): Tone {
  if (!total) return 'neutral'
  if (done >= total) return 'good'
  if (done / total >= 0.5) return 'warning'
  return 'critical'
}

export function toneOfScore(score: number): Tone {
  return score >= 85 ? 'good' : score >= 60 ? 'warning' : 'critical'
}
