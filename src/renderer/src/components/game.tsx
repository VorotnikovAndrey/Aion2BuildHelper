// Элементы, которые знают про игру: названия, вердикты строк, грейды, значки классов.

import type { ReactNode } from 'react'
import { Axe, Crosshair, Flame, HeartPulse, Music, Shield, Sparkles, Swords, type LucideIcon } from 'lucide-react'
import type { Impact } from '@shared/analysis/build'
import type { Verdict } from '@shared/analysis/weights'
import { GRADES, type ItemGrade } from '@shared/gamedata/slots'
import type { Label } from '@shared/names'
import type { ClassKey } from '@shared/types'
import { cn } from '@/lib/format'
import { Pill } from './ui/Pill'
import { Tooltip } from './ui/InfoTip'

/** Название с английским вариантом мелко (режим «оба названия»). */
export function Name({ label, className, altClassName, inline }: { label: Label; className?: string; altClassName?: string; inline?: boolean }) {
  return (
    <span className={cn(inline ? 'inline' : 'inline-flex min-w-0 flex-col', className)}>
      <span className="truncate">{label.main}</span>
      {label.alt && <span className={cn('truncate text-[10.5px] text-ink-3', inline && 'ml-1.5', altClassName)}>{label.alt}</span>}
    </span>
  )
}

// Зелёный — как в гайде, жёлтый — приемлемо/слабо (обратить внимание), красный — не по гайду. См. lib/status.ts.
const VERDICT: Record<Verdict, string> = {
  great: 'bg-good-soft text-good border-good/35',
  good: 'bg-warning-soft text-warning border-warning/35',
  weak: 'bg-warning/5 text-warning/75 border-warning/20 border-dashed',
  bad: 'bg-critical-soft text-critical border-critical/30 line-through decoration-critical/70'
}

export const VERDICT_TEXT: Record<Verdict, string> = {
  great: 'нужно по гайду',
  good: 'приемлемо',
  weak: 'слабо — при случае заменить',
  bad: 'не по гайду — менять'
}

/** Строка вещи / ячейка рода / манакамень, окрашенные по пользе. */
export function VerdictChip({ verdict, children, tip, className }: { verdict: Verdict; children: ReactNode; tip?: ReactNode; className?: string }) {
  const chip = (
    <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs whitespace-nowrap', VERDICT[verdict], className)}>
      {children}
    </span>
  )
  return tip ? <Tooltip content={tip}>{chip}</Tooltip> : chip
}

/** Чип «что ловить». */
export function WishChip({ children, tip }: { children: ReactNode; tip?: ReactNode }) {
  const chip = (
    <span className="inline-flex items-center rounded-md border border-aether/35 bg-aether-soft px-2 py-0.5 text-xs whitespace-nowrap text-aether">
      {children}
    </span>
  )
  return tip ? <Tooltip content={tip}>{chip}</Tooltip> : chip
}

const GRADE_COLOR: Record<ItemGrade, string> = {
  mythic: 'text-grade-mythic',
  unique: 'text-grade-unique',
  epic: 'text-grade-epic',
  rare: 'text-grade-rare',
  common: 'text-grade-common',
  unknown: 'text-ink'
}

export function GradeText({ grade, children, className }: { grade: ItemGrade; children: ReactNode; className?: string }) {
  return (
    <Tooltip content={grade !== 'unknown' ? `Грейд: ${GRADES[grade].ru}` : null}>
      <span className={cn(GRADE_COLOR[grade], className)}>{children}</span>
    </Tooltip>
  )
}

export const gradeBorder = (grade: ItemGrade) =>
  ({
    mythic: 'border-grade-mythic/60',
    unique: 'border-grade-unique/60',
    epic: 'border-grade-epic/60',
    rare: 'border-grade-rare/60',
    common: 'border-grade-common/40',
    unknown: 'border-line-strong'
  })[grade]

const IMPACT: Record<Impact, { tone: 'critical' | 'warning' | 'neutral'; text: string; tip: string }> = {
  high: { tone: 'critical', text: 'Важно', tip: 'Сильно влияет на билд: ключевые умения, специализации, дешёвые узлы досок. Делать в первую очередь.' },
  medium: { tone: 'warning', text: 'Стоит', tip: 'Заметно улучшит билд, но не горит: заточка аркан, перековка строк, вторичные умения.' },
  low: { tone: 'neutral', text: 'Мелочь', tip: 'Небольшая польза: манакамни, ячейки рода, поиск карты лучше. Когда будет время и ресурсы.' }
}

export function ImpactPill({ impact }: { impact: Impact }) {
  return (
    <Pill tone={IMPACT[impact].tone} tip={IMPACT[impact].tip}>
      {IMPACT[impact].text}
    </Pill>
  )
}

const CLASS_ICON: Record<ClassKey, LucideIcon> = {
  gladiator: Axe,
  templar: Shield,
  assassin: Swords,
  ranger: Crosshair,
  sorcerer: Flame,
  spiritmaster: Sparkles,
  cleric: HeartPulse,
  chanter: Music
}

export function ClassIcon({ cls, size = 16, className }: { cls: ClassKey | null; size?: number; className?: string }) {
  const Icon = cls ? CLASS_ICON[cls] : Shield
  return <Icon size={size} className={className} />
}

/** Вес из гайда точками: ●●●○○. */
export function WeightDots({ weight, className }: { weight: number; className?: string }) {
  return (
    <Tooltip content={weight ? `Важность по гайду: ${weight} из 5 (5 — главное, 1 — лучше, чем ничего).` : 'Гайд этот стат не ценит (важность 0).'}>
      <span className={cn('inline-flex gap-0.5', className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={cn('h-1.5 w-1.5 rounded-full', i <= weight ? 'bg-accent' : 'bg-surface-3')} />
        ))}
      </span>
    </Tooltip>
  )
}
