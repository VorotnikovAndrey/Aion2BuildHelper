import { Bell, Check, Compass, ScrollText, Sparkles, Wine, type LucideIcon } from 'lucide-react'
import { atLeast, oneIn, type ArcanaCardReport } from '@shared/analysis/arcana'
import { ARCANA_GRADES, ARCANA_SKILL_CAP, ARCANA_TYPES, type ArcanaType } from '@shared/gamedata/arcana'
import { statByKey } from '@shared/gamedata/stats'
import { GuideSwitcher } from '@/components/GuideSwitcher'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/InfoTip'
import { Legend, PageHeader } from '@/components/ui/misc'
import { Pill, toneOfShare } from '@/components/ui/Pill'
import { cn } from '@/lib/format'
import { useCharacterContext } from '@/lib/report'

type Ctx = NonNullable<ReturnType<typeof useCharacterContext>>

const TYPE_ICON: Record<ArcanaType, LucideIcon> = {
  chalice: Wine,
  parchment: ScrollText,
  compass: Compass,
  bell: Bell,
  mirror: Sparkles
}

export function ArcanaPage() {
  const ctx = useCharacterContext()!
  const { char, report, guide, namer } = ctx
  const cards = report.arcana.cards
  // Что искать первым: незакрытые карты с самой низкой оценкой.
  const order = [...cards].filter((c) => !c.done).sort((a, b) => a.score - b.score)
  const rank = (c: ArcanaCardReport) => order.indexOf(c) + 1

  return (
    <>
      <PageHeader
        icon={<Sparkles size={22} />}
        title="Арканы"
        subtitle="На карте 4 разных умения по ур. 1 (у уникальной). Каждая заточка до +5 даёт +1 случайному из четырёх поровну, потолок умения на карте — ур. 4. Под умением — шанс дойти до следующих уровней оставшимися заточками. Номер в углу карты — что искать первым."
        actions={<GuideSwitcher char={char} />}
      />

      {guide && (
        <div className="mb-5 flex flex-wrap gap-2">
          <PriorityChip title="Атака" ids={guide.arcana.attack.slice(0, 6)} ctx={ctx} />
          <PriorityChip title="Пассивы" ids={guide.arcana.passive.slice(0, 5)} ctx={ctx} />
          {guide.arcana.useless.length > 0 && <PriorityChip title="Бесполезны" ids={guide.arcana.useless} ctx={ctx} danger />}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <ArcanaColumn key={c.slot} card={c} rank={rank(c)} ctx={ctx} />
        ))}
      </div>

      <Legend
        items={[
          { swatch: <SkillBadge cls="wanted">зелёное</SkillBadge>, text: 'нужно на этой карте' },
          { swatch: <SkillBadge cls="useful">жёлтое</SkillBadge>, text: 'полезно по приоритетам гайда' },
          { swatch: <SkillBadge cls="extra">серое</SkillBadge>, text: 'лишнее' },
          { swatch: <SkillBadge cls="useless">зачёркнутое</SkillBadge>, text: 'бесполезное' }
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="Сеты" hint="Все карты «магии» собираются в один сет, все карты «жизни» — в другой. Бонус — за 2 и 4 карты.">
          <div className="space-y-3">
            {report.arcana.sets.map((s) => (
              <div key={s.variant} className={cn('rounded-xl border p-3', s.active ? 'border-accent/40 bg-accent-soft' : 'border-line bg-surface-2')}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold">{s.name}</span>
                  <Pill tone={s.active === 4 ? 'good' : s.active ? 'accent' : 'neutral'}>{s.count} / 4</Pill>
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  <div className={s.count >= 2 ? 'text-ink-2' : 'text-ink-3'}>2 карты: {s.bonus2}</div>
                  <div className={s.count >= 4 ? 'text-ink-2' : 'text-ink-3'}>4 карты: {s.bonus4}</div>
                </div>
              </div>
            ))}
            {guide?.arcana.preferredSet && (
              <p className="text-xs text-ink-3">Гайд советует собирать: {guide.arcana.preferredSet === 'magic' ? 'магию' : 'жизнь'}.</p>
            )}
          </div>
        </Card>
        <Card title="Что арканы дают умениям" hint="Сумма уровней со всех карт. Вместе с досками это то, что поднимает главные умения выше ур. 16.">
          <div className="-mx-2">
            {[...report.arcana.levels.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([skill, lvl]) => {
                const core = report.skills.find((s) => s.skill === skill)?.role === 'core'
                return (
                  <div key={skill} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[13px] hover:bg-surface-2">
                    <span className={core ? 'text-ink' : 'text-ink-2'}>
                      {namer.skill(skill).main}
                      {core && <span className="ml-1.5 text-[11px] text-accent">главное</span>}
                    </span>
                    <span className="tnum text-ink-2">+{lvl}</span>
                  </div>
                )
              })}
          </div>
          {guide?.arcana.notes && <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-ink-3">{guide.arcana.notes}</p>}
        </Card>
      </div>
    </>
  )
}

function PriorityChip({ title, ids, ctx, danger }: { title: string; ids: number[]; ctx: Ctx; danger?: boolean }) {
  return (
    <div className={cn('rounded-lg border px-3 py-1.5 text-xs', danger ? 'border-critical/30 bg-critical-soft' : 'border-accent/30 bg-accent-soft')}>
      <b className={danger ? 'text-critical' : 'text-accent-2'}>{title}:</b>{' '}
      <span className="text-ink-2">{ids.map((id) => ctx.namer.skill(id).main).join(danger ? ', ' : ' → ')}</span>
    </div>
  )
}

const SKILL_CLS: Record<string, string> = {
  wanted: 'text-good',
  useful: 'text-warning',
  extra: 'text-ink-3',
  useless: 'text-critical line-through'
}

function SkillBadge({ cls, children }: { cls: string; children: React.ReactNode }) {
  const bg: Record<string, string> = {
    wanted: 'bg-good-soft border-good/30',
    useful: 'bg-warning-soft border-warning/30',
    extra: 'bg-surface-2 border-line-strong',
    useless: 'bg-critical-soft border-critical/30'
  }
  return <span className={cn('rounded-md border px-2 py-0.5 text-xs', bg[cls], SKILL_CLS[cls])}>{children}</span>
}

function ArcanaColumn({ card, rank, ctx }: { card: ArcanaCardReport; rank: number; ctx: Ctx }) {
  const { namer } = ctx
  const type = ARCANA_TYPES.find((t) => t.type === card.type)!
  const Icon = TYPE_ICON[card.type]
  const wanted = card.skills.filter((s) => s.cls === 'wanted').length
  const grade = card.info ? ARCANA_GRADES[card.info.grade] : null
  const mainStat = card.info ? statByKey(card.info.mainStatKey) : undefined
  const p = 1 / card.slots

  return (
    <div className="flex min-w-0 flex-col">
      {/* Карта */}
      <div className="relative mx-auto mb-3 aspect-[3/4] w-full max-w-[150px]">
        <div
          className={cn(
            'absolute inset-0 overflow-hidden rounded-2xl border-2 bg-gradient-to-b',
            card.item ? 'glow-accent border-accent/70' : 'border-dashed border-line-strong',
            card.info?.variant === 'magic' ? 'from-card-magic-1 via-card-magic-2 to-card-magic-3' : 'from-card-vigor-1 via-card-vigor-2 to-card-vigor-3'
          )}
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{ background: 'radial-gradient(circle at 50% 40%, var(--color-accent-soft), transparent 60%)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon size={64} strokeWidth={1.2} className={card.info?.variant === 'magic' ? 'text-aether' : 'text-accent-2'} />
          </div>
        </div>
        {card.item && (
          <span className="tnum absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-accent/70 bg-surface px-3 py-1 text-xs font-semibold">
            +{card.enchant}
            <span className="text-ink-3">/{card.maxEnchant}</span>
          </span>
        )}
        <span
          className={cn(
            'absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold',
            card.done ? 'border-good bg-good text-bg' : 'border-accent bg-surface text-accent'
          )}
          title={card.done ? 'Карта собрана' : 'Что искать первым'}
        >
          {card.done ? <Check size={14} /> : rank}
        </span>
      </div>

      {/* Разбор */}
      <div className="mt-2 flex-1 rounded-2xl border border-line bg-surface p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[15px] leading-tight font-semibold text-accent-2">{card.info?.ru ?? type.ru}</div>
            <div className="text-[11px] text-ink-3">
              {grade ? grade.ru : 'слот пуст'}
              {mainStat && card.info && grade ? ` · ${namer.stat(mainStat.id).main.replace(/ \[.*\]/, '')} +${grade.mainStat}` : ''}
            </div>
          </div>
          {card.item && (
            <Pill tone={toneOfShare(wanted, card.desired.length)}>
              {wanted} из {card.desired.length}
            </Pill>
          )}
        </div>

        {card.item && card.main && (
          <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
            Главное: <span className="text-ink-2">{namer.skill(card.main).main}</span> — сейчас ур. {card.mainLevel} из {ARCANA_SKILL_CAP}. Заточек осталось:{' '}
            {card.remaining}.
          </p>
        )}

        <div className="mt-3 space-y-2">
          {card.skills.map((s) => {
            const chances =
              s.cls === 'wanted' || s.cls === 'useful'
                ? Array.from({ length: ARCANA_SKILL_CAP - s.level }, (_, i) => s.level + i + 1)
                    .map((lvl) => ({ lvl, p: atLeast(card.remaining, p, lvl - s.level) }))
                    .filter((x) => x.p > 0)
                : []
            return (
              <div key={s.skill}>
                <div className="flex items-start justify-between gap-2 text-[13px]">
                  <span className={cn('min-w-0 leading-snug', SKILL_CLS[s.cls])}>
                    {s.cls === 'wanted' && '✓ '}
                    {namer.skill(s.skill).main}
                  </span>
                  <span className="tnum shrink-0 text-xs text-ink-3">
                    ур. {s.level}
                    {s.cls === 'wanted' ? ` / ${ARCANA_SKILL_CAP}` : ''}
                  </span>
                </div>
                {chances.length > 0 && (
                  <div className="tnum mt-0.5 text-[10.5px] text-ink-3">{chances.map((c) => `до ${c.lvl}: ${oneIn(c.p)}`).join(' · ')}</div>
                )}
              </div>
            )
          })}
        </div>

        {card.missing.length > 0 && (
          <div className="mt-3">
            <div className="mb-1.5 text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase">Ещё нужно</div>
            <div className="flex flex-wrap gap-1">
              {card.missing.map((id) => (
                <span key={id} className="rounded-md border border-aether/35 bg-aether-soft px-1.5 py-0.5 text-[11px] text-aether">
                  {namer.skill(id).main}
                </span>
              ))}
            </div>
          </div>
        )}

        {card.missing.length > 0 && card.desired.length > 0 && (
          <Tooltip
            wide
            content={`Новая карта берёт ${card.slots} разных умения из ${card.pool.length} возможных для этого типа. Шанс именно нужного набора — 1 / C(${card.pool.length}, ${card.slots}).`}
          >
            <p className="mt-3 text-[11px] leading-relaxed text-ink-3">
              Новая карта: нужный набор — <b className="text-ink-2">{oneIn(card.newCard.pSet)}</b>; и после {card.maxEnchant} заточек главное до ур. 3 —{' '}
              <b className="text-ink-2">{oneIn(card.newCard.pSetMain[0].p)}</b>, до ур. 4 — <b className="text-ink-2">{oneIn(card.newCard.pSetMain[1].p)}</b>
            </p>
          </Tooltip>
        )}

        {card.item && card.missing.length === 0 && card.remaining === 0 && <p className="mt-3 text-[11px] text-good">Собрано — все нужные умения стоят.</p>}
        {card.item && card.missing.length === 0 && card.remaining > 0 && (
          <p className="mt-3 text-[11px] text-good">Набор идеальный — осталось заточить (+{card.remaining}).</p>
        )}
        {card.skills.some((s) => s.cls === 'useless') && (
          <p className="mt-2 text-[11px] text-warning">На карте есть бесполезное умение — заточки, попавшие в него, пропадут.</p>
        )}
      </div>
    </div>
  )
}
