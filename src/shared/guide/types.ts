// Формат гайда (билда). Гайд — это цель, с которой приложение сравнивает персонажа.
// Он не привязан ни к сайту, ни к языку: всё задаётся ID игры (умения, статы, узлы досок),
// поэтому один и тот же формат подходит для гайда с Mobalytics, из видео или своего собственного.
// Подробное описание с примерами — docs/guides.md.

import type { ClassKey } from '../types'
import { t } from '../i18n'

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
  /** Статья-гайд, статистика того, что носят игроки, или билд с Questlog. */
  kind?: 'guide' | 'data' | 'questlog'
  /** Сколько лайков у билда на Questlog (на момент сбора). */
  likes?: number
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
  /** content — сколько нужно для контента; top — сколько в среднем у топ-игроков класса; stage — как у автора на этой стадии. */
  kind?: 'content' | 'top' | 'stage'
  note?: string
}

/** Рекомендуемые титулы по категориям — в порядке предпочтения (ID титулов). */
export interface GuideTitles {
  attack?: number[]
  defense?: number[]
  utility?: number[]
  notes?: string
}

/** О чём совет автора: build — о билде целиком, stage — заметка стадии, skills — к умениям и ротации, boards — к доскам. */
export type GuideTipKind = 'build' | 'stage' | 'skills' | 'boards'

/**
 * Совет гайда. У своих гайдов — заголовок и текст; у билдов Questlog — тексты автора (обычно по-английски)
 * с видом и стадиями, к которым они относятся (нет stages — ко всему гайду).
 */
export interface GuideTip {
  id?: string
  kind?: GuideTipKind
  title: string
  text: string
  stages?: string[]
}

/**
 * Шаг связки (макроса игры) — ячейка панели. В ячейке до 4 умений столбиком (ряды 0–3):
 * игра применяет первое готовое, нижнее (ряд 0) — главное. Связка (окно «Умения» → «Связки»)
 * работает, пока её клавиша зажата: идёт по шагам сверху вниз и по кругу, пропуская то, что на откате.
 */
export interface GuideMacro {
  id: string
  name: string
  /** Ряды ячейки снизу вверх: первое — ряд 0, главное. */
  skills: number[]
  /** Своя клавиша, если ячейку жмут не через связку. */
  key?: string
  /** Когда ячейка подходит — по уровню умения (например, «Суд ниже 16» и «Суд от 16»). */
  when?: { skill: number; minLevel?: number; maxLevel?: number }
  note?: string
}

/** Подсказка, которая зависит от стата персонажа: берётся первая строка, где стат ниже `below`. */
export interface StatHint {
  stat: number
  ranges: { below?: number; text: string }[]
}

/** Умение на отдельной клавише — когда его жать. */
export interface GuideManualSkill {
  skill: number
  when: string
  key?: string
  /** Необязательное (например, запасная стигма): если не надето — просто пропустить. */
  optional?: boolean
  byStat?: StatHint
}

/** Событие макроса в ПО мыши (как в его редакторе): клавиша нажата или отпущена, затем пауза. */
export interface InputEvent {
  key: string
  down: boolean
  /** Пауза после события, мс. */
  waitMs: number
}

/** «Одна кнопка»: макрос в ПО мыши, который держит клавишу связки и кликает базовую атаку. */
export interface GuideOneButton {
  events: InputEvent[]
  /** Пауза автоповтора между прогонами, мс. */
  repeatMs: number
  note?: string
}

/** Бой: связка, ручные умения и открытие боя. Текстовые принципы — в `rotation`. */
export interface GuideCombat {
  /** Шаги связки — ячейки панели, по порядку. */
  macros?: GuideMacro[]
  /** Клавиша связки. */
  macroKey?: string
  /** Задержка между шагами связки, мс. */
  delayMs?: number
  delayNote?: string
  manual?: GuideManualSkill[]
  /** Открытие боя по шагам. */
  opener?: { skill: number; note?: string }[]
  openerNote?: string
  oneButton?: GuideOneButton
  notes?: string
}

/** Вещь автора на стадии: что носит, с каким усилением и строками. */
export interface GuideStageItem {
  slot: number
  item: number
  enchant: number
  /** Превосхождение (сверх +20 / +10). */
  surpass?: number
  stats?: { stat: number; value: number }[]
  /** Умения строкой на вещи. */
  skills?: number[]
  /** Статы камней маны. */
  manastones?: number[]
}

/**
 * Стадия прокачки — как в билдах Questlog («1600 GS», «Final Setup»). Что задано у стадии, заменяет
 * то же поле гайда, пока выбрана эта стадия (см. `applyStage`); остальное берётся из гайда.
 */
export interface GuideStage {
  id: string
  name: string
  /** Уровень снаряжения стадии (как считает Questlog). */
  gearScore?: number
  tags?: string[]
  note?: string
  skills?: SkillTarget[]
  combat?: GuideCombat
  daevanion?: { goals: DaevanionGoal[]; notes?: string }
  titles?: GuideTitles
  arcana?: Guide['arcana']
  statTargets?: StatTarget[]
  gear?: GuideStageItem[]
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
  /** Стадии прокачки, от ранней к финальной. Нет — гайд один на всю игру. */
  stages?: GuideStage[]
  genus: { stats?: StatWeight[]; notes?: string }
  titles?: GuideTitles
  /** Пороги статов для контента (меткость, крит) — по ним камни советуются с учётом ваших цифр. */
  statTargets?: StatTarget[]
  /** Принципы ротации — текстом, по шагам. */
  rotation?: string[]
  /** Макросы, ручные умения и открытие боя — по ID умений. */
  combat?: GuideCombat
  tips?: GuideTip[]
  /** Собственные пункты для чек-листа («сделать один раз»). */
  checklist?: { id: string; text: string }[]
}

export const MODE_LABEL: Record<GuideMode, string> = {
  pve: 'PvE',
  pvp: 'PvP',
  leveling: t('Прокачка'),
  other: t('Другое')
}

export const ROLE_LABEL: Record<SkillRole, string> = {
  core: t('Главное'),
  support: t('Поддержка'),
  passive: t('Пассивное'),
  stigma: t('Стигма'),
  situational: t('По ситуации')
}

export function emptyGuide(cls: ClassKey, id: string): Guide {
  return {
    schema: GUIDE_SCHEMA,
    id,
    name: t('Новый гайд'),
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
