// Применение темы: переписываем CSS-переменные на <html>. Все классы Tailwind (bg-surface, text-accent…)
// ссылаются на эти переменные, поэтому интерфейс перекрашивается мгновенно, без перезагрузки.
// Производные цвета (accent-2, accent-soft, свечение) считаются в styles.css через color-mix от акцента.

import { onAccentColor, themeBase, type MotionLevel, type UiPrefs } from '@shared/theme'
import { STATIC_MODE } from './env'

export function applyTheme(ui: Pick<UiPrefs, 'base' | 'accent'>): void {
  const base = themeBase(ui.base)
  const root = document.documentElement.style
  root.setProperty('--color-bg', base.bg)
  root.setProperty('--color-sidebar', base.sidebar)
  root.setProperty('--color-surface', base.surface)
  root.setProperty('--color-surface-2', base.surface2)
  root.setProperty('--color-surface-3', base.surface3)
  root.setProperty('--color-accent', ui.accent)
  root.setProperty('--color-on-accent', onAccentColor(ui.accent))
}

/** Масштаб в браузерном режиме (в приложении им управляет main-процесс через setZoomFactor). */
export function applyCssZoom(zoom: number): void {
  document.documentElement.style.setProperty('zoom', String(zoom))
}

/** Что применяется на деле: режим ?static и системное «уменьшить движение» сильнее выбора в приложении. */
export function effectiveMotion(level: MotionLevel): MotionLevel {
  if (STATIC_MODE) return 'off'
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  return reduced && level === 'full' ? 'calm' : level
}

/** Уровень анимаций — атрибутом data-motion на <html>: по нему styles.css выключает фоновые эффекты и блеск. */
export function applyMotion(level: MotionLevel): void {
  document.documentElement.dataset.motion = effectiveMotion(level)
}
