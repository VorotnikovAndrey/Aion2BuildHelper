// Пороги статов: шкала с отметками целей и подписью «хватает / не хватает».
// Для контента (меткость, крит) — сколько нужно; для ориентиров — сколько в среднем у топ-игроков.

import type { TargetStatus } from '@shared/analysis/targets'
import { formatStatValue } from '@shared/gamedata/stats'
import { StatusBadge } from '@/components/art'
import { Tooltip } from '@/components/ui/InfoTip'
import { cn } from '@/lib/format'
import type { Tone } from '@/lib/status'
import { t } from '@shared/i18n'

const fmt = (ts: TargetStatus, v: number) => formatStatValue(ts.target.stats[0], Math.round(v * 10) / 10)

/** Хватает — зелёный; не хватает — жёлтый (это ориентир, а не провал). */
export const targetTone = (ts: TargetStatus): Tone => (ts.next ? 'warn' : 'ok')

export function targetText(ts: TargetStatus): string {
  const kind = ts.target.kind
  if (!ts.next) return kind === 'top' ? t('не ниже, чем у топ-игроков класса') : kind === 'stage' ? t('не ниже, чем у автора на этой стадии') : t('хватает')
  const gap = ts.next.value - ts.current
  if (kind === 'top') return t('ниже среднего у топ-игроков класса на {t}', { t: fmt(ts, gap) })
  if (kind === 'stage') return t('не хватает {t} до уровня автора на стадии «{next}»', { t: fmt(ts, gap), next: ts.next.label })
  return t('не хватает {t} до «{next}»', { t: fmt(ts, gap), next: ts.next.label })
}

/** Строка порога: название, текущее значение, шкала с отметками целей. */
export function TargetBar({ t: ts, compact }: { t: TargetStatus; compact?: boolean }) {
  const goals = ts.target.goals
  const max = Math.max(goals[goals.length - 1].value, ts.current) * 1.08
  const pct = (v: number) => `${Math.min(100, (v / max) * 100)}%`
  const tone = targetTone(ts)
  return (
    <Tooltip
      block
      wide
      content={
        <>
          <b className="text-ink">{ts.target.name}</b>: {fmt(ts, ts.current)}
          <span className="mt-1 block">{goals.map((g) => `${fmt(ts, g.value)} — ${g.label}`).join('; ')}.</span>
          {ts.target.note && <span className="mt-1 block text-ink-3">{ts.target.note}</span>}
        </>
      }
    >
      <div className="w-full">
        <div className="flex items-baseline justify-between gap-2">
          <span className={cn('flex min-w-0 items-center gap-1.5', compact ? 'text-xs' : 'text-[13px]')}>
            <StatusBadge tone={tone} size={compact ? 12 : 14} />
            <span className="truncate text-ink-2">{ts.target.name}</span>
          </span>
          <span className={cn('tnum shrink-0 font-semibold', compact ? 'text-xs' : 'text-[13px]', tone === 'ok' ? 'text-good' : 'text-ink')}>
            {fmt(ts, ts.current)}
            <span className="font-normal text-ink-3"> / {fmt(ts, (ts.next ?? goals[goals.length - 1]).value)}</span>
          </span>
        </div>
        <div className={cn('relative mt-1.5 rounded-full bg-surface-3', compact ? 'h-1.5' : 'h-2')}>
          <div className={cn('h-full rounded-full', tone === 'ok' ? 'bg-good' : 'bg-warning')} style={{ width: pct(ts.current) }} />
          {goals.map((g) => (
            <span key={g.value} className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-ink/70" style={{ left: pct(g.value) }} />
          ))}
        </div>
        {!compact && <div className="mt-1 text-[11px] text-ink-3">{targetText(ts)}</div>}
      </div>
    </Tooltip>
  )
}
