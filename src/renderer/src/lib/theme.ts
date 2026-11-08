// Применение темы: переписываем CSS-переменные на <html>. Все классы Tailwind (bg-surface, text-accent…)
// ссылаются на эти переменные, поэтому интерфейс перекрашивается мгновенно, без перезагрузки.
// Производные цвета (accent-2, accent-soft, свечение) считаются в styles.css через color-mix от акцента.

import { onAccentColor, themeBase, type UiPrefs } from '@shared/theme'

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
