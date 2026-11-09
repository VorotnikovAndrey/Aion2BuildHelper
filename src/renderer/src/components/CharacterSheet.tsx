// Панель «Показатели персонажа» как окно игры: шесть характеристик в центре, вокруг — эмблемы богов
// (по пять слева и справа, симметрично, сверху и снизу — перемычки), рядом — основные боевые показатели.
// Значки эмблем и характеристик — из окна игры (icons/deities, icons/attributes), цвет — из темы.

import type { CSSProperties } from 'react'
import type { TargetStatus } from '@shared/analysis/targets'
import { ATTRIBUTE_EFFECT, DEITIES, deityInfo } from '@shared/gamedata/deities'
import { formatStatValue, statByKey } from '@shared/gamedata/stats'
import type { Namer } from '@shared/names'
import { Tooltip } from '@/components/ui/InfoTip'
import { cn } from '@/lib/format'

/** icon — файл в icons/attributes (не «con.png»: CON — зарезервированное имя в Windows). */
const ATTRS: { key: string; icon: string; angle: number }[] = [
  { key: 'str', icon: 'might', angle: -90 },
  { key: 'dex', icon: 'agility', angle: -30 },
  { key: 'agi', icon: 'precision', angle: 30 },
  { key: 'wis', icon: 'will', angle: 90 },
  { key: 'int', icon: 'intellect', angle: 150 },
  { key: 'con', icon: 'health', angle: 210 }
]

/**
 * Эмблемы богов — как в окне игры: слева сверху вниз Неджакан, Байзел, Кайсинель, Юстиэль, Сиэль,
 * справа зеркально их пары — Джикел, Триниэль, Маркутан, Румиэль, Израфель. Угол — по часам: 11…7 и 1…5.
 */
const DEITY_RING: { key: string; angle: number }[] = [
  { key: 'justice', angle: -120 },
  { key: 'freedom', angle: -150 },
  { key: 'illusion', angle: 180 },
  { key: 'life', angle: 150 },
  { key: 'time', angle: 120 },
  { key: 'destruction', angle: -60 },
  { key: 'death', angle: -30 },
  { key: 'destiny', angle: 0 },
  { key: 'wisdom', angle: 30 },
  { key: 'space', angle: 60 }
]
/** Ариэль и Асфель — в окне игры их нет: показываем под кругом, только если стат есть. */
const EXTRA_DEITIES = ['light', 'dark']

/** Значок из игры, окрашенный цветом текста (маска): так он виден в любой теме. */
function GameIcon({ src, size, className }: { src: string; size: number; className?: string }) {
  const mask: CSSProperties = {
    width: size,
    height: size,
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center'
  }
  return <span aria-hidden className={cn('inline-block shrink-0 bg-current', className)} style={mask} />
}

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
  refs,
  size = 380
}: {
  values: Map<number, number>
  fromBoards: Map<number, number>
  namer: Namer
  /** Ориентиры «в среднем у топ-игроков» по ID стата. */
  refs?: Map<number, TargetStatus>
  size?: number
}) {
  const refText = (id: number) => {
    const r = refs?.get(id)
    if (!r) return ''
    return `В среднем у топ-игроков класса: ${r.target.goals[0].value.toLocaleString('ru-RU')} — у вас ${r.next ? 'ниже' : 'не ниже'}.`
  }
  /** Цвет числа или рамки по ориентиру: зелёный — не ниже среднего у топ-игроков класса, жёлтый — ниже. */
  const refTone = (id: number): 'ok' | 'warn' | null => {
    const r = refs?.get(id)
    return r ? (r.next ? 'warn' : 'ok') : null
  }

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
      <div className="shrink-0">
        <div className="relative" style={{ width: size, height: size }}>
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
            {/* Перемычки сверху и снизу кольца — как в окне игры */}
            {[-1, 1].map((dir) => (
              <g key={dir}>
                <rect
                  x={-7}
                  y={dir < 0 ? -97 : 56}
                  width={14}
                  height={41}
                  rx={3}
                  fill="var(--color-surface-3)"
                  stroke="var(--color-line-strong)"
                  strokeWidth={0.6}
                />
                <line x1={0} y1={dir * 60} x2={0} y2={dir * 93} stroke="var(--color-accent)" strokeOpacity={0.35} strokeWidth={0.6} />
              </g>
            ))}
            <circle r={4} fill="var(--color-aether)" opacity={0.9} />
            <circle r={9} fill="var(--color-aether)" opacity={0.15} />
          </svg>

          {ATTRS.map((a) => {
            const v = valueOf(a.key)
            const pos = at(0.17, a.angle)
            const label = v ? namer.stat(v.def.id).main : a.key
            return (
              <div key={a.key} className="absolute -translate-x-1/2 -translate-y-1/2" style={pos}>
                <Tooltip content={`${label}: ${ATTRIBUTE_EFFECT[a.key]}. У вас: ${v?.value ?? 0}. ${v ? refText(v.def.id) : ''}`}>
                  <div className="flex w-[78px] flex-col items-center text-center">
                    <GameIcon src={`./icons/attributes/${a.icon}.png`} size={24} className="text-ink-2" />
                    <span className="mt-0.5 text-[11.5px] leading-tight font-semibold text-aether">{label}</span>
                    <span
                      className={cn(
                        'tnum text-[12px]',
                        v && refTone(v.def.id) === 'warn' ? 'text-warning' : v && refTone(v.def.id) === 'ok' ? 'text-good' : 'text-ink'
                      )}
                    >
                      {v?.value ?? 0}
                    </span>
                  </div>
                </Tooltip>
              </div>
            )
          })}

          {DEITY_RING.map(({ key, angle }) => {
            const v = valueOf(key)
            if (!v) return null
            const { deity } = splitDeity(namer.stat(v.def.id).main)
            const pos = at(0.383, angle)
            const boards = fromBoards.get(v.def.id)
            const has = (v.value ?? 0) > 0
            const tone = refTone(v.def.id)
            return (
              <div key={key} className="absolute -translate-x-1/2 -translate-y-1/2" style={pos}>
                <Tooltip
                  content={
                    <>
                      <b className="text-ink">{namer.stat(v.def.id).main}</b>: {v.value ?? 0}
                      {deityInfo(key) && <span className="mt-1 block">{capital(deityInfo(key)!.effect)}.</span>}
                      {boards ? <span className="block text-ink-3">из них от досок Даэваниона: +{boards}</span> : null}
                      {refText(v.def.id) && <span className="block text-ink-3">{refText(v.def.id)}</span>}
                      <span className="mt-1 block text-ink-3">Стат бога{deity ? ` ${deity}` : ''}: растёт от досок Даэваниона, аркан и пантеона.</span>
                    </>
                  }
                >
                  <div className="relative flex h-[52px] w-[52px] items-center justify-center">
                    <GameIcon src={`./icons/deities/${key}.png`} size={50} className={has ? 'text-ink' : 'text-ink-3 opacity-50'} />
                    <span
                      className={cn(
                        'tnum absolute -right-2 -bottom-1 text-[14px] leading-none font-bold [text-shadow:0_1px_3px_var(--color-bg),0_0_2px_var(--color-bg)]',
                        !has ? 'text-ink-3' : tone === 'warn' ? 'text-warning' : tone === 'ok' ? 'text-good' : 'text-ink'
                      )}
                    >
                      {has ? v.value : '—'}
                    </span>
                  </div>
                </Tooltip>
              </div>
            )
          })}
        </div>

        {EXTRA_DEITIES.some((k) => (valueOf(k)?.value ?? 0) > 0) && (
          <div className="mt-2 flex justify-center gap-3 text-[12px] text-ink-3">
            {EXTRA_DEITIES.map((k) => {
              const v = valueOf(k)
              if (!v || !v.value) return null
              return (
                <span key={k}>
                  {namer.stat(v.def.id).main}: <b className="tnum text-ink">{v.value}</b>
                </span>
              )
            })}
          </div>
        )}
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
        <DeityLegend valueOf={valueOf} namer={namer} />
      </div>
    </div>
  )
}

const capital = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

/** Расшифровка статов богов: что даёт каждый — как в описании клиента, в порядке окна игры. */
function DeityLegend({ valueOf, namer }: { valueOf: (key: string) => { def: { id: number }; value?: number } | null; namer: Namer }) {
  return (
    <div className="mt-4 rounded-xl border border-line">
      <div className="border-b border-line px-3 py-2 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">Что дают статы богов</div>
      <div className="grid grid-cols-1 lg:grid-flow-col lg:grid-cols-2 lg:grid-rows-5">
        {DEITIES.map((d) => {
          const v = valueOf(d.key)
          if (!v) return null
          const aspect = namer.stat(v.def.id).main.replace(/^\[.+?\]\s*/, '')
          const has = (v.value ?? 0) > 0
          return (
            <div key={d.key} className="flex items-start gap-2.5 px-3 py-2">
              <GameIcon src={`./icons/deities/${d.key}.png`} size={26} className={cn('mt-0.5', has ? 'text-ink-2' : 'text-ink-3 opacity-50')} />
              <div className="min-w-0 flex-1 text-[12px] leading-snug">
                <div className="flex items-baseline justify-between gap-2">
                  <span>
                    <b className="text-ink">{aspect}</b> <span className="text-ink-3">· {d.god}</span>
                  </span>
                  <span className={cn('tnum font-semibold', has ? 'text-ink' : 'text-ink-3')}>{has ? v.value : '—'}</span>
                </div>
                <div className="text-ink-3">{capital(d.effect)}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
