// Уровень анимаций для компонентов: выбор в «Оформлении», но ?static и системное «уменьшить движение» сильнее.

import type { MotionLevel } from '@shared/theme'
import { useApp } from './store'
import { effectiveMotion } from './theme'

export function useMotionLevel(): MotionLevel {
  return effectiveMotion(useApp((s) => s.settings.ui.motion))
}

/** Анимации появления и счётчики: всё, кроме «Выключены». */
export const useAnimate = (): boolean => useMotionLevel() !== 'off'

/** Декоративные эффекты (искры, блеск, эфир): только «Полные». */
export const useFancy = (): boolean => useMotionLevel() === 'full'
