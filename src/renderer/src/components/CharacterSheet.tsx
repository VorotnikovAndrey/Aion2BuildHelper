// Панель «Показатели персонажа» в духе окна игры: шесть характеристик в центре, кольцо статов богов,
// снизу — основные боевые показатели.

import { BicepsFlexed, BookOpen, Eye, Feather, Heart, Sparkles, type LucideIcon } from 'lucide-react'
import { formatStatValue, statByKey } from '@shared/gamedata/stats'
import type { Namer } from '@shared/names'
import { Tooltip } from '@/components/ui/InfoTip'
import { cn } from '@/lib/format'

const ATTRS: { key: string; icon: LucideIcon; angle: number; tip: string }[] = [
  { key: 'str', icon: BicepsFlexed, angle: -90, tip: 'Мощь: увеличивает атаку.' },
  { key: 'dex', icon: Feather, angle: -30, tip: 'Ловкость: увеличивает крит. удар и уклонение.' },
  { key: 'agi', icon: Eye, angle: 30, tip: 'Точность: увеличивает меткость.' },
  { key: 'wis', icon: Sparkles, angle: 90, tip: 'Воля: увеличивает сопротивление негативным эффектам.' },
  { key: 'int', icon: BookOpen, angle: 150, tip: 'Интеллект: увеличивает силу магии и исцеления.' },
  { key: 'con', icon: Heart, angle: 210, tip: 'Здоровье: увеличивает ОЗ.' }
]

/** Статы богов по кругу: сначала боги досок Даэваниона, затем остальные. */
const DEITIES = ['justice', 'destruction', 'freedom', 'death', 'light', 'dark', 'space', 'destiny', 'time', 'life', 'wisdom', 'illusion']

const COMBAT: string[][] = [
  ['weaponfixingdamage', 'armordefense'],
  ['fixingdamage', 'defense'],
  ['weaponaccuracy', 'armorevasion'],
  ['accuracy', 'evasion'],
  ['critical', 'criticalresist'],
  ['hpmax', 'mpmax'],
  ['combatspeed', 'movespeed']
]

const splitDeity = (name: string): { deity?: string; aspect: string } => {
  const m = name.match(/^\[(.+?)\]\s*(.+)$/)
  return m ? { deity: m[1], aspect: m[2] } : { aspect: name }
}

export function CharacterSheet({
  values,
  fromBoards,
  namer,
  size = 380
}: {
  values: Map<number, number>
  fromBoards: Map<number, number>
  namer: Namer
  size?: number
}) {
  const at = (r: number, angle: number) => {
    const rad = (angle * Math.PI) / 180
    return { left: size / 2 + Math.cos(rad) * r * size, top: size / 2 + Math.sin(rad) * r * size }
  }
  const valueOf = (key: string) => {
    const def = statByKey(key)
    return def ? { def, value: values.get(def.id) } : null
  }

  return (
    <div className="flex flex-wrap items-start gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="-100 -100 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <radialGradient id="sheet-bg">
              <stop offset="0%" stopColor="var(--color-surface-3)" />
              <stop offset="100%" stopColor="var(--color-surface)" />
            </radialGradient>
          </defs>
          <circle r={97} fill="url(#sheet-bg)" stroke="var(--color-line-strong)" strokeWidth={0.8} />
          <circle r={70} fill="none" stroke="var(--color-accent)" strokeOpacity={0.22} strokeWidth={0.6} />
          <circle r={56} fill="var(--color-bg)" fillOpacity={0.35} stroke="var(--color-line-strong)" strokeWidth={0.6} />
          {Array.from({ length: 60 }, (_, i) => {
            const a = (i * 6 * Math.PI) / 180
            return (
              <line
                key={i}
                x1={Math.cos(a) * 93}
                y1={Math.sin(a) * 93}
                x2={Math.cos(a) * (i % 5 ? 95 : 97)}
                y2={Math.sin(a) * (i % 5 ? 95 : 97)}
                stroke="var(--color-accent)"
                strokeOpacity={0.25}
                strokeWidth={0.5}
              />
            )
          })}
          {[0, 60, 120].map((d) => (
            <line
              key={d}
              x1={Math.cos((d * Math.PI) / 180) * 56}
              y1={Math.sin((d * Math.PI) / 180) * 56}
              x2={-Math.cos((d * Math.PI) / 180) * 56}
              y2={-Math.sin((d * Math.PI) / 180) * 56}
              stroke="var(--color-line-strong)"
              strokeWidth={0.4}
            />
          ))}
          <circle r={4} fill="var(--color-aether)" opacity={0.9} />
          <circle r={9} fill="var(--color-aether)" opacity={0.15} />
        </svg>

        {ATTRS.map((a) => {
          const v = valueOf(a.key)
          const pos = at(0.17, a.angle)
          const Icon = a.icon
          const label = v ? namer.stat(v.def.id).main : a.key
          return (
            <div key={a.key} className="absolute -translate-x-1/2 -translate-y-1/2" style={pos}>
              <Tooltip content={`${a.tip} У вас: ${v?.value ?? 0}.`}>
                <div className="flex w-[78px] flex-col items-center text-center">
                  <Icon size={18} strokeWidth={1.6} className="text-ink-2" />
                  <span className="mt-0.5 text-[11.5px] leading-tight font-semibold text-aether">{label}</span>
                  <span className="tnum text-[12px] text-ink">{v?.value ?? 0}</span>
                </div>
              </Tooltip>
            </div>
          )
        })}

        {DEITIES.map((key, i) => {
          const v = valueOf(key)
          if (!v) return null
          const { deity, aspect } = splitDeity(namer.stat(v.def.id).main)
          const pos = at(0.4, -90 + i * 30)
          const boards = fromBoards.get(v.def.id)
          const has = (v.value ?? 0) > 0
          return (
            <div key={key} className="absolute -translate-x-1/2 -translate-y-1/2" style={pos}>
              <Tooltip
                content={
                  <>
                    <b className="text-ink">{namer.stat(v.def.id).main}</b>: {v.value ?? 0}
                    {boards ? <span className="block text-ink-3">из них от досок Даэваниона: +{boards}</span> : null}
                    <span className="mt-1 block text-ink-3">Стат бога{deity ? ` ${deity}` : ''}: растёт от досок Даэваниона, аркан и пантеона.</span>
                  </>
                }
              >
                <div
                  className={cn(
                    'flex h-[52px] w-[52px] flex-col items-center justify-center rounded-full border text-center',
                    has ? 'border-accent/45 bg-surface-2 shadow-[0_0_14px_-4px_var(--color-accent)]' : 'border-line bg-surface-2/60'
                  )}
                >
                  <span className={cn('tnum text-[15px] leading-none font-bold', has ? 'text-accent-2' : 'text-ink-3')}>{has ? v.value : '—'}</span>
                  <span className="mt-0.5 max-w-[48px] truncate text-[8.5px] leading-none text-ink-3">{deity ?? aspect}</span>
                </div>
              </Tooltip>
            </div>
          )
        })}
      </div>

      <div className="min-w-[280px] flex-1">
        <div className="overflow-hidden rounded-xl border border-line">
          {COMBAT.map((row, i) => (
            <div key={i} className={cn('grid grid-cols-2', i % 2 ? 'bg-surface-2/40' : 'bg-surface-2')}>
              {row.map((key, j) => {
                const v = valueOf(key)
                return (
                  <Tooltip
                    key={key}
                    block
                    content={
                      v
                        ? `${namer.stat(v.def.id).main}: ${v.value === undefined ? 'оверлей это значение не отдаёт' : formatStatValue(v.def.id, v.value)}.`
                        : null
                    }
                  >
                    <div className={cn('flex w-full items-center justify-between gap-3 px-3 py-2 text-[13px]', j === 0 && 'border-r border-line')}>
                      <span className="truncate text-ink-2">{v ? namer.stat(v.def.id).main : key}</span>
                      <span className="tnum font-semibold text-ink">{v && v.value !== undefined ? formatStatValue(v.def.id, v.value) : '—'}</span>
                    </div>
                  </Tooltip>
                )
              })}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-3">
          Значения — как их отдаёт оверлей, по слагаемым: «АТК» и «Доп. АТК» отдельно. Итоговые АТК и ЗЩТ в окне игры считаются с множителями, поэтому там числа
          больше. Характеристики и статы богов совпадают с игрой.
        </p>
      </div>
    </div>
  )
}
