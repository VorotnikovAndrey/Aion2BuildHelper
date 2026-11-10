import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, Trophy } from 'lucide-react'
import { compareWithTop } from '@shared/analysis/top'
import { ARCANA_TYPES } from '@shared/gamedata/arcana'
import { slotDef } from '@shared/gamedata/slots'
import { topData } from '@shared/gamedata/top'
import { ArcanaCardArt } from '@/components/art'
import { SkillIcon } from '@/components/icons'
import { StatusBadge } from '@/components/StatusBadge'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/InfoTip'
import { EmptyState, PageHeader } from '@/components/ui/misc'
import { Pill } from '@/components/ui/Pill'
import { cn, compact, fmt } from '@/lib/format'
import { useCharacterContext } from '@/lib/report'
import { intlLocale, t } from '@shared/i18n'
import { term } from '@shared/names'

const VARIANT_RU = { vigor: t('жизни'), magic: t('магии') } as const

export function TopPage() {
  const ctx = useCharacterContext()!
  const { char, report, namer } = ctx
  const navigate = useNavigate()
  const top = topData(char.cls)
  const cmp = useMemo(() => (top ? compareWithTop(char, report, top) : null), [char, report, top])

  const header = (
    <PageHeader
      icon={<Trophy size={22} />}
      title={t('Сравнение с топом')}
      subtitle={
        top
          ? t(
              'Ваш персонаж против {players} топ-игроков класса на глобальных серверах (ур. 45, самая высокая боевая мощь в каждом регионе; metabot.gg, данные от {fetchedAt}). Это не гайд, а ориентир: что носят сильнейшие и где вы отстаёте больше всего.',
              { players: fmt(top.players), fetchedAt: top.fetchedAt }
            )
          : undefined
      }
    />
  )
  if (!top || !cmp) {
    return (
      <>
        {header}
        <EmptyState title={t('Нет данных о топ-игроках этого класса')}>
          {t('Данные собираются командой')} <code>npm run gamedata -- --classes {char.cls ?? t('класс')}</code> {t('с публичной страницы metabot.gg.')}
        </EmptyState>
      </>
    )
  }

  const maxBucket = Math.max(...top.cpBuckets.map((b) => b.count))
  const lastFilled = top.cpBuckets.reduce((i, b, j) => (b.count > 0 ? j : i), 0)
  const buckets = top.cpBuckets.slice(0, lastFilled + 1)
  const mineAt = buckets.findIndex((b) => cmp.cp.value >= b.from && cmp.cp.value <= b.to)

  return (
    <>
      {header}
      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Card title={t('Боевая мощь')} hint={t('Сколько топ-игроков класса в каждом диапазоне боевой мощи. Подсвечен ваш диапазон.')}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="tnum text-3xl font-semibold text-accent">{fmt(cmp.cp.value)}</div>
              <div className="mt-1 text-[13px] text-ink-2">
                {t('сильнее')} <b className="tnum text-ink">{cmp.cp.percentile}%</b> {t('топ-игроков класса')}
              </div>
            </div>
            <div className="tnum text-right text-xs text-ink-3">
              {t('медиана топа —')} <b className="text-ink-2">{compact(cmp.cp.median)}</b>
              <br />
              {t('верхние 10% — от')} <b className="text-ink-2">{compact(cmp.cp.top10)}</b>
            </div>
          </div>
          <div className="mt-4 flex h-24 items-end gap-1">
            {buckets.map((b, i) => (
              <Tooltip
                key={b.from}
                className="h-full flex-1 items-end"
                content={t('{from}–{p}: {count} игроков{p2}', {
                  from: compact(b.from),
                  p: compact(b.to + 1),
                  count: fmt(b.count),
                  p2: i === mineAt ? t(' · вы здесь') : ''
                })}
              >
                <span
                  className={cn('block w-full rounded-t-sm', i === mineAt ? 'bg-accent' : 'bg-surface-3')}
                  style={{ height: `${Math.max(3, (b.count / maxBucket) * 100)}%` }}
                />
              </Tooltip>
            ))}
          </div>
          <div className="tnum mt-1 flex justify-between text-[10.5px] text-ink-3">
            <span>{compact(buckets[0]?.from ?? 0)}</span>
            <span>{compact((buckets[buckets.length - 1]?.to ?? 0) + 1)}</span>
          </div>
        </Card>

        <Card
          title={t('Где отставание больше всего')}
          hint={t(
            'Самые большие разрывы с топом: умения, которые у топа на 80%+ и заметно выше, ненадетые популярные стигмы, заточка и узлы досок. Нажмите, чтобы открыть раздел.'
          )}
        >
          {cmp.gaps.length === 0 ? (
            <div className="flex items-center gap-2 text-[13px] text-good">
              <StatusBadge tone="ok" size={16} /> {t('По всем пунктам вы на уровне топа.')}
            </div>
          ) : (
            <ul className="-mx-2 space-y-0.5">
              {cmp.gaps.slice(0, 7).map((g) => (
                <li key={g.id}>
                  <button
                    onClick={() => navigate(g.link)}
                    className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-surface-2"
                  >
                    {g.skill ? <SkillIcon id={g.skill} size={24} /> : <StatusBadge tone="bad" size={18} />}
                    <span className="min-w-0 flex-1 text-[13px] text-ink-2">
                      {g.skill && <b className="font-medium text-ink">{namer.skill(g.skill).main}: </b>}
                      {g.text}
                    </span>
                    <ArrowRight size={14} className="shrink-0 text-ink-3 group-hover:text-accent" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card
          title={t('Умения')}
          hint={t(
            'У скольких топ-игроков умение на панели (или пассивка изучена) и средний уровень. Зелёное — вы не ниже среднего, жёлтое — ниже на 1–2, красное — ниже больше чем на 2 или не изучено.'
          )}
        >
          <ul className="space-y-1">
            {cmp.skills.map((s) => (
              <li key={s.skill} className="flex items-center gap-2.5 rounded-lg px-1 py-1 hover:bg-surface-2">
                <SkillIcon id={s.skill} size={26} dim={!s.learned} />
                <span className="min-w-0 flex-1 truncate text-[13px]">{namer.skill(s.skill).main}</span>
                <span className="tnum w-14 text-right text-xs text-ink-3">{s.share}%</span>
                <span className="tnum w-24 text-right text-[13px]">
                  <b>{s.learned ? s.level : '—'}</b>
                  <span className="text-ink-3"> / {s.avgLevel.toLocaleString(intlLocale())}</span>
                </span>
                <Tooltip
                  content={
                    s.learned
                      ? t('Ваш ур. {level}, у топа в среднем {avgLevel} ({p}{diff}).', {
                          level: s.level,
                          avgLevel: s.avgLevel.toLocaleString(intlLocale()),
                          p: s.diff > 0 ? '+' : '',
                          diff: s.diff.toLocaleString(intlLocale())
                        })
                      : t('Умение не изучено.')
                  }
                >
                  <StatusBadge tone={s.tone} size={16} />
                </Tooltip>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-ink-3">{t('Столбцы: доля топ-игроков · ваш уровень / средний у топа.')}</p>
        </Card>

        <div className="space-y-5">
          <Card title={t('Стигмы')} hint={t('Доля топ-игроков, у которых стигма надета, и её средний уровень. Слотов стигм — 4, так что сумма больше 100%.')}>
            <ul className="space-y-1.5">
              {cmp.stigmas.map((s) => (
                <li key={s.skill} className="flex items-center gap-2.5">
                  <SkillIcon id={s.skill} size={24} dim={!s.equipped} />
                  <span className="w-44 shrink-0 truncate text-[13px]">{namer.skill(s.skill).main}</span>
                  <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                    <span className="absolute inset-y-0 left-0 rounded-full bg-aether/70" style={{ width: `${s.share}%` }} />
                  </span>
                  <span className="tnum w-10 text-right text-xs text-ink-3">{s.share}%</span>
                  {s.equipped ? (
                    <Pill
                      tone="good"
                      tip={t('У вас надета, ур. {level}. У топа в среднем {avgLevel}.', { level: s.level, avgLevel: s.avgLevel.toLocaleString(intlLocale()) })}
                    >
                      {t('надета')}
                    </Pill>
                  ) : (
                    <Pill tip={t('У вас не надета.')}>—</Pill>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          <Card title={t('Арканы')} hint={t('Самая частая карта у топа в каждом слоте и её средняя заточка — против вашей.')}>
            <div className="grid grid-cols-5 gap-2">
              {cmp.arcana.map((a) => {
                const card = report.arcana.cards.find((c) => c.slot === a.slot)
                return (
                  <Tooltip
                    key={a.slot}
                    content={t('{slotDef}: у топа чаще всего «{p}» ({p2}%, ср. +{p3}). У вас — {p4}.', {
                      slotDef: term(slotDef(a.slot)),
                      p: a.top?.variant ? VARIANT_RU[a.top.variant] : '—',
                      p2: a.top?.share ?? 0,
                      p3: a.top?.avgEnchant ?? 0,
                      p4: a.yourVariant ? `«${VARIANT_RU[a.yourVariant]}» +${a.yourEnchant ?? 0}` : t('пусто')
                    })}
                  >
                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <div className="w-[52px]" style={{ fontSize: 10 }}>
                        <ArcanaCardArt
                          type={card?.type ?? ARCANA_TYPES.find((t) => t.slot === a.slot)?.type ?? 'chalice'}
                          variant={card?.info?.variant}
                          enchant={card?.item ? card.enchant : undefined}
                          empty={!card?.item}
                        />
                      </div>
                      <span className="text-[11px] text-ink-2">{term(slotDef(a.slot))}</span>
                      <span className="flex items-center gap-1 text-[10.5px] text-ink-3">
                        <StatusBadge tone={a.same ? 'ok' : 'warn'} size={12} />
                        {t('топ:')} {a.top?.variant ? VARIANT_RU[a.top.variant] : '—'} {a.top?.share}%
                      </span>
                    </div>
                  </Tooltip>
                )
              })}
            </div>
          </Card>
        </div>

        <Card title={t('Заточка по слотам')} hint={t('Средняя заточка у топа и самая частая. У колец, серёг, браслетов и рун — среднее по двум вашим вещам.')}>
          <ul className="space-y-1">
            {cmp.enchant.map((e) => (
              <li key={e.ru} className="flex items-center gap-2.5 rounded-lg px-1 py-1 text-[13px] hover:bg-surface-2">
                <span className="w-28 shrink-0 text-ink-2">{e.ru}</span>
                <span className="tnum w-16 font-semibold">{e.yours === null ? '—' : `+${e.yours.toLocaleString(intlLocale())}`}</span>
                <span className="tnum flex-1 text-xs text-ink-3">
                  {t('топ: ср. +')}
                  {e.avg.toLocaleString(intlLocale())}
                  {t(', чаще всего +{most} ({mostShare}%)', { most: e.most, mostShare: e.mostShare })}
                </span>
                <StatusBadge tone={e.tone} size={15} />
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-5">
          <Card title={t('Доски Даэваниона')} hint={t('Сколько узлов на доске берёт большинство топ-игроков, против ваших.')}>
            <ul className="space-y-2">
              {cmp.boards.map((b) => (
                <li key={b.name} className="text-[13px]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-ink-2">{b.name}</span>
                    <span className="tnum text-xs text-ink-3">
                      {t('у вас')} <b className="text-ink">{b.yours}</b> {t('· у большинства топа {picked} из {total}', { picked: b.picked, total: b.total })}
                    </span>
                  </div>
                  <div className="relative mt-1 h-1.5 rounded-full bg-surface-3">
                    <span
                      className={cn('absolute inset-y-0 left-0 rounded-full', b.yours >= b.picked ? 'bg-good' : 'bg-warning')}
                      style={{ width: `${(b.yours / b.total) * 100}%` }}
                    />
                    <span className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-ink/70" style={{ left: `${(b.picked / b.total) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title={t('Титулы и крылья у топа')} hint={t('Что надевают топ-игроки (доли у двух фракций сложены).')}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(
                [
                  [t('Атака'), top.titles.attack],
                  [t('Защита'), top.titles.defense],
                  [t('Другое'), top.titles.other],
                  [t('Крылья'), top.wings]
                ] as const
              ).map(([ru, list]) => (
                <div key={ru}>
                  <div className="mb-1 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">{ru}</div>
                  <ul className="space-y-0.5 text-xs">
                    {list.slice(0, 3).map((t) => (
                      <li key={t.name} className="flex justify-between gap-2">
                        <span className="truncate text-ink-2">{t.name}</span>
                        <span className="tnum text-ink-3">{t.share}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
