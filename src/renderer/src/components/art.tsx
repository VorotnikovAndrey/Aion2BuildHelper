// Арт игры в интерфейсе: ячейки предметов как в инвентаре, камни, карты аркан, эмблемы титулов, пантеон.
// Пути и названия — в shared/gamedata/art.ts; если картинки нет, рисуется аккуратная заглушка.

import { useState, type ReactNode } from 'react'
import { CircleDot, Crown, Ear, Footprints, Gem, Hand, HardHat, Hexagon, Shield, Shirt, Sword, Watch, Wind, type LucideIcon } from 'lucide-react'
import {
  ARCANA_FRAME,
  arcanaCardArt,
  arcanaTypeArt,
  frameArt,
  itemArt,
  pantheonArt,
  pantheonKind,
  pantheonSlotArt,
  stoneInfo,
  titleEmblem,
  type TitleCategory
} from '@shared/gamedata/art'
import type { ArcanaType, ArcanaVariant } from '@shared/gamedata/arcana'
import { gradeOfItem, slotDef, type ItemGrade } from '@shared/gamedata/slots'
import { cn } from '@/lib/format'
import type { Tone } from '@/lib/status'
import { StatusBadge } from './StatusBadge'
import { hash01 } from './fx'

const SLOT_GLYPH: Record<string, LucideIcon> = {
  weapon: Sword,
  guarder: Shield,
  helmet: HardHat,
  shoulder: Crown,
  torso: Shirt,
  pants: Shirt,
  gloves: Hand,
  boots: Footprints,
  cape: Wind,
  necklace: Gem,
  pendant: Gem,
  amulet: Gem,
  belt: Hexagon
}

/** Значок слота — для заглушки, когда арта вещи нет. */
export function slotGlyph(slot: number): LucideIcon {
  const key = slotDef(slot).key
  if (SLOT_GLYPH[key]) return SLOT_GLYPH[key]
  if (key.endsWith('Earring')) return Ear
  if (key.endsWith('Ring')) return CircleDot
  if (key.endsWith('Bracelet')) return Watch
  return Hexagon
}

/** Ячейка как в инвентаре: подложка грейда, арт, тонкая рамка и тень. */
export function GameSlot({
  grade,
  src,
  size = 48,
  fallback,
  dim,
  className,
  children
}: {
  grade: ItemGrade
  src?: string | null
  size?: number
  fallback?: ReactNode
  dim?: boolean
  className?: string
  children?: ReactNode
}) {
  const [broken, setBroken] = useState(false)
  return (
    <span className={cn('game-slot inline-block shrink-0', dim && 'opacity-45 grayscale', className)} style={{ width: size, height: size }}>
      <img src={frameArt(grade)} alt="" draggable={false} className="absolute inset-0 h-full w-full" />
      {src && !broken ? (
        <img src={src} alt="" draggable={false} onError={() => setBroken(true)} className="absolute inset-0 h-full w-full object-contain" />
      ) : (
        fallback && <span className="absolute inset-0 flex items-center justify-center text-ink/70">{fallback}</span>
      )}
      {SHINY.has(grade) && <span className="fx-shine" style={{ ['--shine-delay' as string]: `${(hash01(src ?? grade) * 7).toFixed(2)}s` }} />}
      {children}
    </span>
  )
}

/** У каких грейдов по иконке пробегает блеск. */
const SHINY = new Set<ItemGrade>(['mythic', 'epic', 'unique', 'legend'])

// Значок статуса нарисован в Figma — см. StatusBadge.tsx.
export { StatusBadge }

/** Иконка надетой вещи: арт из игры (или значок слота), рамка грейда, заточка «+14». */
export function ItemIcon({
  itemId,
  slot,
  enchant,
  size = 48,
  status,
  dim,
  className
}: {
  itemId: number
  slot: number
  enchant?: number
  size?: number
  /** Итог сверки с гайдом — значок в углу. */
  status?: Tone
  dim?: boolean
  className?: string
}) {
  const art = itemArt(itemId)
  const Glyph = slotGlyph(slot)
  return (
    <GameSlot
      grade={art?.grade ?? gradeOfItem(itemId)}
      src={art?.src}
      size={size}
      dim={dim}
      className={className}
      fallback={<Glyph size={Math.round(size * 0.45)} strokeWidth={1.4} />}
    >
      {enchant ? (
        <span className="game-num tnum absolute right-[6%] bottom-[2%] leading-none" style={{ fontSize: Math.max(10, Math.round(size * 0.24)) }}>
          +{enchant}
        </span>
      ) : null}
      {status && <StatusBadge tone={status} size={Math.max(13, Math.round(size * 0.3))} className="absolute top-[4%] right-[4%]" />}
    </GameSlot>
  )
}

const STONE_GRADE: Record<1 | 2 | 3, ItemGrade> = { 1: 'common', 2: 'rare', 3: 'legend' }

/** Камень маны или духовный камень: качество — цветом подложки, как в инвентаре. */
export function StoneIcon({ stoneId, size = 22, className }: { stoneId: number; size?: number; className?: string }) {
  const info = stoneInfo(stoneId)
  return <GameSlot grade={STONE_GRADE[info.quality]} src={info.src} size={size} className={cn('rounded-[4px]', className)} />
}

/** Карта арканы: родной арт в золотой рамке, внизу — заточка на круглой плашке. */
export function ArcanaCardArt({
  type,
  variant,
  enchant,
  empty,
  className
}: {
  type: ArcanaType
  variant?: ArcanaVariant
  enchant?: number
  empty?: boolean
  className?: string
}) {
  const [broken, setBroken] = useState(false)
  const showArt = !empty && variant && !broken
  return (
    <div className={cn('relative aspect-[336/512] w-full', className)}>
      <div className="absolute inset-[3.5%_4%] overflow-hidden rounded-[5%] bg-surface-2">
        {showArt ? (
          <img
            src={arcanaCardArt(type, variant)}
            alt=""
            draggable={false}
            onError={() => setBroken(true)}
            className="h-full w-full scale-[1.02] object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <img src={arcanaTypeArt(type)} alt="" draggable={false} className="w-1/2 opacity-25" />
          </div>
        )}
        {/* Затемнение снизу — чтобы плашка заточки читалась на светлом арте */}
        {showArt && <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg/85 to-transparent" />}
      </div>
      <img src={ARCANA_FRAME} alt="" draggable={false} className="absolute inset-0 h-full w-full" />
      {!empty && enchant !== undefined && (
        <span className="game-enchant tnum absolute bottom-[5%] left-1/2 flex aspect-square w-[30%] -translate-x-1/2 items-center justify-center">
          <span className="game-num relative" style={{ fontSize: 'clamp(11px, 1.15em, 22px)' }}>
            +{enchant}
          </span>
        </span>
      )}
    </div>
  )
}

/** Белый значок типа арканы (кубок, свиток, компас, колокол, зеркало). */
export function ArcanaTypeIcon({ type, size = 18, className }: { type: ArcanaType; size?: number; className?: string }) {
  return (
    <img
      src={arcanaTypeArt(type)}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={cn('shrink-0', className)}
      style={{ width: size, height: size }}
    />
  )
}

const GRADE_GLOW: Record<ItemGrade, string> = {
  mythic: 'var(--color-grade-mythic)',
  epic: 'var(--color-grade-epic)',
  unique: 'var(--color-grade-unique)',
  legend: 'var(--color-grade-legend)',
  rare: 'var(--color-grade-rare)',
  common: 'var(--color-grade-common)',
  special: 'var(--color-grade-special)',
  unknown: 'var(--color-ink-3)'
}

/** Эмблема категории титула (меч — атака, щит — защита, звезда — другое) со свечением цвета грейда. */
export function TitleEmblem({
  category,
  grade,
  size = 56,
  dim,
  className
}: {
  category: TitleCategory
  grade: ItemGrade
  size?: number
  dim?: boolean
  className?: string
}) {
  return (
    <img
      src={titleEmblem(category)}
      alt=""
      draggable={false}
      className={cn('shrink-0', dim && 'opacity-30 grayscale', className)}
      style={{
        width: size,
        height: size,
        filter: dim ? undefined : `drop-shadow(0 0 ${Math.round(size / 7)}px color-mix(in srgb, ${GRADE_GLOW[grade]} 55%, transparent))`
      }}
    />
  )
}

export const gradeColorVar = (grade: ItemGrade) => GRADE_GLOW[grade]

/** Украшение пантеона в своей рамке: картина — круг, статуя — шестиугольник, колосс — ромб. */
export function PantheonPiece({ slot, deco, size }: { slot: number; deco?: number; size: number }) {
  const kind = pantheonKind(slot)
  const art = deco ? pantheonArt(deco) : null
  const inner = kind === 'colossus' ? 0.72 : kind === 'statue' ? 0.72 : 0.7
  return (
    <span className="relative inline-block" style={{ width: size, height: size }}>
      <img src={pantheonSlotArt(kind)} alt="" draggable={false} className={cn('absolute inset-0 h-full w-full', !deco && 'opacity-60')} />
      {art && (
        <img
          src={art.src}
          alt=""
          draggable={false}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
          style={{ width: size * inner, height: size * inner, filter: `drop-shadow(0 0 6px color-mix(in srgb, ${GRADE_GLOW[art.grade]} 45%, transparent))` }}
        />
      )}
      {deco && !art && <span className="absolute inset-0 flex items-center justify-center text-[11px] text-ink-3">#{deco}</span>}
    </span>
  )
}
