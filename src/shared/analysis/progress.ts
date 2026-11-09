// События прогресса между двумя разборами одного персонажа: что стоит отпраздновать, когда оверлей прислал
// свежие данные. Взятый порог стата, умение на уровне гайда, рост уровня главного умения, новая вещь,
// заточка, рост оценки билда, выполненный важный шаг.

import type { Namer } from '../names'
import type { BuildReport } from './build'

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
  for (const t of next.statTargets) {
    if (t.target.kind === 'top') continue
    const before = prev.statTargets.find((p) => p.target.id === t.target.id)
    const was = before?.reached?.value ?? 0
    if (t.reached && t.reached.value > was) {
      out.push({
        id: `threshold-${t.target.id}-${t.reached.value}`,
        kind: 'threshold',
        title: `Порог взят: ${t.target.name} — ${t.reached.label}`,
        text: t.next
          ? `Сейчас ${Math.round(t.current)}. Следующий — ${t.next.value} (${t.next.label}).`
          : `Сейчас ${Math.round(t.current)} — это последний порог гайда.`
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
      out.push({ id: `skill-done-${s.skill}-${s.level}`, kind: 'skill', title: `${name} — ур. ${s.level}, как в гайде`, skill: s.skill })
    } else if (s.role === 'core') {
      out.push({
        id: `skill-up-${s.skill}-${s.level}`,
        kind: 'skill',
        title: `${name}: ур. ${p.level} → ${s.level}`,
        text: s.targetLevel ? `До цели гайда — ${s.levelGap}.` : undefined,
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
      out.push({ id: `item-${g.slot}-${g.item.item}`, kind: 'item', title: `Новая вещь: ${namer.item(g.item.item, g.slot).main}` })
    } else if (g.item.enchant > p.item.enchant) {
      out.push({
        id: `enchant-${g.slot}-${g.item.enchant}`,
        kind: 'item',
        title: `${namer.item(g.item.item, g.slot).main}: заточка +${p.item.enchant} → +${g.item.enchant}`
      })
    }
  }

  // Выполненные важные шаги из «Что сделать дальше».
  const nextSteps = new Set(next.steps.map((s) => s.id))
  for (const s of prev.steps) {
    if (s.impact === 'high' && !nextSteps.has(s.id)) out.push({ id: `step-${s.id}`, kind: 'step', title: `Сделано: ${s.title}`, skill: s.skill })
  }

  // Оценка билда.
  const a = prev.scores.overall
  const b = next.scores.overall
  if (b > a) out.push({ id: `score-${b}`, kind: 'score', title: `Оценка билда ${a} → ${b}`, text: 'Сравнение с гайдом — на «Обзоре».' })

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
        .join('\n') + (rest.length > 2 ? `\nи ещё ${rest.length - 2}` : '')
    : (first.text ?? '')
  return { title: first.title, body }
}
