// Карточка билда — одна картинка, чтобы показать друзьям или легиону: персонаж, боевая мощь, оценка по гайду,
// главные умения, арканы и шмот. Снимок делает main-процесс (capturePage) — см. app.captureImage.

import { useRef, useState } from 'react'
import { Check, Copy, Download, ImageDown } from 'lucide-react'
import type { BuildReport } from '@shared/analysis/build'
import { classInfo, RACES } from '@shared/gamedata/classes'
import { ArcanaCardArt, ItemIcon } from '@/components/art'
import { ClassIcon } from '@/components/game'
import { SkillIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/misc'
import { ScoreRing } from '@/components/ui/Progress'
import { dateOnly, fmt } from '@/lib/format'
import { abyssRankName } from '@/lib/history'
import type { useCharacterContext } from '@/lib/report'
import { api, isWebMode, useApp } from '@/lib/store'
import { t } from '@shared/i18n'
import { term } from '@shared/names'

type Ctx = NonNullable<ReturnType<typeof useCharacterContext>>

const SECTIONS: { key: keyof Omit<BuildReport['scores'], 'overall'>; ru: string }[] = [
  { key: 'skills', ru: t('Умения') },
  { key: 'daevanion', ru: t('Даэванион') },
  { key: 'gear', ru: t('Шмот') },
  { key: 'arcana', ru: t('Арканы') },
  { key: 'genus', ru: t('Знание о видах') }
]

const barColor = (v: number) => (v >= 85 ? 'bg-good' : v >= 60 ? 'bg-warning' : 'bg-critical')

export function BuildCard({ ctx }: { ctx: Ctx }) {
  const { char, guide, report, namer } = ctx
  const info = classInfo(char.cls)
  const core = report.skills.filter((s) => s.role === 'core' && s.learned).slice(0, 6)
  const gear = report.gear.filter((g) => g.group !== 'accessory')
  const jewelry = report.gear.filter((g) => g.group === 'accessory')
  return (
    <div className="no-fx relative w-[760px] overflow-hidden rounded-2xl border border-line-strong bg-surface p-6">
      <div className="pointer-events-none absolute -top-28 -right-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-aether/10 blur-3xl" />

      <div className="relative flex items-center gap-4">
        <span className="glow-accent flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-3 text-accent">
          <ClassIcon cls={char.cls} size={46} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[28px] leading-tight font-semibold tracking-tight">{char.name}</div>
          <div className="mt-0.5 text-[13px] text-ink-2">
            {term(info, t('Класс неизвестен'))} {t('· ур. {level}', { level: char.level })}
            {char.legion ? ` · ${char.legion}` : ''}
            {char.race && RACES[char.race] ? ` · ${term(RACES[char.race])}` : ''}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] tracking-wider text-ink-3 uppercase">{t('Боевая мощь')}</div>
          <div className="tnum text-[26px] leading-tight font-semibold text-accent">{fmt(char.combatPower)}</div>
          <div className="tnum text-xs text-ink-3">
            {t('снаряжение {gearScore}', { gearScore: fmt(char.gearScore) })}
            {char.abyss ? ` · ${abyssRankName(char.abyss.grade)}` : ''}
          </div>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-6 rounded-xl border border-line bg-surface-2/60 p-4">
        <ScoreRing value={report.scores.overall} size={92} label={t('по гайду')} />
        <div className="space-y-1.5">
          {SECTIONS.map((s) => (
            <div key={s.key} className="flex items-center gap-3 text-xs">
              <span className="w-28 shrink-0 text-ink-2">{s.ru}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                <span className={`block h-full rounded-full ${barColor(report.scores[s.key])}`} style={{ width: `${report.scores[s.key]}%` }} />
              </span>
              <span className="tnum w-7 text-right font-semibold">{report.scores[s.key]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-6">
        <div>
          <div className="mb-2 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">{t('Главные умения')}</div>
          <div className="flex flex-wrap gap-3">
            {core.map((s) => (
              <div key={s.skill} className="flex w-[78px] flex-col items-center gap-1 text-center">
                <SkillIcon id={s.skill} size={40} />
                <span className="line-clamp-2 min-h-[2.5em] text-[10.5px] leading-tight text-ink-2">{namer.skill(s.skill).main}</span>
                <span className="tnum text-[11px] font-semibold">
                  {t('ур. {level}', { level: s.level })}
                  {s.targetLevel ? <span className="font-normal text-ink-3">/{s.targetLevel}</span> : null}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">{t('Арканы')}</div>
          <div className="flex gap-1.5">
            {report.arcana.cards.map((c) => (
              <div key={c.slot} className="w-[46px]" style={{ fontSize: 10 }}>
                <ArcanaCardArt type={c.type} variant={c.info?.variant} enchant={c.item ? c.enchant : undefined} empty={!c.item} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="mb-2 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">{t('Снаряжение')}</div>
        <div className="flex flex-wrap gap-1.5">
          {gear.map((g) => (
            <ItemIcon key={g.slot} itemId={g.item.item} slot={g.slot} enchant={g.item.enchant} size={44} />
          ))}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {jewelry.map((g) => (
            <ItemIcon key={g.slot} itemId={g.item.item} slot={g.slot} enchant={g.item.enchant} size={36} />
          ))}
        </div>
      </div>

      <div className="relative mt-5 flex items-center justify-between border-t border-line pt-3 text-[11px] text-ink-3">
        <span>Aion2 Build Helper{guide ? t(' · гайд: {guide}', { guide: guide.name }) : ''}</span>
        <span>{dateOnly(Date.now())}</span>
      </div>
    </div>
  )
}

/** Кнопка «Карточка билда» → окно с карточкой и кнопками «Скопировать» / «Сохранить PNG». */
export function BuildCardButton({ ctx }: { ctx: Ctx }) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState<'copy' | 'save' | null>(null)
  const zoom = useApp((s) => s.settings.ui.zoom)
  const card = useRef<HTMLDivElement>(null)

  const capture = async (action: 'copy' | 'save') => {
    const el = card.current?.firstElementChild as HTMLElement | null
    if (!el) return
    const r = el.getBoundingClientRect()
    // В приложении масштаб — zoomFactor окна: экранные точки = CSS-пиксели × масштаб.
    const ok = await api.app.captureImage({ x: r.left, y: r.top, width: r.width, height: r.height, zoom }, action, t('{char} — билд', { char: ctx.char.name }))
    if (ok) {
      setDone(action)
      setTimeout(() => setDone(null), 2000)
    }
  }

  return (
    <>
      <Button icon={<ImageDown size={14} />} onClick={() => setOpen(true)}>
        {t('Карточка билда')}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={t('Карточка билда')} wide>
        <div className="overflow-x-auto">
          <div ref={card} className="mx-auto w-fit">
            <BuildCard ctx={ctx} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          {isWebMode ? (
            <span className="text-xs text-ink-3">{t('В браузерном режиме сохранить картинку нельзя — сделайте снимок экрана (Win+Shift+S).')}</span>
          ) : (
            <>
              <Button icon={done === 'copy' ? <Check size={14} /> : <Copy size={14} />} onClick={() => void capture('copy')}>
                {done === 'copy' ? t('Скопировано') : t('Скопировать')}
              </Button>
              <Button variant="primary" icon={done === 'save' ? <Check size={14} /> : <Download size={14} />} onClick={() => void capture('save')}>
                {done === 'save' ? t('Сохранено') : t('Сохранить PNG')}
              </Button>
            </>
          )}
        </div>
      </Modal>
    </>
  )
}
