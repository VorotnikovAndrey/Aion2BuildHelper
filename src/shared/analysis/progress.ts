// События прогресса между двумя разборами одного персонажа: что стоит отпраздновать, когда оверлей прислал
// свежие данные. Взятый порог стата, умение на уровне гайда, рост уровня главного умения, новая вещь,
// заточка, рост оценки билда, выполненный важный шаг.

import type { Namer } from '../names'
import type { BuildReport } from './build'
import { t } from '../i18n'

export type ProgressKind = 'threshold' | 'skill' | 'item' | 'score' | 'step'

export interface ProgressEvent {
  id: string
  kind: ProgressKind
  title: string
  text?: string
  /** Умение — для иконки. */
  skill?: number
}

/** Не больше стольких событий за одно обновление — остальное видно в «Истории». */
export const MAX_EVENTS = 6

export function progressEvents(prev: BuildReport, next: BuildReport, namer: Namer): ProgressEvent[] {
  const out: ProgressEvent[] = []

  // Пороги статов для контента (меткость, крит, СКР боя).
  for (const tgt of next.statTargets) {
    if (tgt.target.kind === 'top') continue
    const before = prev.statTargets.find((p) => p.target.id === tgt.target.id)
    const was = before?.reached?.value ?? 0
    if (tgt.reached && tgt.reached.value > was) {
      out.push({
        id: `threshold-${tgt.target.id}-${tgt.reached.value}`,
        kind: 'threshold',
        title: t('Порог взят: {target} — {reached}', { target: tgt.target.name, reached: tgt.reached.label }),
        text: tgt.next
          ? t('Сейчас {t}. Следующий — {next} ({next2}).', { t: Math.round(tgt.current), next: tgt.next.value, next2: tgt.next.label })
          : t('Сейчас {t} — это последний порог гайда.', { t: Math.round(tgt.current) })
      })
    }
  }

  // Умения: дошло до уровня гайда, или главное умение выросло.
  const prevSkills = new Map(prev.skills.map((s) => [s.skill, s]))
  for (const s of next.skills) {
    const p = prevSkills.get(s.skill)
    if (!p || s.level <= p.level) continue
    const name = namer.skill(s.skill).main
    if (s.targetLevel && s.levelGap === 0 && p.levelGap > 0) {
      out.push({
        id: `skill-done-${s.skill}-${s.level}`,
        kind: 'skill',
        title: t('{name} — ур. {level}, как в гайде', { name, level: s.level }),
        skill: s.skill
      })
    } else if (s.role === 'core') {
      out.push({
        id: `skill-up-${s.skill}-${s.level}`,
        kind: 'skill',
        title: t('{name}: ур. {level} → {level2}', { name, level: p.level, level2: s.level }),
        text: s.targetLevel ? t('До цели гайда — {levelGap}.', { levelGap: s.levelGap }) : undefined,
        skill: s.skill
      })
    }
  }

  // Шмот: новая вещь в слоте или заточка выше.
  const prevGear = new Map(prev.gear.map((g) => [g.slot, g]))
  for (const g of next.gear) {
    const p = prevGear.get(g.slot)
    if (!p) continue
    if (p.item.item !== g.item.item) {
      out.push({ id: `item-${g.slot}-${g.item.item}`, kind: 'item', title: t('Новая вещь: {item}', { item: namer.item(g.item.item, g.slot).main }) })
    } else if (g.item.enchant > p.item.enchant) {
      out.push({
        id: `enchant-${g.slot}-${g.item.enchant}`,
        kind: 'item',
        title: t('{item}: заточка +{enchant} → +{enchant2}', { item: namer.item(g.item.item, g.slot).main, enchant: p.item.enchant, enchant2: g.item.enchant })
      })
    }
  }

  // Выполненные важные шаги из «Что сделать дальше».
  const nextSteps = new Set(next.steps.map((s) => s.id))
  for (const s of prev.steps) {
    if (s.impact === 'high' && !nextSteps.has(s.id))
      out.push({ id: `step-${s.id}`, kind: 'step', title: t('Сделано: {title}', { title: s.title }), skill: s.skill })
  }

  // Оценка билда.
  const a = prev.scores.overall
  const b = next.scores.overall
  if (b > a) out.push({ id: `score-${b}`, kind: 'score', title: t('Оценка билда {a} → {b}', { a, b }), text: t('Сравнение с гайдом — на «Обзоре».') })

  return out.slice(0, MAX_EVENTS)
}

/** Короткий текст для уведомления Windows: главное событие и сколько ещё. */
export function notificationText(events: ProgressEvent[]): { title: string; body: string } | null {
  if (!events.length) return null
  const [first, ...rest] = events
  const body = rest.length
    ? rest
        .map((e) => e.title)
        .slice(0, 2)
        .join('\n') + (rest.length > 2 ? t('\nи ещё {p}', { p: rest.length - 2 }) : '')
    : (first.text ?? '')
  return { title: first.title, body }
}
