// Единый язык цвета во всём приложении:
//   зелёный — сделано как в гайде;
//   жёлтый — приемлемо или стоит обратить внимание (почти дотянули, нужно проверить, слабая польза);
//   красный — не так, как в гайде (не хватает, стоит не то, бесполезно);
//   серый — гайд об этом молчит.
// Каждый вердикт идёт вместе с причиной — она показывается в подсказке при наведении.

import type { SkillReport } from '@shared/analysis/skills'
import type { Verdict } from '@shared/analysis/weights'

export type Tone = 'ok' | 'warn' | 'bad' | 'neutral'

export interface ToneReason {
  tone: Tone
  /** Почему так — для подсказки. */
  why: string
}

export const TONE_TEXT: Record<Tone, string> = {
  ok: 'text-good',
  warn: 'text-warning',
  bad: 'text-critical',
  neutral: 'text-ink-2'
}

export const TONE_DOT: Record<Tone, string> = {
  ok: 'bg-good',
  warn: 'bg-warning',
  bad: 'bg-critical',
  neutral: 'bg-ink-3'
}

/** Рамка + фон для карточек и строк. */
export const TONE_BOX: Record<Tone, string> = {
  ok: 'border-good/35 bg-good-soft',
  warn: 'border-warning/35 bg-warning-soft',
  bad: 'border-critical/35 bg-critical-soft',
  neutral: 'border-line bg-surface-2'
}

export const TONE_LABEL: Record<Tone, string> = {
  ok: 'как в гайде',
  warn: 'обратить внимание',
  bad: 'не по гайду',
  neutral: 'гайд не оценивает'
}

const worst = (...tones: Tone[]): Tone => (tones.includes('bad') ? 'bad' : tones.includes('warn') ? 'warn' : tones.includes('ok') ? 'ok' : 'neutral')

/** Уровень умения против цели гайда. */
export function levelTone(s: SkillReport): ToneReason {
  if (!s.target) return { tone: 'neutral', why: 'Гайд не ставит цель по этому умению.' }
  if (!s.learned) return { tone: 'bad', why: 'Умение не изучено, а гайд на него рассчитывает.' }
  if (!s.targetLevel) return { tone: 'ok', why: 'Умение изучено; конкретного уровня гайд не требует.' }
  if (s.levelGap === 0) return { tone: 'ok', why: `Уровень ${s.level} — цель гайда (${s.targetLevel}) достигнута.` }
  if (s.levelGap <= 2)
    return { tone: 'warn', why: `Уровень ${s.level}, до цели ${s.targetLevel} осталось ${s.levelGap} — почти. Поднимается очками, узлами досок и арканами.` }
  return { tone: 'bad', why: `Уровень ${s.level}, до цели ${s.targetLevel} не хватает ${s.levelGap}. Это заметно отстаёт от гайда.` }
}

/** Специализации против гайда. uncertain — данные оверлея о специализациях недостоверны. */
export function specTone(s: SkillReport, uncertain: boolean): ToneReason {
  if (!s.specs || !s.specs.wanted.length) return { tone: 'neutral', why: 'Гайд не требует специализаций на этом уровне.' }
  if (uncertain && s.specsSource === 'overlay')
    return {
      tone: 'warn',
      why: 'Оверлей не знает, какие варианты стоят. Отметьте их, нажав на нужные варианты, — тогда оценка станет точной.'
    }
  const have = s.specs.wanted.length - s.specs.missing.length
  if (have === s.specs.wanted.length) return { tone: 'ok', why: `Стоят нужные варианты: ${s.specs.wanted.join(', ')}.` }
  if (have > 0) return { tone: 'warn', why: `Часть нужных вариантов стоит. Не хватает: ${s.specs.missing.join(', ')}.` }
  return { tone: 'bad', why: `Не стоит ни один из нужных вариантов (${s.specs.wanted.join(', ')}).` }
}

/** Общий вердикт по умению: худшее из уровня, специализаций и того, надето ли (для стигм). */
export function skillTone(s: SkillReport, uncertain: boolean): ToneReason {
  const lvl = levelTone(s)
  const spec = specTone(s, uncertain)
  if (s.target?.role === 'stigma' && s.target.equip && !s.equipped) return { tone: 'bad', why: 'Гайд держит эту стигму надетой, а у вас её нет в наборе.' }
  if (s.target?.role === 'stigma' && s.target.equip === false)
    return { tone: s.equipped ? 'ok' : 'neutral', why: 'По ситуации: гайд советует надевать её только в особых случаях.' }
  const tone = worst(lvl.tone, spec.tone)
  if (tone === 'ok') return { tone, why: 'Уровень и специализации — как в гайде.' }
  return { tone, why: [lvl.tone !== 'ok' ? lvl.why : '', spec.tone !== 'ok' && spec.tone !== 'neutral' ? spec.why : ''].filter(Boolean).join(' ') }
}

/** Строки вещей, манакамни, ячейки рода — по весу в гайде. */
export function verdictTone(v: Verdict): Tone {
  return v === 'great' ? 'ok' : v === 'bad' ? 'bad' : 'warn'
}

export function verdictWhy(v: Verdict, weight: number): string {
  if (v === 'great') return `Нужно по гайду (важность ${weight} из 5).`
  if (v === 'good') return `Приемлемо: гайд ценит, но не в первую очередь (важность ${weight} из 5).`
  if (v === 'weak') return `Слабо: пользы немного (важность ${weight} из 5). При случае заменить.`
  return 'Гайд этот стат не ценит — строку стоит перековать или заменить.'
}

/** Доля выполненного → тон: всё — зелёный, половина и больше — жёлтый, меньше — красный. */
export function shareTone(done: number, total: number): Tone {
  if (!total) return 'neutral'
  if (done >= total) return 'ok'
  return done / total >= 0.5 ? 'warn' : 'bad'
}
