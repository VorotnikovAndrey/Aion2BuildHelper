// Арт игры: иконки вещей, рамки грейдов, камни маны, карты аркан, эмблемы титулов, пантеон, классы.
// Список и официальные русские названия — в art.json (собраны вручную), файлы — в public/art (npm run art).
// Всё по игровым ID: если вещи нет в списке, интерфейс рисует аккуратную заглушку по слоту.

import type { ClassKey } from '../types'
import type { ArcanaType, ArcanaVariant } from './arcana'
import { gradeOfItem, type ItemGrade } from './slots'
import artJson from './art.json'

interface ArtJson {
  items: Record<string, { ru: string; icon: string; grade?: ItemGrade }>
  frames: Record<string, string>
  stones: Record<'plain' | 'manaMid' | 'manaHigh' | 'soulMid' | 'soulHigh', string>
  arcana: { frame: string; enchant: string; cards: string; tabs: string; types: string[]; sets: Record<ArcanaVariant, string> }
  titleEmblems: Record<TitleCategory, string>
  pantheonSlots: Record<PantheonKind, string>
  pantheon: Record<string, { ru: string; grade: ItemGrade; icon: string }>
  classes: Record<string, string>
  skillIcons: Record<string, string>
}

const ART = artJson as unknown as ArtJson

/** Путь к локальному файлу: то же правило, что в scripts/gamedata/fetch-art.mjs. */
export const artFile = (group: string, path: string): string => `./art/${group}/${path.split('/').pop()!.toLowerCase()}`

export interface ItemArt {
  /** Официальное русское название из клиента. */
  ru: string
  src: string
  grade: ItemGrade
}

/** Иконка и название вещи, если она есть в списке арта. */
export function itemArt(itemId: number): ItemArt | null {
  const a = ART.items[String(itemId)]
  if (!a) return null
  return { ru: a.ru, src: artFile('items', a.icon), grade: a.grade ?? gradeOfItem(itemId) }
}

/** Подложка иконки по грейду — как в инвентаре игры. */
export function frameArt(grade: ItemGrade): string {
  const path = ART.frames[grade] ?? ART.frames.common
  return artFile('frames', path)
}

// ───────────── Камни маны ─────────────

export type StoneQuality = 1 | 2 | 3

export interface StoneInfo {
  /** «Качественный камень маны» — как в игре. */
  ru: string
  quality: StoneQuality
  /** Камни маны — в оружие и броню; духовные — в украшения. */
  kind: 'mana' | 'soul'
  src: string
}

const QUALITY_RU: Record<StoneQuality, string> = { 1: 'Простой', 2: 'Средний', 3: 'Качественный' }

/**
 * Камень по ID: 5313600Q — камень маны (оружие, броня), 5335600Q — духовный камень (украшения).
 * Q: 1–2 простой, 3 средний, 4 качественный (сверено по окну вещи на странице билда Questlog).
 */
export function stoneInfo(stoneId: number): StoneInfo {
  const kind: StoneInfo['kind'] = Math.floor(stoneId / 100_000) === 5335 ? 'soul' : 'mana'
  const q = stoneId % 10
  const quality: StoneQuality = q >= 4 ? 3 : q === 3 ? 2 : 1
  const path =
    quality === 1
      ? ART.stones.plain
      : kind === 'soul'
        ? quality === 3
          ? ART.stones.soulHigh
          : ART.stones.soulMid
        : quality === 3
          ? ART.stones.manaHigh
          : ART.stones.manaMid
  return { ru: `${QUALITY_RU[quality]} ${kind === 'soul' ? 'духовный камень' : 'камень маны'}`, quality, kind, src: artFile('stones', path) }
}

// ───────────── Арканы ─────────────

const ARCANA_TYPE_ART: Record<ArcanaType, string> = { chalice: 'Grail', parchment: 'Parchment', compass: 'Compass', bell: 'Bell', mirror: 'Mirror' }

/** Арт карты: «магия» — синие карты (DefenceSet2), «жизнь» — золотые (PveSet2). Арт есть только у уникальных. */
export function arcanaCardArt(type: ArcanaType, variant: ArcanaVariant): string {
  return artFile('arcana', ART.arcana.cards.replace('{Type}', ARCANA_TYPE_ART[type]).replace('{Set}', ART.arcana.sets[variant]))
}
/** Белый значок типа карты (кубок, свиток, компас, колокол, зеркало). */
export const arcanaTypeArt = (type: ArcanaType): string => artFile('arcana', ART.arcana.tabs.replace('{Type}', ARCANA_TYPE_ART[type]))
/** Золотая рамка карты поверх арта. */
export const ARCANA_FRAME = artFile('arcana', ART.arcana.frame)

// ───────────── Титулы ─────────────

export type TitleCategory = 'attack' | 'defense' | 'utility'
export const titleEmblem = (category: TitleCategory): string => artFile('titles', ART.titleEmblems[category])

// ───────────── Пантеон ─────────────

export type PantheonKind = 'colossus' | 'statue' | 'painting'

/** Слоты пантеона: 1–12 — картины по кругу, 13–16 — статуи, 17 — колосс. */
export function pantheonKind(slot: number): PantheonKind {
  return slot >= 17 ? 'colossus' : slot >= 13 ? 'statue' : 'painting'
}
export const pantheonSlotArt = (kind: PantheonKind): string => artFile('pantheon', ART.pantheonSlots[kind])

export interface PantheonArt {
  ru: string
  grade: ItemGrade
  src: string
}
export function pantheonArt(deco: number): PantheonArt | null {
  const a = ART.pantheon[String(deco)]
  return a ? { ru: a.ru, grade: a.grade, src: artFile('pantheon', a.icon) } : null
}

// ───────────── Умения ─────────────

/**
 * Иконка умения: родной арт из public/icons/skills (npm run gamedata), а где metabot ошибается —
 * картинка игры из списка skillIcons (npm run art).
 */
export function skillIconSrc(skill: number): string {
  const fix = ART.skillIcons[String(skill)]
  return fix ? artFile('skills', fix) : `./icons/skills/${skill}.webp`
}

// ───────────── Классы ─────────────

export function classArt(cls: ClassKey | null | undefined): string | null {
  const path = cls ? ART.classes[cls] : undefined
  return path ? artFile('classes', path) : null
}

/** Все локальные файлы арта из списка — для проверки, что npm run art ничего не пропустил. */
export function allArtFiles(): string[] {
  const out = Object.values(ART.items).map((it) => artFile('items', it.icon))
  out.push(...Object.values(ART.frames).map((p) => artFile('frames', p)))
  out.push(...Object.values(ART.stones).map((p) => artFile('stones', p)))
  out.push(...Object.values(ART.titleEmblems).map((p) => artFile('titles', p)))
  out.push(...Object.values(ART.pantheonSlots).map((p) => artFile('pantheon', p)))
  out.push(...Object.values(ART.pantheon).map((it) => artFile('pantheon', it.icon)))
  out.push(...Object.values(ART.classes).map((p) => artFile('classes', p)))
  out.push(...Object.values(ART.skillIcons).map((p) => artFile('skills', p)))
  out.push(ARCANA_FRAME)
  for (const t of Object.keys(ARCANA_TYPE_ART) as ArcanaType[]) out.push(arcanaTypeArt(t), arcanaCardArt(t, 'magic'), arcanaCardArt(t, 'vigor'))
  return out
}
