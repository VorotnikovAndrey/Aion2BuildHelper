import { useMemo, useState } from 'react'
import { Gem, Search } from 'lucide-react'
import { guideWeights } from '@shared/analysis/weights'
import { formatStatValue, statByKey, statDef, STAT_GROUPS } from '@shared/gamedata/stats'
import { topData } from '@shared/gamedata/top'
import { CharacterSheet } from '@/components/CharacterSheet'
import { TargetBar } from '@/components/targets'
import { GuideSwitcher } from '@/components/GuideSwitcher'
import { Name, WeightDots } from '@/components/game'
import { Card } from '@/components/ui/Card'
import { PageHeader, Segmented } from '@/components/ui/misc'
import { cn } from '@/lib/format'
import { Tooltip } from '@/components/ui/InfoTip'
import { useCharacterContext } from '@/lib/report'

type Filter = 'all' | 'guide'

export function StatsPage() {
  const ctx = useCharacterContext()!
  const { char, guide, namer, report } = ctx
  const [filter, setFilter] = useState<Filter>('all')
  const [q, setQ] = useState('')
  const w = useMemo(() => guideWeights(guide), [guide])
  const values = useMemo(() => new Map(char.stats.map((s) => [s.stat, s.value])), [char.stats])
  const content = report.statTargets.filter((t) => t.target.kind !== 'top')
  const top = report.statTargets.filter((t) => t.target.kind === 'top')
  const refs = useMemo(() => new Map(top.map((t) => [t.target.stats[0], t])), [top])

  const groups = useMemo(() => {
    const used = new Set<number>()
    const out = STAT_GROUPS.map((g) => {
      const rows = g.keys
        .map((k) => statByKey(k))
        .filter((d): d is NonNullable<typeof d> => !!d && values.has(d.id))
        .map((d) => {
          used.add(d.id)
          return d
        })
      return { id: g.id, title: g.ru, rows }
    })
    const rest = char.stats
      .filter((s) => !used.has(s.stat) && s.value !== 0)
      .map((s) => statDef(s.stat))
      .filter((d): d is NonNullable<typeof d> => !!d)
    out.push({ id: 'other', title: 'Прочее', rows: rest })
    return out
  }, [char.stats, values])

  const needle = q.trim().toLowerCase()
  const visible = (id: number) => {
    const label = namer.stat(id)
    if (needle && !`${label.main} ${label.alt ?? ''}`.toLowerCase().includes(needle)) return false
    if (filter === 'guide' && w.stat('weapon', id) === 0) return false
    return true
  }

  return (
    <>
      <PageHeader
        icon={<Gem size={22} />}
        title="Статы"
        subtitle="Итоговые характеристики персонажа, как их видит оверлей. Точки справа — насколько стат важен по гайду; плюс — сколько дают доски Даэваниона."
        actions={<GuideSwitcher char={char} />}
      />
      <Card
        title="Показатели персонажа"
        className="mb-5"
        hint="Как окно «Показатели персонажа» в игре: шесть характеристик в центре, вокруг — статы богов. Рамка круга: зелёная — не ниже среднего у топ-игроков класса, жёлтая — ниже. Наведите на любой круг — там пояснение."
      >
        <CharacterSheet values={values} fromBoards={report.daevanion.stats} namer={namer} refs={refs} />
      </Card>

      {report.statTargets.length > 0 && (
        <Card
          title="Где хватает и к чему стремиться"
          className="mb-5"
          hint={
            top.length
              ? `Пороги — сколько нужно для контента или сколько у автора гайда на целевой стадии. Ориентиры — сколько в среднем у ${topData(char.cls)?.players.toLocaleString('ru-RU') ?? ''} топ-игроков класса (metabot.gg). Отметка на шкале — цель; зелёное — хватает, жёлтое — не хватает.`
              : 'Пороги — сколько нужно для контента или сколько у автора гайда на целевой стадии (по расчёту Questlog). Отметка на шкале — цель; зелёное — хватает, жёлтое — не хватает.'
          }
        >
          <div className={cn('grid grid-cols-1 gap-6', top.length > 0 && 'xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]')}>
            <div className={cn('space-y-4', !top.length && 'max-w-xl')}>
              <div className="text-[11px] font-semibold tracking-wider text-ink-3 uppercase">Для контента (PvE)</div>
              {content.map((t) => (
                <TargetBar key={t.target.id} t={t} />
              ))}
            </div>
            {top.length > 0 && (
              <div className="space-y-4">
                <div className="text-[11px] font-semibold tracking-wider text-ink-3 uppercase">Ориентир: в среднем у топ-игроков класса</div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                  {top.map((t) => (
                    <TargetBar key={t.target.id} t={t} compact />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Найти стат…"
            className="h-9 w-64 rounded-lg border border-line-strong bg-surface pr-3 pl-9 text-[13px] outline-none placeholder:text-ink-3 focus:border-accent"
          />
        </div>
        <Segmented
          value={filter}
          onChange={setFilter}
          items={[
            { id: 'all', label: 'Все' },
            { id: 'guide', label: 'Важные по гайду' }
          ]}
        />
      </div>
      <div className="columns-1 gap-5 lg:columns-2 2xl:columns-3">
        {groups.map((g) => {
          const rows = g.rows.filter((d) => visible(d.id))
          if (!rows.length) return null
          return (
            <Card key={g.id} title={g.title} className="mb-5 break-inside-avoid" bodyClassName="px-3 pb-3">
              {rows.map((d) => {
                const weight = w.stat('weapon', d.id)
                const fromBoards = report.daevanion.stats.get(d.id)
                return (
                  <Tooltip
                    key={d.id}
                    block
                    wide
                    content={`${namer.stat(d.id).main}${namer.stat(d.id).alt ? ` (${namer.stat(d.id).alt})` : ''}: ${formatStatValue(d.id, values.get(d.id) ?? 0)}.${fromBoards ? ` Из них от досок Даэваниона: ${formatStatValue(d.id, fromBoards, { sign: true })}.` : ''} ${weight ? `Важность по гайду: ${weight} из 5.` : 'Гайд этот стат не ценит.'}`}
                  >
                    <div className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-2">
                      <Name label={namer.stat(d.id)} className={cn('min-w-0 flex-1 text-[13px]', weight >= 4 ? 'text-ink' : 'text-ink-2')} />
                      {fromBoards ? (
                        <span className="tnum shrink-0 text-[10.5px] text-ink-3" title="Из них — от досок Даэваниона">
                          {formatStatValue(d.id, fromBoards, { sign: true })}
                        </span>
                      ) : null}
                      <span className="tnum w-20 shrink-0 text-right text-[13px] font-medium">{formatStatValue(d.id, values.get(d.id) ?? 0)}</span>
                      <WeightDots weight={weight} className="w-12 shrink-0 justify-end" />
                    </div>
                  </Tooltip>
                )
              })}
            </Card>
          )
        })}
      </div>
    </>
  )
}
