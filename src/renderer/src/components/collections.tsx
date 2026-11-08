// Титулы и пантеон в духе окон игры: карточки титулов с эмблемой и круг пантеона.

import type { TitleSlotReport } from '@shared/analysis/titles'
import { pantheonArt, pantheonKind, type PantheonKind } from '@shared/gamedata/art'
import { GRADES } from '@shared/gamedata/slots'
import { formatStatValue } from '@shared/gamedata/stats'
import type { TitleDef } from '@shared/gamedata/titles'
import type { Namer } from '@shared/names'
import { gradeColorVar, PantheonPiece, TitleEmblem } from '@/components/art'
import { Tooltip } from '@/components/ui/InfoTip'
import { cn } from '@/lib/format'

export const titleName = (t: TitleDef) => t.ru ?? t.en

function StatLines({ list, namer, className }: { list: [number, number][]; namer: Namer; className?: string }) {
  return (
    <div className={cn('space-y-0.5', className)}>
      {list.map(([stat, value]) => (
        <div key={stat} className="flex items-baseline justify-between gap-3 text-[12.5px]">
          <span className="text-ink-2">{namer.stat(stat).main}</span>
          <span className="tnum font-semibold text-aether">{formatStatValue(stat, value)}</span>
        </div>
      ))}
    </div>
  )
}

/** Карточка надетого титула — как в окне «Титулы»: эмблема, название цветом грейда, бонусы. */
export function TitleCard({ slot, namer }: { slot: TitleSlotReport; namer: Namer }) {
  const t = slot.equipped
  if (!t) {
    return (
      <Tooltip block wide content={`Титул категории «${slot.ru}» не надет. Надеть можно по одному титулу каждой категории — бонус работает, пока титул надет.`}>
        <div className="flex h-full w-full items-center gap-4 rounded-xl border border-dashed border-line-strong bg-surface-2/40 p-4">
          <span className="text-[13px] text-ink-3">{slot.ru}: титул не надет</span>
        </div>
      </Tooltip>
    )
  }
  return (
    <div className="flex h-full w-full flex-col rounded-xl border border-line bg-gradient-to-br from-surface-3/60 via-surface-2 to-surface p-4">
      <div className="flex items-start gap-3">
        <TitleEmblem category={t.category} grade={t.grade} size={58} className="-mt-1 -ml-1" />
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase">{slot.ru}</div>
          <Tooltip
            content={`${GRADES[t.grade].ru} титул${t.source && t.source !== '—' ? `. Где взять: ${t.source}` : ''}${t.ru ? '' : '. Русского названия пока нет — показано английское.'}`}
          >
            <div className="mt-0.5 text-[15px] leading-snug font-bold" style={{ color: gradeColorVar(t.grade) }}>
              {titleName(t)}
            </div>
          </Tooltip>
        </div>
      </div>
      <Tooltip block content="Бонус, пока титул надет.">
        <StatLines list={t.equip} namer={namer} className="mt-3 w-full" />
      </Tooltip>
      {t.collection.length > 0 && (
        <Tooltip block content="«Эффект при наличии»: работает, даже если титул просто лежит в коллекции.">
          <div className="mt-2.5 w-full rounded-md bg-bg/50 px-2 py-1">
            <StatLines list={t.collection} namer={namer} />
          </div>
        </Tooltip>
      )}
      <div className="flex-1" />
      {slot.better && (
        <Tooltip
          block
          wide
          content={
            <>
              <b className="text-ink">{titleName(slot.better.title)}</b> уже есть в коллекции, и по приоритетам гайда его бонусы, похоже, полезнее:{' '}
              {slot.better.title.equip.map(([s, v]) => `${namer.stat(s).main} ${formatStatValue(s, v)}`).join(', ')}.
              <span className="mt-1 block text-ink-3">Оценка помощника: сравнивается важность статов по гайду, а не точные величины.</span>
            </>
          }
        >
          <div className="mt-3 flex w-full items-center gap-2 rounded-lg border border-warning/35 bg-warning-soft px-2.5 py-1.5 text-[12px] text-warning">
            <TitleEmblem category={slot.better.title.category} grade={slot.better.title.grade} size={20} />
            <span className="min-w-0">
              Есть полезнее: <b>{titleName(slot.better.title)}</b>
            </span>
          </div>
        </Tooltip>
      )}
    </div>
  )
}

// ───────────── Пантеон ─────────────

/**
 * Где стоит слот на круге (в единицах окна игры: центр 0,0, радиус круга картин ≈ 300).
 * Картины 1–6 — справа сверху вниз, 7–12 — слева снизу вверх; статуи 13–16 — против часовой с левой верхней.
 */
const SPOT: Record<number, [number, number]> = {
  1: [175, -235],
  2: [235, -175],
  3: [292, -40],
  4: [292, 40],
  5: [235, 175],
  6: [175, 235],
  7: [-175, 235],
  8: [-235, 175],
  9: [-292, 40],
  10: [-292, -40],
  11: [-235, -175],
  12: [-175, -235],
  13: [-112, -112],
  14: [-112, 112],
  15: [112, 112],
  16: [112, -112],
  17: [0, 0]
}
const HALF = 345
const PIECE_SIZE: Record<PantheonKind, number> = { painting: 0.15, statue: 0.2, colossus: 0.27 }
const KIND_RU: Record<PantheonKind, string> = { painting: 'картина', statue: 'статуя', colossus: 'колосс' }

/** Круг пантеона, как в игре: колосс в центре, четыре статуи, двенадцать картин по кругу. */
export function PantheonBoard({ placed, size = 380 }: { placed: Map<number, number>; size?: number }) {
  const at = (v: number) => size / 2 + (v / HALF) * (size / 2)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="-100 -100 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
        <g fill="none" stroke="var(--color-accent)" strokeOpacity={0.16}>
          <circle r={86} strokeWidth={0.6} />
          <circle r={90} strokeWidth={0.3} strokeDasharray="1 2" />
          <circle r={46} strokeWidth={0.5} />
          <circle r={20} strokeWidth={0.8} strokeOpacity={0.3} />
          <path d="M0 -86 L74.5 43 L-74.5 43 Z M0 86 L74.5 -43 L-74.5 -43 Z" strokeWidth={0.35} />
          <path d="M-32 -32 L32 -32 L32 32 L-32 32 Z" strokeWidth={0.35} strokeOpacity={0.24} />
        </g>
        <circle r={30} fill="var(--color-accent)" fillOpacity={0.04} />
      </svg>
      {Object.entries(SPOT).map(([key, [x, y]]) => {
        const slot = Number(key)
        const kind = pantheonKind(slot)
        const deco = placed.get(slot)
        const art = deco ? pantheonArt(deco) : null
        const px = size * PIECE_SIZE[kind]
        return (
          <div key={slot} className="absolute -translate-x-1/2 -translate-y-1/2 leading-none" style={{ left: at(x), top: at(y) }}>
            <Tooltip
              content={
                deco ? (
                  <>
                    <b style={{ color: art ? gradeColorVar(art.grade) : undefined }}>{art?.ru ?? `Украшение #${deco}`}</b>
                    <span className="block text-ink-3">
                      {KIND_RU[kind]}
                      {art ? ` · ${GRADES[art.grade].ru.toLowerCase()}` : ''}
                    </span>
                    <span className="mt-1 block">Даёт статы богов — их сумма видна в игре в «Эффектах размещения».</span>
                  </>
                ) : (
                  `Свободное место: ${KIND_RU[kind]}. Поставьте сюда украшение из шкафа — оно добавит статы богов.`
                )
              }
            >
              <PantheonPiece slot={slot} deco={deco} size={px} />
            </Tooltip>
          </div>
        )
      })}
    </div>
  )
}
