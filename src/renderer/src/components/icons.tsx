// Иконки умений и специализаций — родной арт игры (public/icons, скачивается npm run gamedata).
// Для умений, чьих иконок нет (другие классы, пока справочник не обновлён), — аккуратная заглушка.

import { useState } from 'react'
import { skillDef } from '@shared/gamedata/skills'
import type { Tone } from '@/lib/status'
import { cn } from '@/lib/format'

const RING: Record<Tone, string> = {
  ok: 'ring-2 ring-good/80',
  warn: 'ring-2 ring-warning/80',
  bad: 'ring-2 ring-critical/80',
  neutral: 'ring-1 ring-line-strong'
}

export function SkillIcon({
  id,
  size = 32,
  tone,
  dim,
  className
}: {
  id: number
  size?: number
  /** Цветная обводка по вердикту. */
  tone?: Tone
  /** Приглушить (не изучено, закрыто). */
  dim?: boolean
  className?: string
}) {
  const [broken, setBroken] = useState(false)
  const def = skillDef(id)
  const radius = size >= 40 ? 'rounded-lg' : 'rounded-md'
  if (broken) {
    return (
      <span
        className={cn('inline-flex shrink-0 items-center justify-center bg-surface-3 font-semibold text-ink-3', radius, tone && RING[tone], className)}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {(def?.ru ?? def?.en ?? '?').slice(0, 1)}
      </span>
    )
  }
  return (
    <img
      src={`./icons/skills/${id}.webp`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      draggable={false}
      onError={() => setBroken(true)}
      className={cn('shrink-0 bg-surface-3 object-cover', radius, tone && RING[tone], dim && 'opacity-40 grayscale', className)}
      style={{ width: size, height: size }}
    />
  )
}

/** Значок варианта специализации: цветной щит 1–5 у активных умений, золотой — у стигм. */
export function SpecIcon({ n, stigma, size = 20, dim, className }: { n: number; stigma?: boolean; size?: number; dim?: boolean; className?: string }) {
  return (
    <img
      src={`./icons/specs/${stigma ? 'spec-stigma' : `spec-${n}`}.webp`}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={cn('shrink-0', dim && 'opacity-35 grayscale', className)}
      style={{ width: size, height: size }}
    />
  )
}
