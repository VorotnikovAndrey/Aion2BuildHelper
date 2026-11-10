// Советы автора гайда: тексты автора билда Questlog (о билде, стадиях, умениях, досках) или советы своего гайда.
// Текст — как написал автор (обычно по-английски), поэтому длинный свёрнут до нескольких строк.

import { useState } from 'react'
import { BookOpen, Flag, Lightbulb, Network, Swords, type LucideIcon } from 'lucide-react'
import type { Guide, GuideStage, GuideTip, GuideTipKind } from '@shared/guide/types'
import { t } from '@shared/i18n'
import { cn } from '@/lib/format'

export const TIP_KIND: Record<GuideTipKind, { label: string; icon: LucideIcon }> = {
  build: { label: t('О билде'), icon: BookOpen },
  stage: { label: t('Заметка стадии'), icon: Flag },
  skills: { label: t('Умения и ротация'), icon: Swords },
  boards: { label: t('Доски Даэваниона'), icon: Network }
}

/** Советы, которые относятся к стадии (или ко всему гайду). Без стадии — все. */
export function tipsFor(guide: Guide | null, stage: GuideStage | null, kinds?: GuideTipKind[]): GuideTip[] {
  return (guide?.tips ?? []).filter((x) => (!kinds || (x.kind && kinds.includes(x.kind))) && (!stage || !x.stages || x.stages.includes(stage.id)))
}

export function TipItem({ tip, stages, clamp = true }: { tip: GuideTip; stages?: GuideStage[]; clamp?: boolean }) {
  const [open, setOpen] = useState(false)
  const kind = tip.kind ? TIP_KIND[tip.kind] : null
  const Icon = kind?.icon ?? Lightbulb
  const long = tip.text.length > 360 || tip.text.split('\n').length > 6
  const stageNames = (tip.stages ?? []).map((id) => stages?.find((s) => s.id === id)?.name).filter(Boolean)
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-accent">
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        {/* Описание билда без своего заголовка — заголовок у карточки («О билде»). */}
        {(tip.title || tip.kind !== 'build') && (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[13px] font-semibold text-ink">{tip.title || kind?.label || t('Совет')}</span>
            {tip.title && kind && <span className="text-[11px] text-ink-3">{kind.label}</span>}
            {stageNames.length > 0 && <span className="text-[11px] text-ink-3">{t('стадии: {list}', { list: stageNames.join(', ') })}</span>}
          </div>
        )}
        <p
          className={cn(
            (tip.title || tip.kind !== 'build') && 'mt-1',
            'text-[12.5px] leading-relaxed whitespace-pre-line text-ink-2',
            clamp && !open && long && 'line-clamp-6'
          )}
        >
          {tip.text}
        </p>
        {clamp && long && (
          <button onClick={() => setOpen(!open)} className="mt-1 text-[11.5px] text-accent hover:underline">
            {open ? t('Свернуть') : t('Показать полностью')}
          </button>
        )}
      </div>
    </div>
  )
}
