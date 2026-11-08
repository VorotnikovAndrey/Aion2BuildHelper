import { Layers } from 'lucide-react'
import { GENUS_GRADES, GENUS_MAX } from '@shared/gamedata/genus'
import { formatStatValue } from '@shared/gamedata/stats'
import { GuideSwitcher } from '@/components/GuideSwitcher'
import { VerdictChip, WeightDots, WishChip } from '@/components/game'
import { Tooltip } from '@/components/ui/InfoTip'
import { EmptyState, Legend, PageHeader } from '@/components/ui/misc'
import { Pill, toneOfShare } from '@/components/ui/Pill'
import { cn } from '@/lib/format'
import { TONE_BOX, TONE_TEXT, verdictTone, verdictWhy } from '@/lib/status'
import { useCharacterContext } from '@/lib/report'

const GRADE_DOT: Record<number, string> = {
  1: 'bg-grade-common',
  2: 'bg-good',
  3: 'bg-grade-rare',
  4: 'bg-grade-epic',
  5: 'bg-grade-unique'
}

export function GenusPage() {
  const ctx = useCharacterContext()!
  const { char, report, namer, guide } = ctx
  const g = report.genus

  return (
    <>
      <PageHeader
        icon={<Layers size={22} />}
        title="Познание рода"
        subtitle="Пять родов питомцев, в каждом — ячейки со случайным статом. Уровень рода растёт с коллекцией питомцев этого рода. Зелёное — уже как нужно по гайду, серое — можно лучше, зачёркнутое — перебросить."
        actions={<GuideSwitcher char={char} />}
      />

      {g.genuses.length === 0 ? (
        <EmptyState title="Оверлей ещё не видел Познание рода">Откройте окно Познания рода в игре или смените зону — оверлей обновит данные.</EmptyState>
      ) : (
        <>
          {g.wishlist.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3">
              <span className="text-xs text-ink-3">Что ловить при перебросе:</span>
              {g.wishlist.map((w) => (
                <WishChip key={w.stat} tip={`Вес в гайде: ${w.weight}`}>
                  {namer.stat(w.stat).main}
                  {GENUS_MAX[w.stat] ? <span className="ml-1 opacity-70">до {formatStatValue(w.stat, GENUS_MAX[w.stat])}</span> : null}
                </WishChip>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
            {g.genuses.map((genus) => (
              <section key={genus.def.key} className="rounded-2xl border border-line bg-surface p-3.5">
                <header className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <Tooltip
                      content={`Род «${genus.def.ru}» (${genus.def.en}), уровень ${genus.level}. Уровень растёт с коллекцией питомцев этого рода — с ним открываются новые ячейки.`}
                      wide
                    >
                      <h3 className="text-[15px] font-semibold text-accent-2">{genus.def.ru}</h3>
                    </Tooltip>
                    <div className="text-[11px] text-ink-3">
                      {genus.def.en} · ур. {genus.level}
                    </div>
                  </div>
                  <Pill
                    tone={toneOfShare(genus.useful, genus.slots.length)}
                    tip={`Ячеек со статами, важными по гайду (3+): ${genus.useful} из ${genus.slots.length}. Под переброс: ${genus.reroll.length}.`}
                  >
                    {genus.useful} из {genus.slots.length}
                  </Pill>
                </header>
                <div className="space-y-1.5">
                  {genus.slots.map((s) => (
                    <Tooltip
                      key={s.slot}
                      block
                      wide
                      content={
                        <>
                          <b className="text-ink">
                            Ячейка {s.slot + 1}: {namer.stat(s.stat).main} {formatStatValue(s.stat, s.value)}
                          </b>
                          <span className="mt-1 block">{verdictWhy(s.verdict, s.weight)}</span>
                          <span className="mt-1 block text-ink-3">
                            Грейд ячейки: {GENUS_GRADES[s.grade] ?? s.grade}.
                            {GENUS_MAX[s.stat] ? ` Максимум этого стата в роде — ${formatStatValue(s.stat, GENUS_MAX[s.stat])}.` : ''}
                          </span>
                        </>
                      }
                    >
                      <div className={cn('w-full rounded-lg border px-2.5 py-1.5', TONE_BOX[verdictTone(s.verdict)], s.verdict === 'weak' && 'border-dashed')}>
                        <div className="flex items-center gap-2 text-[13px]">
                          <span className="tnum w-3 shrink-0 text-[11px] text-ink-3">{s.slot + 1}</span>
                          <span
                            className={cn(
                              'min-w-0 flex-1 truncate',
                              TONE_TEXT[verdictTone(s.verdict)],
                              s.verdict === 'bad' && 'line-through',
                              s.verdict === 'weak' && 'opacity-80'
                            )}
                          >
                            {namer.stat(s.stat).main} <span className="tnum opacity-80">{formatStatValue(s.stat, s.value)}</span>
                          </span>
                          <Tooltip content={`Грейд ячейки: ${GENUS_GRADES[s.grade] ?? s.grade}`}>
                            <span className={cn('h-2 w-2 shrink-0 rounded-full', GRADE_DOT[s.grade] ?? 'bg-ink-3')} />
                          </Tooltip>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between pl-5">
                          <WeightDots weight={s.weight} />
                          {(s.verdict === 'weak' || s.verdict === 'bad') && g.wishlist[0] && (
                            <span className="truncate text-[10.5px] text-ink-3">
                              ловить:{' '}
                              <span className="text-aether">
                                {g.wishlist
                                  .slice(0, 2)
                                  .map((w) => namer.stat(w.stat).main)
                                  .join(', ')}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <Legend
            items={[
              { swatch: <VerdictChip verdict="great">зелёное</VerdictChip>, text: 'как нужно по гайду' },
              { swatch: <VerdictChip verdict="good">жёлтое</VerdictChip>, text: 'приемлемо или слабо — при случае заменить' },
              { swatch: <VerdictChip verdict="bad">зачёркнутое</VerdictChip>, text: 'не по гайду — перебросить' },
              { swatch: <span className="h-2 w-2 rounded-full bg-grade-epic" />, text: 'цвет точки — грейд ячейки' }
            ]}
          />
          {guide?.genus.notes && <p className="mt-3 text-xs text-ink-3">{guide.genus.notes}</p>}
        </>
      )}
    </>
  )
}
