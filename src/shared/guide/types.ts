// Формат гайда (билда). Гайд — это цель, с которой приложение сравнивает персонажа.
// Он не привязан ни к сайту, ни к языку: всё задаётся ID игры (умения, статы, узлы досок),
// поэтому один и тот же формат подходит для гайда с Mobalytics, из видео или своего собственного.
// Подробное описание с примерами — docs/guides.md.

import type { ClassKey } from '../types'

export const GUIDE_SCHEMA = 1

export type GuideMode = 'pve' | 'pvp' | 'leveling' | 'other'

/** Роль умения в билде — от неё зависит, насколько важно отставание. */
export type SkillRole = 'core' | 'support' | 'passive' | 'stigma' | 'situational'

export interface SkillTarget {
  skill: number
  role: SkillRole
  /** Уровень, к которому стремимся (с учётом бонусов от досок, аркан и шмота). */
  level?: number
  /** Нужные специализации в порядке важности — надеваются первые, на которые хватает слотов. */
  specs?: number[]
  /** Запасные специализации: пока не открыты основные. */
  earlySpecs?: number[]
  /** Для стигм: держать надетой (true) или это замена на особый случай. */
  equip?: boolean
  note?: string
}

/** Вес стата: 5 — самое важное, 1 — «лучше, чем ничего». Не указан — бесполезен для билда. */
export interface StatWeight {
  stat: number
  weight: number
  note?: string
}

export interface SkillWeight {
  skill: number
  weight: number
  note?: string
}

export interface DaevanionGoal {
  id: string
  name: string
  description?: string
  /** Умения, у которых нужно взять узлы «+1 к уровню». */
  skills?: number[]
  /** На каких досках (ID досок, например 21–24). Не указано — на всех. */
  boards?: number[]
  /** Конкретные узлы (если гайд даёт точную раскладку). */
  nodes?: number[]
}

/** Откуда гайд: статья, видео или статистика игроков. */
export interface GuideSource {
  title?: string
  url?: string
  author?: string
  date?: string
  /** Для какой версии игры писался: глобальная, Корея/Тайвань или смешанно. */
  region?: 'global' | 'korea' | 'mixed'
  /** Статья-гайд или статистика того, что носят игроки. */
  kind?: 'guide' | 'data'
  note?: string
}

/**
 * Порог стата: сколько нужно для контента. Текущее значение — сумма статов `stats` персонажа.
 * Пока ниже ближайшего порога, статы из `raise` (например, камни «Доп. меткость») важнее всего.
 */
export interface StatTarget {
  id: string
  name: string
  stats: number[]
  goals: { value: number; label: string }[]
  /** Какие статы поднимают этот показатель (их приоритет растёт, пока порог не взят). */
  raise?: number[]
  /** content — сколько нужно для контента; top — сколько в среднем у топ-игроков класса (ориентир). */
  kind?: 'content' | 'top'
  note?: string
}

/** Рекомендуемые титулы по категориям — в порядке предпочтения (ID титулов). */
export interface GuideTitles {
  attack?: number[]
  defense?: number[]
  utility?: number[]
  notes?: string
}

export interface GuideTip {
  title: string
  text: string
}

export interface Guide {
  schema: number
  id: string
  name: string
  cls: ClassKey
  mode: GuideMode
  description?: string
  source?: GuideSource
  /** Сводный гайд: все источники, из которых он собран. */
  sources?: GuideSource[]
  /** Встроенный гайд нельзя изменить — только скопировать. */
  builtin?: boolean
  updatedAt: string

  skills: SkillTarget[]
  /** Общие приоритеты статов: для шмота, манакамней и Знания о видах, если для них не задано своё. */
  stats: StatWeight[]
  gear: {
    /** Свои приоритеты для групп слотов (иначе — общие). */
    weapon?: StatWeight[]
    armor?: StatWeight[]
    accessory?: StatWeight[]
    /** Какие умения хорошо иметь строкой на шмоте. */
    skills: SkillWeight[]
    notes?: string
  }
  manastones?: StatWeight[]
  arcana: {
    /** Атакующие умения по важности (для Пергамента, Компаса и Грааля). */
    attack: number[]
    /** Пассивные умения по важности (для Колокола, Зеркала и Грааля). */
    passive: number[]
    /** Умения, которые на арканах только мешают. */
    useless: number[]
    /** Какой сет собирать: «магии» или «жизни». */
    preferredSet?: 'magic' | 'vigor'
    notes?: string
  }
  daevanion: { goals: DaevanionGoal[]; notes?: string }
  genus: { stats?: StatWeight[]; notes?: string }
  titles?: GuideTitles
  /** Пороги статов для контента (меткость, крит) — по ним камни советуются с учётом ваших цифр. */
  statTargets?: StatTarget[]
  rotation?: string[]
  tips?: GuideTip[]
  /** Собственные пункты для чек-листа («сделать один раз»). */
  checklist?: { id: string; text: string }[]
}

export const MODE_LABEL: Record<GuideMode, string> = {
  pve: 'PvE',
  pvp: 'PvP',
  leveling: 'Прокачка',
  other: 'Другое'
}

export const ROLE_LABEL: Record<SkillRole, string> = {
  core: 'Главное',
  support: 'Поддержка',
  passive: 'Пассивное',
  stigma: 'Стигма',
  situational: 'По ситуации'
}

export function emptyGuide(cls: ClassKey, id: string): Guide {
  return {
    schema: GUIDE_SCHEMA,
    id,
    name: 'Новый гайд',
    cls,
    mode: 'pve',
    updatedAt: new Date().toISOString(),
    skills: [],
    stats: [],
    gear: { skills: [] },
    arcana: { attack: [], passive: [], useless: [] },
    daevanion: { goals: [] },
    genus: {}
  }
}
