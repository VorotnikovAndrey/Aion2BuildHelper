// Как называть игровые сущности в интерфейсе: по-русски, по-английски или обоими названиями.
// Пользователь может переименовать что угодно — его названия важнее справочника.

import { arcanaInfo } from './gamedata/arcana'
import { findNode, type DaevanionNode } from './gamedata/daevanion'
import { skillDef, skillSpecs } from './gamedata/skills'
import { slotDef } from './gamedata/slots'
import { formatStatValue, statByKey, statDef } from './gamedata/stats'

export type NameMode = 'ru' | 'en' | 'both'

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
  const pick = (ru: string | undefined, en: string, custom?: string): Label => {
    if (custom) return { main: custom, alt: mode === 'both' && custom !== en ? en : undefined }
    if (mode === 'en' || !ru) return { main: en }
    if (mode === 'ru') return { main: ru }
    return { main: ru, alt: ru !== en ? en : undefined }
  }
  const namer: Namer = {
    mode,
    skill(id) {
      const d = skillDef(id)
      return pick(d?.ru, d?.en ?? `Умение ${id}`, overrides.skills?.[id])
    },
    stat(id) {
      const d = statDef(id)
      return pick(d?.ru, d?.en ?? `Стат ${id}`, overrides.stats?.[id])
    },
    statKey(key) {
      const d = statByKey(key)
      return d ? namer.stat(d.id) : { main: key }
    },
    spec(skillId, n) {
      const s = skillSpecs(skillId).find((x) => x.n === n)
      return s ? pick(s.ru, s.en) : { main: `Вариант ${n}` }
    },
    item(itemId, slot) {
      const custom = overrides.items?.[itemId]
      const arc = arcanaInfo(itemId)
      if (arc) return pick(arc.ru, arc.en, custom)
      const s = slotDef(slot)
      return pick(s.ru, s.en, custom)
    },
    board(id) {
      const b = findNode(id * 10000 + 113)?.board
      return b ? pick(b.ru, b.en) : { main: `Доска ${id}` }
    },
    node(node) {
      if (node.type === 'Start') return 'Старт'
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
