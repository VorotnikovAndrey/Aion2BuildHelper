import type { ReactNode } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { atLeast, oneIn, type ArcanaCardReport, type ArcanaSkillClass } from '@shared/analysis/arcana'
import { ARCANA_GRADES, ARCANA_SETS, ARCANA_SKILL_CAP, ARCANA_TYPES } from '@shared/gamedata/arcana'
import { statByKey } from '@shared/gamedata/stats'
import { ArcanaCardArt, ArcanaTypeIcon } from '@/components/art'
import { GuideSwitcher } from '@/components/GuideSwitcher'
import { SkillIcon } from '@/components/icons'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/InfoTip'
import { Legend, PageHeader } from '@/components/ui/misc'
import { Pill, toneOfShare } from '@/components/ui/Pill'
import { cn } from '@/lib/format'
import { useCharacterContext } from '@/lib/report'
import type { Tone } from '@/lib/status'
import { t } from '@shared/i18n'
import { term } from '@shared/names'

type Ctx = NonNullable<ReturnType<typeof useCharacterContext>>

const POOL_TIP: Record<string, string> = {
  all: t('Грааль: может выпасть любое из 22 умений класса — 12 активных и 10 пассивных.'),
  attack: t('Карта атакующих умений: пул из 6 активных умений класса.'),
  passive: t('Карта пассивных умений: пул из 5 пассивок класса.')
}

/** Цвет строки умения на карте по нужности в гайде. */
const CLS_TONE: Record<ArcanaSkillClass, Tone> = { wanted: 'ok', useful: 'warn', extra: 'bad', useless: 'bad' }
const CLS_TEXT: Record<ArcanaSkillClass, string> = {
  wanted: 'text-good',
  useful: 'text-warning',
  extra: 'text-critical',
  useless: 'text-critical line-through'
}
const CLS_WHY: Record<ArcanaSkillClass, string> = {
  wanted: t('Нужно на этой карте: входит в лучший набор по гайду.'),
  useful: t('Полезно по приоритетам гайда, но в лучший набор этой карты не входит.'),
  extra: t('Не по гайду: гайд его не ценит, заточки в него — потеря.'),
  useless: t('Бесполезно по гайду: заточки, попавшие в это умение, пропадут.')
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
        title={t('Арканы')}
        subtitle={t(
          'На карте 4 разных умения по ур. 1 (у уникальной). Каждая заточка до +5 даёт +1 случайному из четырёх поровну, потолок умения на карте — ур. 4. Под умением — шанс дойти до следующих уровней оставшимися заточками. Номер в углу карты — что искать первым. Наведите на любой элемент — там пояснение.'
        )}
        actions={<GuideSwitcher char={char} />}
      />

      {guide && (
        <div className="mb-5 flex flex-wrap gap-2">
          <PriorityChip
            title={t('Атака')}
            ids={guide.arcana.attack.slice(0, 6)}
            ctx={ctx}
            tip={t('Атакующие умения по важности в гайде: от них зависит, какой набор нужен на Пергаменте, Компасе и Граале.')}
          />
          <PriorityChip
            title={t('Пассивы')}
            ids={guide.arcana.passive.slice(0, 5)}
            ctx={ctx}
            tip={t('Пассивки по важности: для Колокола, Зеркала и Грааля.')}
          />
          {guide.arcana.useless.length > 0 && (
            <PriorityChip
              title={t('Бесполезны')}
              ids={guide.arcana.useless}
              ctx={ctx}
              danger
              tip={t('Эти умения на арканах только мешают: заточки в них пропадают.')}
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <ArcanaColumn key={c.slot} card={c} rank={rank(c)} ctx={ctx} />
        ))}
      </div>

      <Legend
        items={[
          { swatch: <SkillBadge cls="wanted">{t('зелёное')}</SkillBadge>, text: t('нужно на этой карте') },
          { swatch: <SkillBadge cls="useful">{t('жёлтое')}</SkillBadge>, text: t('полезно, но не в лучшем наборе') },
          { swatch: <SkillBadge cls="extra">{t('красное')}</SkillBadge>, text: t('не по гайду') },
          { swatch: <SkillBadge cls="useless">{t('зачёркнутое')}</SkillBadge>, text: t('бесполезное') }
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title={t('Сеты')} hint={t('Все карты «магии» собираются в один сет, все карты «жизни» — в другой. Бонус — за 2 и 4 карты.')}>
          <div className="space-y-3">
            {report.arcana.sets.map((s) => (
              <Tooltip
                key={s.variant}
                block
                wide
                content={t('{s}: надето {count} из 4 карт. {p}', {
                  s: s.name,
                  count: s.count,
                  p:
                    s.active === 4
                      ? t('Работают оба бонуса.')
                      : s.active === 2
                        ? t('Работает бонус за 2 карты.')
                        : t('Бонус пока не работает — нужно хотя бы 2 карты.')
                })}
              >
                <div className={cn('w-full rounded-xl border p-3', s.active ? 'border-accent/40 bg-accent-soft' : 'border-line bg-surface-2')}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold">{s.name}</span>
                    <Pill tone={s.active === 4 ? 'good' : s.active ? 'warning' : 'neutral'}>{s.count} / 4</Pill>
                  </div>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className={s.count >= 2 ? 'text-good' : 'text-ink-3'}>{t('2 карты: {bonus2}', { bonus2: s.bonus2 })}</div>
                    <div className={s.count >= 4 ? 'text-good' : 'text-ink-3'}>{t('4 карты: {bonus4}', { bonus4: s.bonus4 })}</div>
                  </div>
                </div>
              </Tooltip>
            ))}
            {guide?.arcana.preferredSet && (
              <p className="text-xs text-ink-3">
                {t('Гайд советует собирать:')} {guide.arcana.preferredSet === 'magic' ? t('магию') : t('жизнь')}.
              </p>
            )}
          </div>
        </Card>
        <Card title={t('Что арканы дают умениям')} hint={t('Сумма уровней со всех карт. Вместе с досками это то, что поднимает главные умения выше ур. 16.')}>
          <div className="-mx-2">
            {[...report.arcana.levels.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([skill, lvl]) => {
                const role = report.skills.find((s) => s.skill === skill)?.role
                const core = role === 'core'
                const inGuide = !!guide && [...guide.arcana.attack, ...guide.arcana.passive].includes(skill) && !guide.arcana.useless.includes(skill)
                return (
                  <Tooltip
                    key={skill}
                    block
                    content={t('{skill}: +{lvl} к уровню от всех карт. {p}', {
                      skill: namer.skill(skill).main,
                      lvl,
                      p: core ? t('Главное умение гайда.') : inGuide ? t('Есть в гайде.') : t('Гайд на него не рассчитывает.')
                    })}
                  >
                    <div className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] hover:bg-surface-2">
                      <SkillIcon id={skill} size={22} tone={core ? 'ok' : inGuide ? undefined : 'bad'} />
                      <span className={cn('flex-1', core ? 'text-ink' : inGuide ? 'text-ink-2' : 'text-critical')}>
                        {namer.skill(skill).main}
                        {core && <span className="ml-1.5 text-[11px] text-accent">{t('главное')}</span>}
                      </span>
                      <span className="tnum text-ink-2">+{lvl}</span>
                    </div>
                  </Tooltip>
                )
              })}
          </div>
          {guide?.arcana.notes && <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-ink-3">{guide.arcana.notes}</p>}
        </Card>
      </div>
    </>
  )
}

function PriorityChip({ title, ids, ctx, danger, tip }: { title: string; ids: number[]; ctx: Ctx; danger?: boolean; tip: string }) {
  return (
    <Tooltip content={tip} wide>
      <div
        className={cn(
          'flex flex-wrap items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs',
          danger ? 'border-critical/30 bg-critical-soft' : 'border-accent/30 bg-accent-soft'
        )}
      >
        <b className={danger ? 'text-critical' : 'text-accent-2'}>{title}:</b>
        {ids.map((id, i) => (
          <span key={id} className="flex items-center gap-1 text-ink-2">
            {i > 0 && !danger && <span className="text-ink-3">→</span>}
            <SkillIcon id={id} size={16} />
            {ctx.namer.skill(id).main}
          </span>
        ))}
      </div>
    </Tooltip>
  )
}

function SkillBadge({ cls, children }: { cls: ArcanaSkillClass; children: ReactNode }) {
  const bg: Record<ArcanaSkillClass, string> = {
    wanted: 'bg-good-soft border-good/30',
    useful: 'bg-warning-soft border-warning/30',
    extra: 'bg-critical-soft border-critical/30',
    useless: 'bg-critical-soft border-critical/30'
  }
  return <span className={cn('rounded-md border px-2 py-0.5 text-xs', bg[cls], CLS_TEXT[cls])}>{children}</span>
}

function ArcanaColumn({ card, rank, ctx }: { card: ArcanaCardReport; rank: number; ctx: Ctx }) {
  const { namer } = ctx
  const type = ARCANA_TYPES.find((t) => t.type === card.type)!
  const wanted = card.skills.filter((s) => s.cls === 'wanted').length
  const grade = card.info ? ARCANA_GRADES[card.info.grade] : null
  const mainStat = card.info ? statByKey(card.info.mainStatKey) : undefined
  const p = 1 / card.slots
  const enchantDone = card.item && card.remaining === 0

  const cardTip = card.info ? (
    <>
      <b className="text-ink">{term(card.info)}</b> · {grade?.ru}
      <span className="mt-1 block">{POOL_TIP[type.pool]}</span>
      {mainStat && grade && (
        <span className="mt-1 block">
          {t('Главный эффект: {stat} +', { stat: namer.stat(mainStat.id).main })}
          {grade.mainStat + card.enchant} {t('(база +{mainStat} и +1 за каждую заточку).', { mainStat: grade.mainStat })}
        </span>
      )}
      <span className="mt-1 block">
        {t('Сет «{ARCANA_SETS}»: 2 карты — {bonus2}; 4 — {bonus4}.', {
          ARCANA_SETS: term(ARCANA_SETS[card.info.variant]),
          bonus2: ARCANA_SETS[card.info.variant].bonus2,
          bonus4: ARCANA_SETS[card.info.variant].bonus4
        })}
      </span>
    </>
  ) : (
    t('{type}: слот пуст. Любая карта лучше пустого слота.', { type: term(type) })
  )

  return (
    <div className="flex min-w-0 flex-col">
      {/* Карта — родной арт игры */}
      <div className="relative mx-auto mb-2 w-full max-w-[168px]">
        <Tooltip content={cardTip} wide block>
          <ArcanaCardArt
            type={card.type}
            variant={card.info?.variant}
            empty={!card.item}
            className={cn(
              'transition-transform duration-200 hover:-translate-y-1',
              card.item && (card.info?.variant === 'magic' ? 'card-glow-magic' : 'card-glow-vigor')
            )}
          />
        </Tooltip>
        {card.item && (
          <Tooltip
            content={
              enchantDone
                ? t('Заточена до максимума (+{maxEnchant}).', { maxEnchant: card.maxEnchant })
                : t('Заточка +{enchant} из +{maxEnchant}: осталось {remaining}. Каждая даёт +1 случайному из {slots} умений карты.', {
                    enchant: card.enchant,
                    maxEnchant: card.maxEnchant,
                    remaining: card.remaining,
                    slots: card.slots
                  })
            }
            className="absolute bottom-[4%] left-1/2 -translate-x-1/2"
          >
            <span
              className={cn(
                'game-enchant tnum flex h-11 w-11 flex-col items-center justify-center leading-none',
                enchantDone ? 'shadow-[0_0_0_2px_var(--color-good)]' : null
              )}
            >
              <span className="game-num text-[15px]">+{card.enchant}</span>
              <span className="mt-0.5 text-[9px] font-semibold text-ink-3">{t('из {maxEnchant}', { maxEnchant: card.maxEnchant })}</span>
            </span>
          </Tooltip>
        )}
        <Tooltip
          content={
            card.done
              ? t('Карта собрана: нужный набор и полная заточка.')
              : t('Что искать первым: {rank}-я по очереди (чем меньше номер, тем сильнее карта отстаёт от гайда).', { rank })
          }
          className="absolute -top-2 -right-2"
        >
          <span
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold shadow-md',
              card.done ? 'border-good bg-good text-bg' : 'border-accent bg-surface text-accent'
            )}
          >
            {card.done ? <Check size={14} /> : rank}
          </span>
        </Tooltip>
      </div>

      {/* Разбор */}
      <div className="mt-2 flex-1 rounded-2xl border border-line bg-surface p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[15px] leading-tight font-semibold text-accent-2">
              <ArcanaTypeIcon type={card.type} size={16} className="opacity-80" />
              {card.info ? term(card.info) : term(type)}
            </div>
            <div className="text-[11px] text-ink-3">
              {grade ? grade.ru : t('слот пуст')}
              {mainStat && card.info && grade ? ` · ${namer.stat(mainStat.id).main} +${grade.mainStat + card.enchant}` : ''}
            </div>
          </div>
          {card.item && (
            <Pill
              tone={toneOfShare(wanted, card.desired.length)}
              tip={t('Нужных по гайду умений на карте: {wanted} из {desiredCount}. Лучший набор: {map}.', {
                wanted,
                desiredCount: card.desired.length,
                map: card.desired.map((id) => namer.skill(id).main).join(', ')
              })}
            >
              {t('{wanted} из {desiredCount}', { wanted, desiredCount: card.desired.length })}
            </Pill>
          )}
        </div>

        {card.item && card.main && (
          <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
            {t('Главное:')} <span className="text-ink-2">{namer.skill(card.main).main}</span>{' '}
            {t('— сейчас ур. {mainLevel} из {ARCANA_SKILL_CAP}. Заточек осталось: {remaining}.', {
              mainLevel: card.mainLevel,
              ARCANA_SKILL_CAP,
              remaining: card.remaining
            })}
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
              <Tooltip
                key={s.skill}
                block
                wide
                content={
                  <>
                    <b className="text-ink">{namer.skill(s.skill).main}</b>{' '}
                    {t('· ур. {level} из {ARCANA_SKILL_CAP} на карте', { level: s.level, ARCANA_SKILL_CAP })}
                    <span className={cn('mt-1 block', CLS_TEXT[s.cls].replace('line-through', ''))}>{CLS_WHY[s.cls]}</span>
                    {chances.length > 0 && (
                      <span className="mt-1 block text-ink-3">
                        {t('Шанс дойти до уровня оставшимися заточками ({remaining}; каждая попадает в это умение с шансом 1 из {slots}):', {
                          remaining: card.remaining,
                          slots: card.slots
                        })}
                        {chances.map((c) => t('до {lvl} — {oneIn}', { lvl: c.lvl, oneIn: oneIn(c.p) })).join(', ')}.
                      </span>
                    )}
                  </>
                }
              >
                <div className="w-full">
                  <div className="flex items-start justify-between gap-2 text-[13px]">
                    <span className="flex min-w-0 items-start gap-1.5">
                      <SkillIcon id={s.skill} size={20} tone={CLS_TONE[s.cls]} />
                      <span className={cn('min-w-0 leading-snug', CLS_TEXT[s.cls])}>{namer.skill(s.skill).main}</span>
                    </span>
                    <span className="tnum shrink-0 text-xs text-ink-3">
                      {t('ур. {level}', { level: s.level })}
                      {s.cls === 'wanted' ? ` / ${ARCANA_SKILL_CAP}` : ''}
                    </span>
                  </div>
                  {chances.length > 0 && (
                    <div className="tnum mt-0.5 pl-[26px] text-[10.5px] text-ink-3">
                      {chances.map((c) => t('до {lvl}: {oneIn}', { lvl: c.lvl, oneIn: oneIn(c.p) })).join(' · ')}
                    </div>
                  )}
                </div>
              </Tooltip>
            )
          })}
        </div>

        {card.missing.length > 0 && (
          <div className="mt-3">
            <Tooltip content={t('Умения из лучшего набора для этой карты, которых на ней нет.')}>
              <div className="mb-1.5 text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase">{t('Ещё нужно')}</div>
            </Tooltip>
            <div className="flex flex-wrap gap-1">
              {card.missing.map((id) => (
                <Tooltip
                  key={id}
                  content={t('{skill}: входит в лучший набор этой карты по гайду, но на вашей карте его нет.', { skill: namer.skill(id).main })}
                >
                  <span className="flex items-center gap-1 rounded-md border border-aether/35 bg-aether-soft px-1.5 py-0.5 text-[11px] text-aether">
                    <SkillIcon id={id} size={14} />
                    {namer.skill(id).main}
                  </span>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {card.missing.length > 0 && card.desired.length > 0 && (
          <Tooltip
            wide
            content={t(
              'Новая карта берёт {slots} разных умения из {poolCount} возможных для этого типа. Шанс именно нужного набора — 1 / C({poolCount}, {slots}). Второе и третье число — шанс, что вдобавок главное умение дойдёт до ур. 3 или 4 после всех {maxEnchant} заточек.',
              { slots: card.slots, poolCount: card.pool.length, maxEnchant: card.maxEnchant }
            )}
          >
            <p className="mt-3 text-[11px] leading-relaxed text-ink-3">
              {t('Новая карта: нужный набор —')} <b className="text-ink-2">{oneIn(card.newCard.pSet)}</b>
              {t('; и после {maxEnchant} заточек главное до ур. 3 —', { maxEnchant: card.maxEnchant })}
              <b className="text-ink-2">{oneIn(card.newCard.pSetMain[0].p)}</b>
              {t(', до ур. 4 —')} <b className="text-ink-2">{oneIn(card.newCard.pSetMain[1].p)}</b>
            </p>
          </Tooltip>
        )}

        {card.item && card.missing.length === 0 && card.remaining === 0 && (
          <p className="mt-3 text-[11px] text-good">{t('Собрано — все нужные умения стоят.')}</p>
        )}
        {card.item && card.missing.length === 0 && card.remaining > 0 && (
          <p className="mt-3 text-[11px] text-good">{t('Набор идеальный — осталось заточить (+{remaining}).', { remaining: card.remaining })}</p>
        )}
        {card.skills.some((s) => s.cls === 'useless' || s.cls === 'extra') && (
          <p className="mt-2 text-[11px] text-warning">{t('На карте есть умение не по гайду — заточки, попавшие в него, пропадут.')}</p>
        )}
      </div>
    </div>
  )
}
