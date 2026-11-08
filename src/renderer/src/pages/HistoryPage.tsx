import { useMemo, useState } from 'react'
import { History } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts'
import { describeChange, type Change } from '@shared/analysis/history'
import { Card } from '@/components/ui/Card'
import { EmptyState, PageHeader, Segmented, StatTile } from '@/components/ui/misc'
import { cn, compact, dateOnly, dateTime, fmt } from '@/lib/format'
import { useHistory } from '@/lib/history'
import { useCharacterContext } from '@/lib/report'

type Metric = 'combatPower' | 'gearScore'
type KindFilter = 'all' | 'gear' | 'skills' | 'other'

const KIND_GROUP: Record<Change['kind'], KindFilter> = {
  cp: 'other',
  gearScore: 'other',
  level: 'other',
  skill: 'skills',
  specs: 'skills',
  equip: 'skills',
  item: 'gear',
  enchant: 'gear',
  itemLines: 'gear',
  manastones: 'gear',
  daevanion: 'skills',
  pets: 'other',
  genus: 'other',
  titles: 'other'
}

export function HistoryPage() {
  const ctx = useCharacterContext()!
  const { char, namer } = ctx
  const { entries, loading } = useHistory(char.key)
  const [metric, setMetric] = useState<Metric>('combatPower')
  const [kind, setKind] = useState<KindFilter>('all')

  const points = useMemo(
    () => entries.map((e) => ({ t: e.summary.at || e.savedAt, combatPower: e.summary.combatPower, gearScore: e.summary.gearScore })),
    [entries]
  )
  const days = useMemo(() => {
    const map = new Map<string, { at: number; changes: Change[] }[]>()
    for (const e of [...entries].reverse()) {
      const changes = e.changes.filter((c) => kind === 'all' || KIND_GROUP[c.kind] === kind)
      if (!changes.length) continue
      const day = dateOnly(e.savedAt)
      if (!map.has(day)) map.set(day, [])
      map.get(day)!.push({ at: e.savedAt, changes })
    }
    return [...map.entries()]
  }, [entries, kind])

  const first = entries[0]?.summary
  const last = entries[entries.length - 1]?.summary

  return (
    <>
      <PageHeader
        icon={<History size={22} />}
        title="История"
        subtitle="Приложение сохраняет снимок персонажа каждый раз, когда оверлей обновляет данные, и записывает, что изменилось: заточки, новые вещи, уровни умений, узлы досок, питомцы."
      />
      {!loading && entries.length === 0 ? (
        <EmptyState title="История пока пустая">
          Первый снимок появится, как только приложение прочитает данные оверлея. Дальше — при каждом обновлении.
        </EmptyState>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Снимков"
              hint="Сколько раз приложение сохранило персонажа — каждый раз, когда оверлей обновлял данные."
              value={fmt(entries.length)}
              sub={first ? `с ${dateTime(entries[0].savedAt)}` : undefined}
            />
            <StatTile
              label="Рост БМ"
              hint="Боевая мощь сейчас против первого снимка."
              value={first && last ? `${last.combatPower - first.combatPower >= 0 ? '+' : ''}${compact(last.combatPower - first.combatPower)}` : '—'}
              sub={first ? `${compact(first.combatPower)} → ${compact(last!.combatPower)}` : undefined}
            />
            <StatTile
              label="Рост уровня снаряжения"
              hint="Уровень снаряжения сейчас против первого снимка."
              value={first && last ? `+${fmt(last.gearScore - first.gearScore)}` : '—'}
            />
            <StatTile
              label="Новых узлов досок"
              hint="Сколько узлов Даэваниона взято с первого снимка."
              value={first && last ? `+${fmt(last.daevanionNodes - first.daevanionNodes)}` : '—'}
            />
          </div>

          <Card
            title="Динамика"
            actions={
              <Segmented
                value={metric}
                onChange={setMetric}
                items={[
                  { id: 'combatPower', label: 'Боевая мощь' },
                  { id: 'gearScore', label: 'Уровень снаряжения' }
                ]}
              />
            }
          >
            {points.length < 2 ? (
              <p className="text-[13px] text-ink-3">Нужно хотя бы два снимка, чтобы построить график.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer>
                  <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                    <CartesianGrid stroke="var(--color-grid)" vertical={false} />
                    <XAxis
                      dataKey="t"
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      tickFormatter={(t) => dateOnly(Number(t))}
                      stroke="var(--color-axis)"
                      tick={{ fill: 'var(--color-ink-3)', fontSize: 11 }}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tickFormatter={(v) => compact(Number(v))}
                      stroke="var(--color-axis)"
                      tick={{ fill: 'var(--color-ink-3)', fontSize: 11 }}
                      width={56}
                    />
                    <ChartTooltip
                      contentStyle={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-line-strong)', borderRadius: 8, fontSize: 12 }}
                      labelFormatter={(t) => dateTime(Number(t))}
                      formatter={(v) => [fmt(Number(v)), metric === 'combatPower' ? 'Боевая мощь' : 'Уровень снаряжения']}
                    />
                    <Line type="monotone" dataKey={metric} stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 2, fill: 'var(--color-accent)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <div className="mt-6 mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold tracking-wide text-ink-2 uppercase">Лента изменений</h2>
            <Segmented
              value={kind}
              onChange={setKind}
              items={[
                { id: 'all', label: 'Всё' },
                { id: 'gear', label: 'Шмот и арканы' },
                { id: 'skills', label: 'Умения и доски' },
                { id: 'other', label: 'Прочее' }
              ]}
            />
          </div>
          <div className="space-y-4">
            {days.map(([day, list]) => (
              <Card key={day} title={day} bodyClassName="py-2">
                {list.map(({ at, changes }) => (
                  <div key={at} className="flex gap-4 border-b border-line py-2 last:border-b-0">
                    <span className="tnum w-12 shrink-0 pt-0.5 text-xs text-ink-3">
                      {new Date(at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <ul className="min-w-0 flex-1 space-y-1">
                      {changes.map((c, i) => {
                        const d = describeChange(c, namer)
                        return (
                          <li key={i} className="flex items-start gap-2 text-[13px]">
                            <span
                              className={cn(
                                'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                                d.good === true ? 'bg-good' : d.good === false ? 'bg-critical' : 'bg-ink-3'
                              )}
                            />
                            <span className="text-ink-2">{d.text}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </Card>
            ))}
            {days.length === 0 && <p className="text-[13px] text-ink-3">Изменений такого типа пока не было.</p>}
          </div>
        </>
      )}
    </>
  )
}
