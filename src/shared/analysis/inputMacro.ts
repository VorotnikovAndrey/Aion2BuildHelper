// Расчёт макроса в ПО мыши («одна кнопка на всю ротацию»): сколько длится цикл, сколько держится
// каждое нажатие и как часто отпускается клавиша связки. Игра читает ввод раз в кадр, а связка
// работает, только пока её клавиша зажата, — отсюда два риска: слишком короткое нажатие игра может
// не заметить, а каждое отпускание клавиши связки её останавливает.

import type { InputEvent } from '../guide/types'

/** Кадр при 60 FPS, мс: нажатие короче может уместиться между двумя кадрами. */
export const FRAME_60_MS = 1000 / 60

/** Нажатие базовой атаки, которое не теряется даже с резервом умений (корейские стражи, Razer/G Hub): 20 мс. */
export const SAFE_HOLD_MS = 20

export interface KeyTiming {
  key: string
  /** Сколько раз клавиша нажимается за цикл. */
  presses: number
  /** Самое короткое удержание, мс. */
  holdMs: number
  /** Самая короткая пауза между отпусканием и следующим нажатием (с учётом следующего цикла), мс. */
  gapMs: number
  pressesPerSec: number
  /** Нажата и не отпущена до конца цикла. */
  stuck: boolean
}

export interface InputWarning {
  key: string
  kind: 'short-hold' | 'macro-release' | 'stuck'
  text: string
}

export interface InputMacroReport {
  /** Один прогон макроса вместе с паузой автоповтора, мс. */
  cycleMs: number
  keys: KeyTiming[]
  warnings: InputWarning[]
}

const ms = (v: number) => `${Math.round(v * 10) / 10} мс`
const perSec = (v: number) => `${Math.round(v)} раз в секунду`

export function analyzeInputMacro(events: InputEvent[], repeatMs: number, macroKey?: string): InputMacroReport {
  const cycleMs = events.reduce((sum, e) => sum + e.waitMs, 0) + repeatMs
  // Моменты нажатий и отпусканий каждой клавиши внутри цикла.
  const marks = new Map<string, { t: number; down: boolean }[]>()
  let t = 0
  for (const e of events) {
    const list = marks.get(e.key) ?? []
    list.push({ t, down: e.down })
    marks.set(e.key, list)
    t += e.waitMs
  }

  const keys: KeyTiming[] = []
  for (const [key, list] of marks) {
    const presses: { down: number; up: number | null }[] = []
    for (const m of list) {
      if (m.down) presses.push({ down: m.t, up: null })
      else {
        const open = presses.find((p) => p.up === null)
        if (open) open.up = m.t
      }
    }
    const stuck = presses.some((p) => p.up === null)
    const closed = presses.filter((p): p is { down: number; up: number } => p.up !== null)
    const holdMs = closed.length ? Math.min(...closed.map((p) => p.up - p.down)) : 0
    // Пауза до следующего нажатия: внутри цикла или до первого нажатия следующего прогона.
    const gaps = closed.map((p, i) => {
      const next = presses[i + 1]?.down ?? (presses[0] ? presses[0].down + cycleMs : p.up)
      return next - p.up
    })
    const gapMs = gaps.length ? Math.min(...gaps) : 0
    keys.push({ key, presses: presses.length, holdMs, gapMs, pressesPerSec: cycleMs ? (presses.length * 1000) / cycleMs : 0, stuck })
  }

  const warnings: InputWarning[] = []
  for (const k of keys) {
    if (k.stuck) {
      warnings.push({ key: k.key, kind: 'stuck', text: `${k.key} нажимается, но не отпускается — после отпускания кнопки мыши клавиша может «залипнуть».` })
      continue
    }
    if (k.key === macroKey) {
      if (k.presses > 0 && cycleMs > 0) {
        warnings.push({
          key: k.key,
          kind: 'macro-release',
          text: `${k.key} (клавиша связки) отпускается ${perSec(k.pressesPerSec)} на ${ms(k.gapMs)}. Связка работает, только пока клавиша зажата, — при каждом отпускании она может начинать заново с первого шага. Поэтому ячейку с заполнителем (всегда готовым умением) ставьте в связке последней: шаги после неё не дойдут.`
        })
      }
      continue
    }
    if (k.holdMs < SAFE_HOLD_MS) {
      warnings.push({
        key: k.key,
        kind: 'short-hold',
        text: `${k.key} зажимается на ${ms(k.holdMs)}${k.holdMs < FRAME_60_MS ? ` — меньше одного кадра при 60 FPS (${ms(FRAME_60_MS)})` : ''}. С резервом умений такие клики игра иногда теряет; надёжно — от ${SAFE_HOLD_MS} мс.`
      })
    }
  }
  return { cycleMs, keys, warnings }
}
