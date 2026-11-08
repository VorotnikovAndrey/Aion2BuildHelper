// Модель персонажа, с которой работает всё приложение.
// Источник — файл оверлея Questlog (src/shared/questlog/parse.ts приводит его к этому виду).
// Все игровые сущности хранятся по числовым ID игры; названия берутся из справочников (src/shared/gamedata).

export type ClassKey = 'gladiator' | 'templar' | 'assassin' | 'ranger' | 'sorcerer' | 'spiritmaster' | 'cleric' | 'chanter'

export interface StatValue {
  /** ID стата игры (см. gamedata/stats.ts). */
  stat: number
  /** Сырое значение. Для процентных статов — сотые доли процента (1355 = 13,55%). */
  value: number
}

export interface GearSkill {
  skill: number
  level: number
}

export interface Manastone {
  stone: number
  stat: number
  /** Грейд строки манакамня (1–3 у текущих камней). */
  grade: number
}

export interface GearItem {
  /** Номер слота игры (1 — оружие, 41–45 — арканы; см. gamedata/slots.ts). */
  slot: number
  item: number
  enchant: number
  surpass: number
  itemLevel: number
  stats: StatValue[]
  soulStats: StatValue[]
  /** Умения на вещи. У аркан одно умение может встречаться несколько раз — уровни складываются. */
  skills: GearSkill[]
  manastones: Manastone[]
  godstones: number[]
}

export interface CharSkill {
  skill: number
  /** Итоговый уровень с учётом бонусов (Даэванион, арканы, шмот). */
  level: number
  equipped: boolean
  /** Номера специализаций (1–5), которые оверлей видит у умения. */
  specs: number[]
}

export interface DaevanionBoardState {
  board: number
  nodes: number[]
}

export interface GenusEffect {
  /** Номер ячейки рода, с 0. */
  slot: number
  grade: number
  stat: number
  value: number
}

export interface GenusState {
  /** Ключ рода из оверлея: intellect, feral, nature, trans, special. */
  genus: string
  level: number
  effects: GenusEffect[]
}

export interface AbyssSeason {
  grade: number
  points: number
  kills: number
  deaths: number
  assists: number
  rankChange: number
  at: number
}

export interface Character {
  /** «сервер:имя» — так персонажа называет оверлей. */
  key: string
  name: string
  server: number
  cls: ClassKey | null
  race?: string
  gender?: string
  level: number
  gearScore: number
  combatPower: number
  legion?: string
  /** Когда оверлей последний раз видел персонажа в игре (мс). */
  updatedAt: number
  gear: GearItem[]
  daevanion: DaevanionBoardState[]
  pets: { pet: number; level: number }[]
  titles: number[]
  ownedTitles: number[]
  skinsOwned: number
  monoliths: { monolith: number; tokens: number }[]
  pantheon: { slot: number; deco: number }[]
  wings: { wing: number; level: number }[]
  equippedWing?: number
  genus: GenusState[]
  skills: CharSkill[]
  abyss?: AbyssSeason
  stats: StatValue[]
}

/** Персонаж из списка аккаунта: оверлей знает его, но подробных данных может не быть. */
export interface RosterEntry {
  key: string
  name: string
  server: number
  cls: ClassKey | null
  gender?: string
  level: number
  gearScore: number
  combatPower: number
  seenAt: number
  hasDetails: boolean
}

export interface QuestlogData {
  characters: Character[]
  roster: RosterEntry[]
}
