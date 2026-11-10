// Титулы: справочник всех титулов (npm run gamedata, с metabot.gg) и официальные русские названия.
// Надеть можно по одному титулу каждой категории: атака, защита, другое. Бонус «при наличии»
// работает от всех собранных титулов сразу — надевать их не нужно.

import type { TitleCategory } from './art'
import type { ItemGrade } from './slots'
import titlesJson from './generated/titles.json'
import { t } from '../i18n'

export interface TitleDef {
  id: number
  en: string
  ru?: string
  grade: ItemGrade
  category: TitleCategory
  race: 'light' | 'dark' | 'both'
  /** Бонус, пока титул надет: [ID стата, значение]. */
  equip: [number, number][]
  /** «Эффект при наличии» — работает, если титул просто собран. */
  collection: [number, number][]
  source: string
}

export const TITLE_CATEGORIES: { id: TitleCategory; ru: string }[] = [
  { id: 'attack', ru: t('Атака') },
  { id: 'defense', ru: t('Защита') },
  { id: 'utility', ru: t('Другое') }
]

/**
 * Официальные русские названия — из русского клиента (окно «Титулы») и страницы билда Questlog на русском.
 * Остальные пока по-английски; их можно переименовать в настройках названий.
 */
const TITLE_RU: Record<number, string> = {
  11010001: 'Окутанный небесами',
  11010002: 'Прикоснувшийся к иллюзиям',
  11010003: 'Обличитель иллюзий',
  11010004: 'Достигший истока',
  11010005: 'Победитель Бездны',
  11020001: 'Всему есть применение',
  11020002: 'Боли в животе! Тошнота! Несварение!',
  11020003: 'Горький осадок ушедшего света',
  11020004: 'Невысказанные чувства',
  11020005: 'Эхо тепла',
  11020006: 'Неисчерпаемая рабочая сила',
  11020007: 'Вперед, вопреки утраченному раю',
  11020008: 'И для миражей наступает рассвет',
  11020010: 'Свидетель сокрытой истины',
  11020011: 'Поможем друг другу',
  11020012: 'Почему ничего не выходит?',
  11020013: 'Язык силы',
  11020014: 'Перевоплощающихся не бьют',
  11020015: 'Путешественник Альтгарда',
  11020016: 'Пионер',
  11020034: 'Несостоявшийся делец',
  11020035: 'Грибник',
  11020037: 'Дачник',
  11020039: 'Чувство долга',
  12010061: 'Прошедший огонь и воду',
  12030002: 'Защитник Бертрона',
  12030003: 'Святой Бертрона',
  13010010: 'Предстать перед истоком Кайсинеля'
}

export const TITLES: TitleDef[] = (titlesJson as Omit<TitleDef, 'ru'>[]).map((t) => ({ ...t, ru: TITLE_RU[t.id] }))
const byId = new Map(TITLES.map((t) => [t.id, t]))

export const titleDef = (id: number): TitleDef | undefined => byId.get(id)

/** Что считать для прогресса к титулу: минимальный уровень родов, питомцы, крылья, облики, заточка. */
export type TitleTrack = 'genusMin' | 'pets' | 'wings' | 'skins' | 'uniqueEnchant'

export interface TitleHow {
  /** Как получить — по-русски. */
  ru: string
  /** Название достижения в клиенте (английское — русских названий достижений в данных нет). */
  achievement?: string
  track?: TitleTrack
  goal?: number
}

/**
 * Как получить титулы, на которые указывают встроенные гайды (страницы титулов на metabot.gg,
 * 9 ноября 2026). Для остальных титулов — короткая строка `source` из справочника.
 */
export const TITLE_HOW: Record<number, TitleHow> = {
  13010021: {
    achievement: 'Genus Genius',
    ru: t('Достижение «Genus Genius»: поднять все пять родов Знания о видах до ур. 10 (5 ступеней). Награда — титул и 20 000 кинара.'),
    track: 'genusMin',
    goal: 10
  },
  13050017: {
    achievement: 'Tailor-Made V',
    ru: t('Достижение «Tailor-Made V»: заточить уникальную вещь до +15.'),
    track: 'uniqueEnchant',
    goal: 15
  },
  12030003: { ru: t('Награда монолитов (раздел «Монолиты» в игре) — за Элийцев.') },
  22030003: { ru: t('Награда монолитов (раздел «Монолиты» в игре) — за Асмодиан.') },
  13050011: {
    achievement: 'Veteran Wing Collector V',
    ru: t('Достижение «Veteran Wing Collector V»: собрать 25 крыльев.'),
    track: 'wings',
    goal: 25
  },
  13010025: {
    achievement: 'My Reliable Friends VII',
    ru: t('Достижение «My Reliable Friends VII»: собрать 200 питомцев (ступени 3, 10, 30, 50, 100, 150, 200 — на каждой свой титул).'),
    track: 'pets',
    goal: 200
  },
  13050009: {
    achievement: 'Fashionista VII',
    ru: t('Достижение «Fashionista VII»: собрать 700 обликов.'),
    track: 'skins',
    goal: 700
  },
  12010061: { ru: t('Титул приключений; способ получения в справочнике не указан.') }
}

export const TRACK_RU: Record<TitleTrack, string> = {
  genusMin: t('самый низкий род Знания о видах'),
  pets: t('питомцев собрано'),
  wings: t('крыльев собрано'),
  skins: t('обликов собрано'),
  uniqueEnchant: t('лучшая заточка уникальной вещи')
}
