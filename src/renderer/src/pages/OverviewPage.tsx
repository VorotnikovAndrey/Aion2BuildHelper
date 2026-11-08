import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, CheckCircle2, ExternalLink, Layers, Shirt, Sparkles, Swords, TrendingDown, TrendingUp, Waypoints } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts'
import type { NextStep, StepArea } from '@shared/analysis/build'
import { describeChange } from '@shared/analysis/history'
import { classInfo, RACES } from '@shared/gamedata/classes'
import { ARCANA_TYPES } from '@shared/gamedata/arcana'
import { MODE_LABEL } from '@shared/guide/types'
import { ArcanaCardArt, ItemIcon, TitleEmblem } from '@/components/art'
import { titleName } from '@/components/collections'
import { GuideSwitcher } from '@/components/GuideSwitcher'
import { StaleBoardsNotice } from '@/components/StaleBoardsNotice'
import { ClassIcon, ImpactPill } from '@/components/game'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState, StatTile } from '@/components/ui/misc'
import { Pill, toneOfShare } from '@/components/ui/Pill'
import { ProgressBar, ScoreRing } from '@/components/ui/Progress'
import { ago, cn, compact, dateTime, fmt } from '@/lib/format'
import { levelTone, shareTone, skillTone, TONE_TEXT } from '@/lib/status'
import { SkillIcon } from '@/components/icons'
import { Tooltip } from '@/components/ui/InfoTip'
import { abyssRankName, useHistory } from '@/lib/history'
import { useCharacterContext } from '@/lib/report'
import { api } from '@/lib/store'

const AREA_ROUTE: Record<StepArea, string> = {
  skills: '/skills',
  stigmas: '/skills',
  gear: '/gear',
  arcana: '/arcana',
  daevanion: '/daevanion',
  genus: '/genus'
}

const SCORE_TIP: Record<string, string> = {
  Умения: 'уровни главных умений против цели (60%) и нужные специализации (40%); главные весят втрое больше поддержки.',
  Даэванион: 'доля нужных узлов досок, взятых по целям гайда.',
  Шмот: 'средняя польза строк на вещах по весам гайда (75%) и манакамни (25%).',
  Арканы: 'нужные умения на картах (70%) и заточка (30%).',
  'Знание о видах': 'средняя польза статов в ячейках рода по весам гайда.'
}

const AREA_ICON: Record<StepArea, typeof Swords> = {
  skills: Swords,
  stigmas: Swords,
  gear: Shirt,
  arcana: Sparkles,
  daevanion: Waypoints,
  genus: Layers
}

export function OverviewPage() {
  const ctx = useCharacterContext()!
  const { char, guide, report } = ctx
  const navigate = useNavigate()
  const info = classInfo(char.cls)

  return (
    <>
      {/* Шапка персонажа */}
      <section className="relative mb-6 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface-2 via-surface to-surface p-6">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Tooltip content={`Класс: ${info?.ru ?? 'неизвестен'}`}>
              <span className="glow-accent flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-3 text-accent">
                <ClassIcon cls={char.cls} size={46} />
              </span>
            </Tooltip>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{char.name}</h1>
              <p className="mt-1 text-[13px] text-ink-2">
                {info?.ru ?? 'Класс неизвестен'} · ур. {char.level}
                {char.legion ? ` · ${char.legion}` : ''} · сервер {char.server}
                {char.race && RACES[char.race] ? ` · ${RACES[char.race].ru}` : ''}
              </p>
              <Tooltip content="Когда оверлей Questlog последний раз обновил данные этого персонажа. Обновляются при смене зоны в игре.">
                <p className="mt-0.5 text-[11px] text-ink-3">Оверлей видел персонажа {ago(char.updatedAt)}</p>
              </Tooltip>
            </div>
          </div>
          <GuideSwitcher char={char} />
        </div>
        <div className="relative mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="Боевая мощь"
            value={compact(char.combatPower)}
            sub={fmt(char.combatPower)}
            accent
            hint="Боевая мощь из игры, как её видит оверлей. Рост по времени — на странице «История»."
          />
          <StatTile
            label="Уровень снаряжения"
            value={fmt(char.gearScore)}
            hint="Сумма уровней надетых предметов (Gear Score). От него зависит доступ к контенту."
          />
          <StatTile
            label="Ранг Бездны"
            value={char.abyss ? abyssRankName(char.abyss.grade) : '—'}
            sub={char.abyss ? `Очки: ${compact(char.abyss.points)}` : undefined}
            hint="Ранг и очки Бездны в текущем сезоне."
          />
          <StatTile
            label="Сезон Бездны"
            value={char.abyss ? `${char.abyss.kills} / ${char.abyss.deaths} / ${char.abyss.assists}` : '—'}
            sub="убийства / смерти / помощь"
            hint="Счёт PvP в текущем сезоне Бездны: убийства, смерти и помощь в убийствах."
          />
        </div>
      </section>

      <DevelopmentStrip ctx={ctx} />

      {!guide ? (
        <EmptyState
          title="Гайд не выбран"
          action={
            <Button variant="primary" onClick={() => navigate('/guides')}>
              Выбрать гайд
            </Button>
          }
        >
          Без гайда приложение показывает персонажа как есть, но не может подсказать, чего не хватает. Выберите встроенный гайд или создайте свой.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
          <div className="flex min-w-0 flex-col gap-5">
            <StaleBoardsNotice list={report.boardsStale} namer={ctx.namer} />
            <NextSteps steps={report.steps} onOpen={(s) => navigate(AREA_ROUTE[s.area])} />
            <BuildGlance ctx={ctx} />
          </div>
          <div className="flex min-w-0 flex-col gap-5">
            <Card
              title="Готовность билда"
              hint="Насколько персонаж совпадает с выбранным гайдом. Умения и Даэванион весят больше всего — от них зависят ключевые специализации."
            >
              <div className="flex items-center gap-5">
                <Tooltip
                  content="Общий балл: умения 35%, Даэванион 20%, шмот 20%, арканы 15%, Знание о видах 10%. 85+ — зелёный, 60–84 — жёлтый, ниже — красный."
                  wide
                >
                  <ScoreRing value={report.scores.overall} size={104} label="из 100" />
                </Tooltip>
                <div className="min-w-0 flex-1 space-y-2.5">
                  {(
                    [
                      ['Умения', report.scores.skills, '/skills'],
                      ['Даэванион', report.scores.daevanion, '/daevanion'],
                      ['Шмот', report.scores.gear, '/gear'],
                      ['Арканы', report.scores.arcana, '/arcana'],
                      ['Знание о видах', report.scores.genus, '/genus']
                    ] as const
                  ).map(([label, value, to]) => (
                    <Tooltip key={label} block content={`${label}: ${value} из 100 — ${SCORE_TIP[label]} Нажмите, чтобы открыть раздел.`} wide>
                      <button onClick={() => navigate(to)} className="block w-full text-left">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-ink-2">{label}</span>
                          <span className={cn('tnum', value >= 85 ? 'text-good' : value >= 60 ? 'text-warning' : 'text-critical')}>{value}</span>
                        </div>
                        <ProgressBar value={value} height={5} />
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-surface-2 px-3 py-2.5 text-xs text-ink-3">
                <span className="text-ink-2">{guide.name}</span> · {MODE_LABEL[guide.mode]}
                {guide.source?.url && (
                  <button
                    onClick={() => void api.app.openExternal(guide.source!.url!)}
                    className="ml-1.5 inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    источник <ExternalLink size={11} />
                  </button>
                )}
              </div>
            </Card>
            <GrowthCard ctx={ctx} />
            <RecentChanges ctx={ctx} />
          </div>
        </div>
      )}
    </>
  )
}

type Ctx = NonNullable<ReturnType<typeof useCharacterContext>>

function BuildGlance({ ctx }: { ctx: Ctx }) {
  const { report, namer } = ctx
  const core = report.skills.filter((s) => s.role === 'core')
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card title="Главные умения" hint="Умения, вокруг которых построен гайд: уровень против цели и специализации." actions={<GoLink to="/skills" />}>
        <div className="space-y-3">
          {core.map((s) => {
            const v = skillTone(s, report.specsUncertain)
            return (
              <Tooltip key={s.skill} block content={v.why} wide>
                <div className="flex w-full items-center gap-3">
                  <SkillIcon id={s.skill} size={30} tone={v.tone} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2 text-[13px]">
                      <span className="truncate">{namer.skill(s.skill).main}</span>
                      <span className="tnum shrink-0 text-xs text-ink-3">
                        ур. <span className={TONE_TEXT[levelTone(s).tone]}>{s.level}</span>
                        {s.targetLevel ? ` / ${s.targetLevel}` : ''}
                      </span>
                    </div>
                    <ProgressBar
                      value={s.targetLevel ? (Math.min(s.level, s.targetLevel) / s.targetLevel) * 100 : 100}
                      height={4}
                      color={v.tone === 'ok' ? 'var(--color-good)' : v.tone === 'warn' ? 'var(--color-warning)' : 'var(--color-critical)'}
                    />
                  </div>
                </div>
              </Tooltip>
            )
          })}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {report.stigmas.equipped.map((id) => {
              const wanted = report.stigmas.wanted.includes(id)
              return (
                <Pill
                  key={id}
                  tone={wanted ? 'good' : 'warning'}
                  icon={<SkillIcon id={id} size={14} />}
                  tip={wanted ? 'Стигма надета, и гайд держит её постоянно.' : 'Стигма надета, но гайд держит другую.'}
                >
                  {namer.skill(id).main}
                </Pill>
              )
            })}
            {report.stigmas.missing.map((id) => (
              <Pill key={id} tone="critical" icon={<SkillIcon id={id} size={14} dim />} tip="Гайд держит эту стигму надетой, а у вас её нет.">
                нет: {namer.skill(id).main}
              </Pill>
            ))}
          </div>
        </div>
      </Card>
      <Card title="Арканы" hint="Сколько нужных по гайду умений на каждой карте и заточка." actions={<GoLink to="/arcana" />}>
        <div className="space-y-2">
          {report.arcana.cards.map((c) => {
            const wanted = c.skills.filter((s) => s.cls === 'wanted').length
            return (
              <Tooltip
                key={c.slot}
                block
                wide
                content={`${c.info?.ru ?? 'Слот пуст'}: нужных по гайду умений ${wanted} из ${c.desired.length}, заточка +${c.enchant} из +${c.maxEnchant}.${c.missing.length ? ' Не хватает: ' + c.missing.map((id) => namer.skill(id).main).join(', ') + '.' : ' Набор как в гайде.'}`}
              >
                <div className="flex w-full items-center gap-3 text-[13px]">
                  {c.main ? <SkillIcon id={c.main} size={22} /> : <span className="h-[22px] w-[22px]" />}
                  <span className="w-28 truncate">{c.info?.ru ?? ARCANA_TYPES.find((t) => t.type === c.type)!.ru}</span>
                  <Pill tone={toneOfShare(wanted, c.desired.length)}>
                    {wanted} из {c.desired.length}
                  </Pill>
                  <span className={cn('tnum text-xs', c.enchant >= c.maxEnchant ? 'text-good' : 'text-warning')}>
                    +{c.enchant}/{c.maxEnchant}
                  </span>
                  <ProgressBar value={c.score} height={4} className="flex-1" />
                </div>
              </Tooltip>
            )
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {report.arcana.sets
            .filter((s) => s.count)
            .map((s) => (
              <Pill key={s.variant} tone={s.active ? 'accent' : 'neutral'} tip={`2 карты: ${s.bonus2}. 4 карты: ${s.bonus4}.`}>
                {s.name}: {s.count}/4
              </Pill>
            ))}
        </div>
      </Card>
      <Card title="Даэванион" hint="Цели гайда по доскам: сколько нужных узлов взято." actions={<GoLink to="/daevanion" />}>
        <div className="space-y-3">
          {report.daevanion.goals.map((g) => (
            <Tooltip
              key={g.goal.id}
              block
              wide
              content={`${g.goal.description ?? g.goal.name} Взято ${g.done} из ${g.required.length} нужных узлов${g.remainingCost ? `, осталось около ${g.remainingCost} очк.` : '.'}`}
            >
              <div className="w-full">
                <div className="mb-1 flex items-center justify-between gap-2 text-[13px]">
                  <span className="truncate">{g.goal.name}</span>
                  <span className={cn('tnum shrink-0 text-xs', TONE_TEXT[shareTone(g.done, g.required.length)])}>
                    {g.done}/{g.required.length}
                  </span>
                </div>
                <ProgressBar value={g.required.length ? (g.done / g.required.length) * 100 : 100} height={4} />
              </div>
            </Tooltip>
          ))}
          <Tooltip content="Сумма стоимости всех взятых узлов на всех досках.">
            <p className="text-xs text-ink-3">Вложено очков: {fmt(report.daevanion.spent)}</p>
          </Tooltip>
        </div>
      </Card>
      <Card title="Шмот и род" hint="Доля полезных строк на шмоте и в Знании о видах." actions={<GoLink to="/gear" />}>
        <div className="space-y-3 text-[13px]">
          <Row
            label="Полезных строк на шмоте"
            value={`${sum(report.gear.map((g) => g.useful))} из ${sum(report.gear.map((g) => g.total))}`}
            tip="Строки вещей с важностью 3–5 по гайду (зелёные и жёлтые на странице «Шмот»)."
          />
          <Row
            label="Строк «менять»"
            value={String(sum(report.gear.map((g) => g.replace.length)))}
            warn
            tip="Строки, которые гайд совсем не ценит (красные зачёркнутые), — их стоит перековать."
          />
          <Row
            label="Слабых манакамней"
            tip="Манакамни со статами важностью 0–1 по гайду — их стоит заменить на АТК или Крит. удар."
            value={`${report.gear.flatMap((g) => g.manastones).filter((m) => m.weight <= 1).length} из ${report.gear.flatMap((g) => g.manastones).length}`}
            warn
          />
          <Row
            label="Ячеек рода под переброс"
            tip="Ячейки Знания о видах со статами важностью 0–1 по гайду."
            value={`${sum(report.genus.genuses.map((g) => g.reroll.length))} из ${sum(report.genus.genuses.map((g) => g.slots.length))}`}
            warn
          />
        </div>
      </Card>
    </div>
  )
}

function GrowthCard({ ctx }: { ctx: Ctx }) {
  const { char } = ctx
  const { entries } = useHistory(char.key)
  const points = entries.map((e) => ({ t: e.summary.at || e.savedAt, cp: e.summary.combatPower }))
  const first = points[0]
  const delta = first ? char.combatPower - first.cp : 0
  return (
    <Card title="Рост боевой мощи" hint="Строится по снимкам, которые приложение сохраняет при каждом обновлении данных оверлея.">
      {points.length < 2 ? (
        <p className="text-[13px] text-ink-3">История копится с первого запуска. Как только оверлей обновит персонажа ещё раз, здесь появится график.</p>
      ) : (
        <>
          <div className="mb-2 flex items-center gap-2 text-[13px]">
            {delta >= 0 ? <TrendingUp size={15} className="text-good" /> : <TrendingDown size={15} className="text-critical" />}
            <span className={delta >= 0 ? 'text-good' : 'text-critical'}>
              {delta >= 0 ? '+' : ''}
              {fmt(delta)}
            </span>
            <span className="text-ink-3">с {dateTime(first.t)}</span>
          </div>
          <div className="h-28">
            <ResponsiveContainer>
              <LineChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <XAxis dataKey="t" hide type="number" domain={['dataMin', 'dataMax']} />
                <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                <ChartTooltip
                  contentStyle={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-line-strong)', borderRadius: 8, fontSize: 12 }}
                  labelFormatter={(t) => dateTime(Number(t))}
                  formatter={(v) => [fmt(Number(v)), 'Боевая мощь']}
                />
                <Line type="monotone" dataKey="cp" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Card>
  )
}

function RecentChanges({ ctx }: { ctx: Ctx }) {
  const { char, namer } = ctx
  const { entries } = useHistory(char.key)
  const recent = entries
    .slice()
    .reverse()
    .flatMap((e) => e.changes.map((c) => ({ at: e.savedAt, c })))
    .filter(({ c }) => c.kind !== 'gearScore')
    .slice(0, 7)
  return (
    <Card title="Последние изменения" actions={<GoLink to="/history" />}>
      {recent.length === 0 ? (
        <p className="text-[13px] text-ink-3">Изменений пока нет — они появятся после следующего обновления оверлея.</p>
      ) : (
        <ul className="space-y-2">
          {recent.map(({ at, c }, i) => {
            const d = describeChange(c, namer)
            return (
              <li key={i} className="flex items-start gap-2 text-[13px]">
                <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', d.good === true ? 'bg-good' : d.good === false ? 'bg-critical' : 'bg-ink-3')} />
                <span className="min-w-0 flex-1 text-ink-2">{d.text}</span>
                <span className="shrink-0 text-[11px] text-ink-3">{ago(at)}</span>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

function NextSteps({ steps, onOpen }: { steps: NextStep[]; onOpen: (s: NextStep) => void }) {
  const [all, setAll] = useState(false)
  const shown = all ? steps : steps.slice(0, 8)
  return (
    <Card
      title="Что сделать дальше"
      hint="Список собран из разницы между персонажем и гайдом. Сверху — то, что сильнее всего влияет на билд. Нажмите на пункт, чтобы открыть раздел."
      actions={<Pill tone={steps.length ? 'accent' : 'good'}>{steps.length ? `${steps.length} шагов` : 'всё по гайду'}</Pill>}
    >
      {steps.length === 0 ? (
        <div className="flex items-center gap-2 text-[13px] text-good">
          <CheckCircle2 size={16} /> Персонаж полностью совпадает с гайдом. Самое время выбрать гайд посерьёзнее.
        </div>
      ) : (
        <ul className="-mx-2">
          {shown.map((s) => {
            const Icon = AREA_ICON[s.area]
            return (
              <li key={s.id}>
                <button
                  onClick={() => onOpen(s)}
                  className="group flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-surface-2"
                >
                  {s.skill ? (
                    <SkillIcon id={s.skill} size={26} className="mt-0.5" />
                  ) : (
                    <Icon size={16} className="mt-0.5 shrink-0 text-ink-3 group-hover:text-accent" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] leading-snug">{s.title}</span>
                    {s.detail && <span className="mt-0.5 block text-xs leading-relaxed text-ink-3">{s.detail}</span>}
                  </span>
                  <ImpactPill impact={s.impact} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {steps.length > 8 && (
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => setAll((v) => !v)}>
          {all ? 'Свернуть' : `Показать все (${steps.length})`}
        </Button>
      )}
    </Card>
  )
}

function GoLink({ to }: { to: string }) {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(to)} className="flex items-center gap-1 text-xs text-ink-3 hover:text-accent">
      подробнее <ArrowRight size={12} />
    </button>
  )
}

function Row({ label, value, warn, tip }: { label: string; value: string; warn?: boolean; tip?: string }) {
  const zero = value.trim().startsWith('0')
  return (
    <Tooltip content={tip} block>
      <div className="flex w-full items-center justify-between gap-3">
        <span className="text-ink-2">{label}</span>
        <span className={cn('tnum', warn && zero ? 'text-good' : warn ? 'text-warning' : 'text-ink')}>{value}</span>
      </div>
    </Tooltip>
  )
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

/** «Обзор развития» — как в окне персонажа игры: надетые титулы, арканы и оружие с бронёй одной полосой. */
function DevelopmentStrip({ ctx }: { ctx: NonNullable<ReturnType<typeof useCharacterContext>> }) {
  const { report, namer } = ctx
  const navigate = useNavigate()
  const titles = report.titles.slots.filter((s) => s.equipped)
  const cards = report.arcana.cards
  const main = report.gear.filter((i) => i.group !== 'accessory')
  return (
    <Card
      title="Обзор развития"
      className="mb-6"
      hint="Как вкладка «Обзор развития» в окне персонажа: что надето прямо сейчас. Нажмите на блок, чтобы открыть раздел."
    >
      <div className="flex flex-wrap items-stretch gap-x-8 gap-y-5">
        <button onClick={() => navigate('/collections')} className="min-w-0 text-left">
          <div className="mb-2 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">Титулы</div>
          <div className="flex gap-2">
            {titles.length === 0 && <span className="text-[13px] text-ink-3">не надеты</span>}
            {titles.map((s) => (
              <Tooltip key={s.category} content={`${s.ru}: ${titleName(s.equipped!)}`}>
                <div className="flex w-[92px] flex-col items-center gap-1 rounded-xl border border-line bg-surface-2 px-1.5 pt-2 pb-1.5 transition-colors hover:border-line-strong">
                  <TitleEmblem category={s.equipped!.category} grade={s.equipped!.grade} size={40} />
                  <span className="line-clamp-2 text-center text-[10.5px] leading-tight text-ink-2">{titleName(s.equipped!)}</span>
                </div>
              </Tooltip>
            ))}
          </div>
        </button>

        <button onClick={() => navigate('/arcana')} className="min-w-0 text-left">
          <div className="mb-2 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">Арканы</div>
          <div className="flex gap-2">
            {cards.map((c) => (
              <Tooltip
                key={c.slot}
                content={
                  c.item ? `${c.info?.ru ?? ''}: заточка +${c.enchant} из +${c.maxEnchant}` : `${ARCANA_TYPES.find((t) => t.type === c.type)?.ru}: слот пуст`
                }
              >
                <div className="w-[58px] transition-transform hover:-translate-y-0.5" style={{ fontSize: 11 }}>
                  <ArcanaCardArt type={c.type} variant={c.info?.variant} enchant={c.item ? c.enchant : undefined} empty={!c.item} />
                </div>
              </Tooltip>
            ))}
          </div>
        </button>

        <button onClick={() => navigate('/gear')} className="min-w-0 flex-1 text-left">
          <div className="mb-2 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">Оружие и броня</div>
          <div className="flex flex-wrap gap-1.5">
            {main.map((i) => (
              <Tooltip key={i.slot} content={`${namer.item(i.item.item, i.slot).main} · +${i.item.enchant}`}>
                <ItemIcon itemId={i.item.item} slot={i.slot} enchant={i.item.enchant} size={44} />
              </Tooltip>
            ))}
          </div>
        </button>
      </div>
    </Card>
  )
}
