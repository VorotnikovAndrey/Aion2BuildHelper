// Титулы и пантеон в духе окон игры: карточки титулов с эмблемой и круг пантеона.

import type { TitleSlotReport } from '@shared/analysis/titles'
import { pantheonArt, pantheonKind, type PantheonKind } from '@shared/gamedata/art'
import { GRADES } from '@shared/gamedata/slots'
import { formatStatValue } from '@shared/gamedata/stats'
import { TRACK_RU, type TitleDef } from '@shared/gamedata/titles'
import type { Namer } from '@shared/names'
import { gradeColorVar, PantheonPiece, TitleEmblem } from '@/components/art'
import { Tooltip } from '@/components/ui/InfoTip'
import { cn } from '@/lib/format'
import { lowerInSentence, t } from '@shared/i18n'
import { activeGameLang, ruName, term } from '@shared/names'

export const titleName = (ttl: TitleDef) => term(ttl)

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
  const ttl = slot.equipped
  if (!ttl) {
    return (
      <Tooltip
        block
        wide
        content={t('Титул категории «{slot}» не надет. Надеть можно по одному титулу каждой категории — бонус работает, пока титул надет.', { slot: slot.ru })}
      >
        <div className="flex h-full w-full items-center gap-4 rounded-xl border border-dashed border-line-strong bg-surface-2/40 p-4">
          <span className="text-[13px] text-ink-3">{t('{slot}: титул не надет', { slot: slot.ru })}</span>
        </div>
      </Tooltip>
    )
  }
  return (
    <div className="flex h-full w-full flex-col rounded-xl border border-line bg-gradient-to-br from-surface-3/60 via-surface-2 to-surface p-4">
      <div className="flex items-start gap-3">
        <TitleEmblem category={ttl.category} grade={ttl.grade} size={58} className="-mt-1 -ml-1" />
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase">{slot.ru}</div>
          <Tooltip
            content={t('{GRADES} титул{p}{p2}', {
              GRADES: term(GRADES[ttl.grade]),
              p: ttl.source && ttl.source !== '—' ? t('. Где взять: {source}', { source: ttl.source }) : '',
              p2: ttl.ru || activeGameLang() !== 'ru' ? '' : t('. Русского названия пока нет — показано английское.')
            })}
          >
            <div className="mt-0.5 text-[15px] leading-snug font-bold" style={{ color: gradeColorVar(ttl.grade) }}>
              {titleName(ttl)}
            </div>
          </Tooltip>
        </div>
      </div>
      <Tooltip block content={t('Бонус, пока титул надет.')}>
        <StatLines list={ttl.equip} namer={namer} className="mt-3 w-full" />
      </Tooltip>
      {ttl.collection.length > 0 && (
        <Tooltip block content={t('«Эффект при наличии»: работает, даже если титул просто лежит в коллекции.')}>
          <div className="mt-2.5 w-full rounded-md bg-bg/50 px-2 py-1">
            <StatLines list={ttl.collection} namer={namer} />
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
              <b className="text-ink">{titleName(slot.better.title)}</b> {t('уже есть в коллекции.')}
              {slot.better.reason === 'guide' ? t('Гайд ставит его выше надетого.') : t('По приоритетам гайда его бонусы, похоже, полезнее.')}{' '}
              {t('Даёт: {statText}.', { statText: statText(slot.better.title.equip, namer) })}
              {slot.better.reason === 'score' && (
                <span className="mt-1 block text-ink-3">{t('Оценка помощника: важность статов по гайду с учётом величины бонуса.')}</span>
              )}
            </>
          }
        >
          <div className="mt-3 flex w-full items-center gap-2 rounded-lg border border-warning/35 bg-warning-soft px-2.5 py-1.5 text-[12px] text-warning">
            <TitleEmblem category={slot.better.title.category} grade={slot.better.title.grade} size={20} />
            <span className="min-w-0">
              {slot.better.reason === 'guide' ? t('Гайд советует надеть') : t('Есть полезнее')}: <b>{titleName(slot.better.title)}</b>
            </span>
          </div>
        </Tooltip>
      )}
      {slot.goal && <TitleGoal slot={slot} namer={namer} />}
    </div>
  )
}

/** Цель-титул: что даёт, как получить и сколько уже набрано. */
function TitleGoal({ slot, namer }: { slot: TitleSlotReport; namer: Namer }) {
  const goal = slot.goal!
  const how = slot.goalHow
  const p = how?.progress
  const done = p && p.current >= p.goal
  return (
    <div className="mt-2 w-full rounded-lg border border-aether/30 bg-aether-soft px-2.5 py-2 text-[12px]">
      <Tooltip
        block
        wide
        content={
          <>
            <b className="text-ink">{titleName(goal)}</b>{' '}
            {t('— лучший титул этой категории по гайду, его пока нет в коллекции. Даёт: {statText}.', { statText: statText(goal.equip, namer) })}
            {goal.collection.length > 0 && (
              <span className="mt-1 block text-ink-3">{t('При наличии: {statText}.', { statText: statText(goal.collection, namer) })}</span>
            )}
          </>
        }
      >
        <div className="flex w-full items-center gap-2 text-aether">
          <TitleEmblem category={goal.category} grade={goal.grade} size={20} dim />
          <span className="min-w-0">
            {t('Цель:')} <b>{titleName(goal)}</b> {t('— ещё не получен')}
          </span>
        </div>
      </Tooltip>
      <div className="mt-1.5 text-[11.5px] leading-relaxed text-ink-2">{t('Даёт: {statText}.', { statText: statText(goal.equip, namer) })}</div>
      {how && <div className="mt-1 text-[11.5px] leading-relaxed text-ink-2">{how.ru}</div>}
      {p && how?.track && (
        <Tooltip block content={t('{TRACK_RU}: {current} из {goal}.', { TRACK_RU: TRACK_RU[how.track], current: p.current, goal: p.goal })}>
          <div className="mt-1.5 flex w-full items-center gap-2 text-[11px]">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg/60">
              <span
                className={cn('block h-full rounded-full', done ? 'bg-good' : 'bg-aether')}
                style={{ width: `${Math.min(100, (p.current / p.goal) * 100)}%` }}
              />
            </span>
            <span className={cn('tnum shrink-0 font-semibold', done ? 'text-good' : 'text-aether')}>
              {p.current} / {p.goal}
            </span>
          </div>
        </Tooltip>
      )}
    </div>
  )
}

const statText = (list: [number, number][], namer: Namer) => list.map(([s, v]) => `${namer.stat(s).main} ${formatStatValue(s, v)}`).join(', ')

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
const KIND_RU: Record<PantheonKind, string> = { painting: t('картина'), statue: t('статуя'), colossus: t('колосс') }

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
                    <b style={{ color: art ? gradeColorVar(art.grade) : undefined }}>
                      {art ? ruName(art.ru, t('Украшение пантеона')) : t('Украшение #{deco}', { deco })}
                    </b>
                    <span className="block text-ink-3">
                      {KIND_RU[kind]}
                      {art ? ` · ${lowerInSentence(term(GRADES[art.grade]))}` : ''}
                    </span>
                    <span className="mt-1 block">{t('Даёт статы богов — их сумма видна в игре в «Эффектах размещения».')}</span>
                  </>
                ) : (
                  t('Свободное место: {KIND_RU}. Поставьте сюда украшение из шкафа — оно добавит статы богов.', { KIND_RU: KIND_RU[kind] })
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
