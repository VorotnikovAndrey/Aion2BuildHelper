// Как называть игровые сущности в интерфейсе: официальными названиями на языке игры — русскими или английскими.
// Язык названий выбирает пользователь (NameMode); «как в интерфейсе» — русские при русском интерфейсе, иначе
// английские: других языков клиента в справочниках пока нет, а свой перевод официальных названий не делаем.
// Пользователь может переименовать что угодно — его названия важнее справочника.

import { arcanaInfo } from './gamedata/arcana'
import { itemArt } from './gamedata/art'
import { findNode, type DaevanionNode } from './gamedata/daevanion'
import { skillDef, skillSpecs } from './gamedata/skills'
import { slotDef } from './gamedata/slots'
import { formatStatValue, statByKey, statDef } from './gamedata/stats'
import { getLocale, t, type Locale } from './i18n'

/** local — как язык интерфейса (если у игры он есть), ru/en — всегда этот язык, both — как интерфейс + английское мелко. */
export type NameMode = 'local' | 'ru' | 'en' | 'both'
export const NAME_MODES: NameMode[] = ['local', 'ru', 'en', 'both']
export type GameLang = 'ru' | 'en'

/** Язык официальных названий при выбранном режиме и языке интерфейса. */
export function gameLangOf(mode: NameMode = 'both', ui: Locale = getLocale()): GameLang {
  if (mode === 'ru' || mode === 'en') return mode
  return ui === 'ru' ? 'ru' : 'en'
}

let active: GameLang = gameLangOf()

/** Язык игровых названий для term() и gameSkillName() — ставит интерфейс при загрузке и смене настроек. */
export function setGameNames(mode: NameMode): void {
  active = gameLangOf(mode)
}
export const activeGameLang = (): GameLang => active

/** Официальное название из справочника ({ ru, en }) на выбранном языке игровых названий. */
export function term(x: { ru?: string; en: string } | null | undefined, fallback = ''): string {
  if (!x) return fallback
  return active === 'ru' ? (x.ru ?? x.en) : x.en
}

/** Название из справочника с английским в скобках, если основное — русское: «Неджакан (Nezekan)». */
export function termWithEn(x: { ru?: string; en: string }): string {
  const main = term(x)
  return main !== x.en ? `${main} (${x.en})` : main
}

/** Есть только русское официальное название (украшения пантеона, вещи из art.json): при других языках — fallback. */
export function ruName(ru: string | undefined, fallback: string): string {
  return active === 'ru' && ru ? ru : fallback
}

/** Название умения на выбранном языке игровых названий (без своих названий пользователя). */
export function gameSkillName(id: number): string {
  const d = skillDef(id)
  return (active === 'ru' ? d?.ru : undefined) ?? d?.en ?? String(id)
}

export interface NameOverrides {
  skills?: Record<string, string>
  stats?: Record<string, string>
  items?: Record<string, string>
}

export interface Label {
  /** Основное название. */
  main: string
  /** Второе название мелким шрифтом (английское при режиме «оба»). */
  alt?: string
}

export interface Namer {
  mode: NameMode
  /** Язык официальных названий. */
  lang: GameLang
  skill(id: number): Label
  stat(id: number): Label
  /** Стат по ключу из данных Даэваниона («CombatSpeed»). */
  statKey(key: string): Label
  spec(skillId: number, n: number): Label
  /** Название предмета; slot нужен, чтобы назвать вещь без имени по слоту. */
  item(itemId: number, slot: number): Label
  board(id: number): Label
  /** Подпись узла Даэваниона: «Суд +1» или «Увелич. урона в PvE +1,5%». */
  node(node: DaevanionNode): string
  text(label: Label): string
}

export function createNamer(mode: NameMode, overrides: NameOverrides = {}): Namer {
  const lang = gameLangOf(mode)
  // Английское мелко — только в режиме «оба» и когда основное название не английское.
  const withEn = mode === 'both' && lang !== 'en'
  const pick = (ru: string | undefined, en: string, custom?: string): Label => {
    if (custom) return { main: custom, alt: withEn && custom !== en ? en : undefined }
    if (lang === 'en' || !ru) return { main: en }
    return { main: ru, alt: withEn && ru !== en ? en : undefined }
  }
  const namer: Namer = {
    mode,
    lang,
    skill(id) {
      const d = skillDef(id)
      return pick(d?.ru, d?.en ?? t('Умение {id}', { id }), overrides.skills?.[id])
    },
    stat(id) {
      const d = statDef(id)
      return pick(d?.ru, d?.en ?? t('Стат {id}', { id }), overrides.stats?.[id])
    },
    statKey(key) {
      const d = statByKey(key)
      return d ? namer.stat(d.id) : { main: key }
    },
    spec(skillId, n) {
      const s = skillSpecs(skillId).find((x) => x.n === n)
      return s ? pick(s.ru, s.en) : { main: t('Вариант {n}', { n }) }
    },
    item(itemId, slot) {
      const custom = overrides.items?.[itemId]
      const arc = arcanaInfo(itemId)
      if (arc) return pick(arc.ru, arc.en, custom)
      const s = slotDef(slot)
      // Официальное название из клиента, если вещь есть в списке арта; иначе — название слота.
      return pick(itemArt(itemId)?.ru ?? s.ru, s.en, custom)
    },
    board(id) {
      const b = findNode(id * 10000 + 113)?.board
      return b ? pick(b.ru, b.en) : { main: t('Доска {id}', { id }) }
    },
    node(node) {
      if (node.type === 'Start') return t('Старт')
      if (node.type === 'SkillLevel' && node.skill) return `${namer.skill(node.skill).main} +${node.levels ?? 1}`
      const parts = (node.stats ?? []).map((s) => {
        const def = statByKey(s.stat)
        return def ? `${namer.stat(def.id).main} ${formatStatValue(def.id, s.value, { sign: true })}` : node.label
      })
      return parts.length ? parts.join(', ') : node.label
    },
    text(label) {
      return label.alt ? `${label.main} (${label.alt})` : label.main
    }
  }
  return namer
}
