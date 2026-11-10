import { ArrowRight, Brain, Layers, Leaf, Dna, PawPrint, Sparkles, type LucideIcon } from 'lucide-react'
import type { GenusReport, GenusSlotReport } from '@shared/analysis/genus'
import { GENUS_GRADE_COLOR, GENUS_GRADES, GENUS_LEVEL_GOAL, GENUS_LOCK_SHARE, GENUS_MAX } from '@shared/gamedata/genus'
import { formatStatValue } from '@shared/gamedata/stats'
import { gradeColorVar, StatusBadge } from '@/components/art'
import { DataFreshness } from '@/components/DataFreshness'
import { GuideSwitcher } from '@/components/GuideSwitcher'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/InfoTip'
import { EmptyState, Legend, PageHeader, StatTile } from '@/components/ui/misc'
import { Pill, toneOfShare } from '@/components/ui/Pill'
import { cn } from '@/lib/format'
import { useCharacterContext } from '@/lib/report'
import { verdictTone, verdictWhy } from '@/lib/status'
import { t } from '@shared/i18n'
import { term, termWithEn } from '@shared/names'

type Ctx = NonNullable<ReturnType<typeof useCharacterContext>>

const GENUS_ICON: Record<string, LucideIcon> = {
  intellect: Brain,
  feral: PawPrint,
  nature: Leaf,
  trans: Dna,
  special: Sparkles
}

/** Ячейка «как нужно» — важность 4–5; «можно лучше» — 2–3; «перебросить» — 0–1. */
const bucket = (s: GenusSlotReport) => (s.weight >= 4 ? 'ok' : s.weight >= 2 ? 'better' : 'reroll')

export function GenusPage() {
  const ctx = useCharacterContext()!
  const { char, report, namer, guide } = ctx
  const g = report.genus
  const all = g.genuses.flatMap((x) => x.slots)
  const ok = all.filter((s) => bucket(s) === 'ok').length
  const better = all.filter((s) => bucket(s) === 'better').length
  const reroll = all.filter((s) => bucket(s) === 'reroll').length
  const lowLevel = g.genuses.filter((x) => x.level < GENUS_LEVEL_GOAL)

  return (
    <>
      <PageHeader
        icon={<Layers size={22} />}
        title={t('Знание о видах')}
        subtitle={t(
          'Пять родов питомцев, в каждом — ячейки со случайным статом. Уровень рода растёт с коллекцией питомцев этого рода, с ним открываются ячейки и растёт их грейд. У каждой ячейки — итог по гайду и, если стоит перебросить, на что.'
        )}
        actions={<GuideSwitcher char={char} />}
      />

      <DataFreshness char={char} section="genus" className="mb-5" />

      {g.genuses.length === 0 ? (
        <EmptyState title={t('Оверлей ещё не видел Знание о видах')}>
          {t('Откройте окно Знания о видах в игре или смените зону — оверлей обновит данные.')}
        </EmptyState>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label={t('Оценка')}
              value={`${g.score} / 100`}
              valueClassName={g.score >= 85 ? 'text-good' : g.score >= 60 ? 'text-warning' : 'text-critical'}
              hint={t('Средняя польза статов во всех ячейках по весам гайда.')}
            />
            <StatTile
              label={t('Как нужно')}
              value={t('{ok} из {allCount}', { ok, allCount: all.length })}
              valueClassName="text-good"
              hint={t('Ячейки со статами, важными по гайду (4–5 из 5). Их стоит запереть, если значение верхнее.')}
            />
            <StatTile
              label={t('Можно лучше')}
              value={better}
              valueClassName={better ? 'text-warning' : 'text-good'}
              hint={t('Ячейки со статами средней важности (2–3): перебросить при случае.')}
            />
            <StatTile
              label={t('Перебросить')}
              value={reroll}
              valueClassName={reroll ? 'text-critical' : 'text-good'}
              hint={t('Ячейки со статами, которые гайд почти не ценит (0–1): ОМ, удары с тыла и т.п. Перебрасывать в первую очередь.')}
            />
          </div>

          <Card title={t('Как улучшать')} className="mb-5" hint={t('Порядок из гайдов ExpCarry и SolAshur.')}>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <ol className="space-y-2 text-[13px] leading-relaxed text-ink-2">
                <Step n={1}>
                  {t(
                    'Поднимайте каждый род до ур. {GENUS_LEVEL_GOAL} — с уровнем открываются ячейки и растёт их грейд. Все пять родов на ур. 10 — это ещё и достижение «Genus Genius» с титулом «Unbound by Genus» (лучший атакующий титул по гайду).',
                    { GENUS_LEVEL_GOAL }
                  )}
                  {lowLevel.length > 0 && (
                    <span className="text-warning">
                      {' '}
                      {t('Сейчас ниже:')} {lowLevel.map((x) => `${term(x.def)} (${x.level})`).join(', ')}.
                    </span>
                  )}
                </Step>
                <Step n={2}>{t('Перебрасывайте сначала красные ячейки (в них показано, что ловить), потом жёлтые — цель в подсказке ячейки.')}</Step>
                <Step n={3}>
                  {t(
                    'Запирайте только верхние значения хорошего стата: золотую ячейку — сейчас, оранжевую — позже. Полоска под ячейкой — где значение в диапазоне её грейда; зелёная — верх, можно запирать.'
                  )}
                </Step>
              </ol>
              {g.wishlist.length > 0 && (
                <div>
                  <Tooltip content={t('Самые важные по гайду статы, которые встречаются в Знании о видах, и их максимум в ячейке.')}>
                    <div className="mb-2 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">{t('Что ловить при перебросе')}</div>
                  </Tooltip>
                  <div className="flex flex-wrap gap-1.5">
                    {g.wishlist.map((w, i) => (
                      <Tooltip
                        key={w.stat}
                        content={t('Важность по гайду: {weight} из 5.{p}', {
                          weight: w.weight,
                          p: GENUS_MAX[w.stat] ? t(' Максимум в ячейке — {stat}.', { stat: formatStatValue(w.stat, GENUS_MAX[w.stat]) }) : ''
                        })}
                      >
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs',
                            i === 0 ? 'border-aether/60 bg-aether-soft font-medium text-aether' : 'border-aether/30 text-aether'
                          )}
                        >
                          {namer.stat(w.stat).main}
                          {GENUS_MAX[w.stat] ? (
                            <span className="opacity-70">{t('до {stat}', { stat: formatStatValue(w.stat, GENUS_MAX[w.stat]) })}</span>
                          ) : null}
                        </span>
                      </Tooltip>
                    ))}
                  </div>
                  {guide?.genus.notes && <p className="mt-3 text-xs leading-relaxed text-ink-3">{guide.genus.notes}</p>}
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            {g.genuses.map((genus) => (
              <GenusCard key={genus.def.key} genus={genus} ctx={ctx} />
            ))}
          </div>

          <Legend
            items={[
              { swatch: <StatusBadge tone="ok" />, text: t('как нужно по гайду') },
              { swatch: <StatusBadge tone="warn" />, text: t('можно лучше') },
              { swatch: <StatusBadge tone="bad" />, text: t('перебросить') },
              {
                swatch: (
                  <span className="inline-flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className="h-2.5 w-2.5 rounded-sm" style={{ background: gradeColorVar(GENUS_GRADE_COLOR[n]) }} />
                    ))}
                  </span>
                ),
                text: t('цвет номера ячейки — грейд, от обычной до эпической')
              }
            ]}
          />
        </>
      )}
    </>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">{n}</span>
      <span>{children}</span>
    </li>
  )
}

function GenusCard({ genus, ctx }: { genus: GenusReport; ctx: Ctx }) {
  const Icon = GENUS_ICON[genus.def.key] ?? Layers
  const levelPct = Math.min(100, (genus.level / GENUS_LEVEL_GOAL) * 100)
  return (
    <section className="flex flex-col rounded-2xl border border-line bg-surface p-3.5">
      <header className="mb-3 flex items-center gap-3">
        <Tooltip
          content={t('Род «{def}». Уровень растёт с коллекцией питомцев этого рода — с ним открываются ячейки и растёт их грейд.', {
            def: termWithEn(genus.def)
          })}
          wide
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-gradient-to-br from-surface-3 to-surface-2 text-accent-2 shadow-[0_0_14px_-4px_var(--color-accent)]">
            <Icon size={20} strokeWidth={1.7} />
          </span>
        </Tooltip>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-[15px] font-semibold text-ink">{term(genus.def)}</h3>
            <Pill
              tone={toneOfShare(genus.useful, genus.slots.length)}
              tip={t('Ячеек со статами, полезными по гайду (3+): {useful} из {slotsCount}.', { useful: genus.useful, slotsCount: genus.slots.length })}
            >
              {t('{useful} из {slotsCount}', { useful: genus.useful, slotsCount: genus.slots.length })}
            </Pill>
          </div>
          <Tooltip
            block
            content={t('Уровень рода {level} из {GENUS_LEVEL_GOAL}: до {GENUS_LEVEL_GOAL} — перед тем как запирать ячейки.', {
              level: genus.level,
              GENUS_LEVEL_GOAL
            })}
          >
            <div className="mt-1 flex w-full items-center gap-2 text-[11px] text-ink-3">
              <span className="tnum shrink-0">{t('ур. {level}/{GENUS_LEVEL_GOAL}', { level: genus.level, GENUS_LEVEL_GOAL })}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                <span
                  className={cn('block h-full rounded-full', genus.level >= GENUS_LEVEL_GOAL ? 'bg-good' : 'bg-accent')}
                  style={{ width: `${levelPct}%` }}
                />
              </span>
            </div>
          </Tooltip>
        </div>
      </header>
      <div className="space-y-1.5">
        {genus.slots.map((s) => (
          <SlotTile key={s.slot} s={s} level={genus.level} ctx={ctx} />
        ))}
      </div>
    </section>
  )
}

function SlotTile({ s, level, ctx }: { s: GenusSlotReport; level: number; ctx: Ctx }) {
  const { namer } = ctx
  const b = bucket(s)
  const tone = b === 'ok' ? 'ok' : b === 'better' ? 'warn' : 'bad'
  const grade = GENUS_GRADE_COLOR[s.grade] ?? 'common'
  const name = s.empty ? t('Пусто') : namer.stat(s.stat).main
  const v = (x: number) => formatStatValue(s.stat, x)
  const top = s.lockFrom !== null && s.value >= s.lockFrom
  return (
    <Tooltip
      block
      wide
      content={
        <>
          <b className="text-ink">
            {t('Ячейка')} {s.slot + 1}: {s.empty ? t('пусто') : `${name} ${v(s.value)}`}
          </b>
          {s.empty ? (
            <span className="mt-1 block">{t('Ячейку ещё не анализировали — запустите анализ, чтобы в ней появился стат.')}</span>
          ) : (
            <span className="mt-1 block">{verdictWhy(s.verdict, s.weight)}</span>
          )}
          <span className="mt-1 block text-ink-3">
            {t('Грейд ячейки:')} {GENUS_GRADES[s.grade] ?? s.grade}.
          </span>
          {s.range && (
            <span className="mt-1 block">
              {t('В этом грейде стат бывает от {v} до {v2}.', { v: v(s.range.min), v2: v(s.range.max) })}
              {top ? (
                <span className="text-good">{t('У вас {v} — верх диапазона, можно запирать.', { v: v(s.value) })}</span>
              ) : (
                <span className={tone === 'bad' ? 'text-ink-3' : 'text-warning'}>
                  {t('Хорошее значение — от {v}, у вас {v2}.', { v: v(s.lockFrom!), v2: v(s.value) })}
                </span>
              )}
              {s.slotMax !== null && s.slotMax > s.range.max && <> {t('В высшем грейде этой ячейки — до {v}.', { v: v(s.slotMax) })}</>}
              <span className="block text-ink-3">
                {t('«Верх» — верхние')} {Math.round((1 - GENUS_LOCK_SHARE) * 100)}
                {t('% диапазона грейда (оценка помощника).')}
              </span>
            </span>
          )}
          {!s.range && !s.empty && GENUS_MAX[s.stat] ? (
            <span className="mt-1 block text-ink-3">{t('Максимум этого стата в Знании о видах — {v}.', { v: v(GENUS_MAX[s.stat]) })}</span>
          ) : null}
          {s.target && (
            <span className="mt-1 block text-aether">
              {t('Перебросить на «{stat}» (важность {weight} → {weight2}).', {
                stat: namer.stat(s.target.stat).main,
                weight: s.weight,
                weight2: s.target.weight
              })}
              {s.target.inSlot
                ? t('В этой ячейке он бывает до {stat}; шанс за анализ на ур. {level} рода — {fmtChance}.{p}', {
                    stat: formatStatValue(s.target.stat, s.target.max ?? 0),
                    level,
                    fmtChance: fmtChance(s.target.chance ?? 0),
                    p:
                      (s.target.chance ?? 0) < 1
                        ? t(
                            ' Это редкость: стат выпадает только в высших грейдах, а ничего лучше по гайду в этой ячейке не бывает. На ур. 10 рода — {fmtChance}; до этого ресурсы на ячейку можно не тратить.',
                            { fmtChance: fmtChance(s.target.chanceAt10 ?? 0) }
                          )
                        : ''
                  })
                : t('Какие статы бывают именно в этой ячейке, в данных нет — это лучший стат из встречающихся в Знании о видах.')}
            </span>
          )}
        </>
      }
    >
      <div
        className={cn(
          'w-full rounded-lg border-l-2 bg-surface-2/60 px-2.5 py-1.5',
          tone === 'ok' ? 'border-good/70' : tone === 'warn' ? 'border-warning/70' : 'border-critical/70'
        )}
      >
        <div className="flex items-start gap-2">
          <span
            className="tnum mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10.5px] font-bold text-bg"
            style={{ background: gradeColorVar(grade) }}
          >
            {s.slot + 1}
          </span>
          <span
            className={cn(
              'min-w-0 flex-1 text-[13px] leading-snug',
              s.empty ? 'text-ink-3 italic' : tone === 'ok' ? 'text-ink' : tone === 'warn' ? 'text-ink-2' : 'text-critical line-through decoration-1',
              !s.empty && verdictTone(s.verdict) === 'neutral' && 'text-ink-3'
            )}
          >
            {name}
          </span>
          <span className={cn('tnum shrink-0 text-[13px] font-semibold', tone === 'ok' ? 'text-good' : tone === 'warn' ? 'text-warning' : 'text-critical')}>
            {s.empty ? '—' : v(s.value)}
          </span>
        </div>
        {s.range && (
          <div className="mt-1 flex items-center gap-2 pl-7">
            <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
              <span
                className={cn('block h-full rounded-full', tone === 'bad' ? 'bg-line-strong' : top ? 'bg-good' : 'bg-warning')}
                style={{ width: `${Math.max(6, (s.quality ?? 0) * 100)}%` }}
              />
            </span>
            <span className="tnum shrink-0 text-[10.5px] text-ink-3">
              {v(s.range.min)}–{v(s.range.max)}
            </span>
          </div>
        )}
        {s.target && b === 'reroll' && (
          <div className="mt-1 flex items-center gap-1.5 pl-7 text-[11.5px]">
            <ArrowRight size={12} className="shrink-0 text-ink-3" />
            <span className="rounded-full border border-aether/40 bg-aether-soft px-2 py-px font-medium text-aether">{namer.stat(s.target.stat).main}</span>
            {s.target.chance !== null && (
              <span className={cn('tnum', s.target.chance < 1 ? 'text-ink-3 italic' : 'text-ink-3')}>
                {fmtChance(s.target.chance)}
                {s.target.chance < 1 ? t(' · редко') : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </Tooltip>
  )
}

/** Шанс за анализ: «2%», «0,5%». */
function fmtChance(p: number): string {
  return `${p >= 10 ? Math.round(p) : Math.round(p * 10) / 10}%`.replace('.', ',')
}
