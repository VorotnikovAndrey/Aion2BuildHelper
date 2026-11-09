// Пороги статов: шкала с отметками целей и подписью «хватает / не хватает».
// Для контента (меткость, крит) — сколько нужно; для ориентиров — сколько в среднем у топ-игроков.

import type { TargetStatus } from '@shared/analysis/targets'
import { formatStatValue } from '@shared/gamedata/stats'
import { StatusBadge } from '@/components/art'
import { Tooltip } from '@/components/ui/InfoTip'
import { cn } from '@/lib/format'
import type { Tone } from '@/lib/status'

const fmt = (t: TargetStatus, v: number) => formatStatValue(t.target.stats[0], Math.round(v * 10) / 10)

/** Хватает — зелёный; не хватает — жёлтый (это ориентир, а не провал). */
export const targetTone = (t: TargetStatus): Tone => (t.next ? 'warn' : 'ok')

export function targetText(t: TargetStatus): string {
  const kind = t.target.kind
  if (!t.next) return kind === 'top' ? 'не ниже, чем у топ-игроков класса' : kind === 'stage' ? 'не ниже, чем у автора на этой стадии' : 'хватает'
  const gap = t.next.value - t.current
  if (kind === 'top') return `ниже среднего у топ-игроков класса на ${fmt(t, gap)}`
  if (kind === 'stage') return `не хватает ${fmt(t, gap)} до уровня автора на стадии «${t.next.label}»`
  return `не хватает ${fmt(t, gap)} до «${t.next.label}»`
}

/** Строка порога: название, текущее значение, шкала с отметками целей. */
export function TargetBar({ t, compact }: { t: TargetStatus; compact?: boolean }) {
  const goals = t.target.goals
  const max = Math.max(goals[goals.length - 1].value, t.current) * 1.08
  const pct = (v: number) => `${Math.min(100, (v / max) * 100)}%`
  const tone = targetTone(t)
  return (
    <Tooltip
      block
      wide
      content={
        <>
          <b className="text-ink">{t.target.name}</b>: {fmt(t, t.current)}
          <span className="mt-1 block">{goals.map((g) => `${fmt(t, g.value)} — ${g.label}`).join('; ')}.</span>
          {t.target.note && <span className="mt-1 block text-ink-3">{t.target.note}</span>}
        </>
      }
    >
      <div className="w-full">
        <div className="flex items-baseline justify-between gap-2">
          <span className={cn('flex min-w-0 items-center gap-1.5', compact ? 'text-xs' : 'text-[13px]')}>
            <StatusBadge tone={tone} size={compact ? 12 : 14} />
            <span className="truncate text-ink-2">{t.target.name}</span>
          </span>
          <span className={cn('tnum shrink-0 font-semibold', compact ? 'text-xs' : 'text-[13px]', tone === 'ok' ? 'text-good' : 'text-ink')}>
            {fmt(t, t.current)}
            <span className="font-normal text-ink-3"> / {fmt(t, (t.next ?? goals[goals.length - 1]).value)}</span>
          </span>
        </div>
        <div className={cn('relative mt-1.5 rounded-full bg-surface-3', compact ? 'h-1.5' : 'h-2')}>
          <div className={cn('h-full rounded-full', tone === 'ok' ? 'bg-good' : 'bg-warning')} style={{ width: pct(t.current) }} />
          {goals.map((g) => (
            <span key={g.value} className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-ink/70" style={{ left: pct(g.value) }} />
          ))}
        </div>
        {!compact && <div className="mt-1 text-[11px] text-ink-3">{targetText(t)}</div>}
      </div>
    </Tooltip>
  )
}
