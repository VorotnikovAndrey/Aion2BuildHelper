// Темы оформления и масштаб интерфейса.
// Тема = основа (фон и поверхности) + акцентный цвет. Применяет их src/renderer/src/lib/theme.ts
// через CSS-переменные — все классы Tailwind (bg-surface, text-accent…) перекрашиваются сразу.
// Новая тема: запись в THEME_PRESETS (или новая основа в THEME_BASES).

export type ThemeBaseId = 'abyss' | 'elyos' | 'asmodae' | 'warm' | 'neutral' | 'oled'

export interface ThemeBase {
  id: ThemeBaseId
  label: string
  bg: string
  sidebar: string
  surface: string
  surface2: string
  surface3: string
}

export const THEME_BASES: ThemeBase[] = [
  { id: 'abyss', label: 'Бездна', bg: '#0f1117', sidebar: '#0b0d12', surface: '#161a23', surface2: '#1c212c', surface3: '#262c3a' },
  { id: 'elyos', label: 'Элиос', bg: '#1a1d23', sidebar: '#15181d', surface: '#21252c', surface2: '#282d35', surface3: '#323843' },
  { id: 'asmodae', label: 'Асмодея', bg: '#15121b', sidebar: '#100d15', surface: '#1d1925', surface2: '#25202f', surface3: '#2f293b' },
  { id: 'warm', label: 'Тёплый графит', bg: '#1f1e1d', sidebar: '#191817', surface: '#262624', surface2: '#2e2d2a', surface3: '#383733' },
  { id: 'neutral', label: 'Нейтральный', bg: '#1c1c1c', sidebar: '#161616', surface: '#242424', surface2: '#2c2c2c', surface3: '#363636' },
  { id: 'oled', label: 'Чёрный OLED', bg: '#0a0a0a', sidebar: '#000000', surface: '#141414', surface2: '#1c1c1c', surface3: '#262626' }
]

export interface ThemePreset {
  id: string
  label: string
  base: ThemeBaseId
  accent: string
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'gold', label: 'Золото Элиоса', base: 'abyss', accent: '#d9a441' },
  { id: 'aether', label: 'Эфир', base: 'abyss', accent: '#55c7ec' },
  { id: 'crimson', label: 'Багрянец Асмодеи', base: 'asmodae', accent: '#e0525e' },
  { id: 'amethyst', label: 'Аметист', base: 'asmodae', accent: '#a78bfa' },
  { id: 'ocean', label: 'Океан', base: 'elyos', accent: '#4f9cf0' },
  { id: 'sakura', label: 'Сакура', base: 'elyos', accent: '#f472b6' },
  { id: 'emerald', label: 'Изумруд', base: 'neutral', accent: '#34c38f' },
  { id: 'silver', label: 'Серебро', base: 'neutral', accent: '#d4d4d4' },
  { id: 'terracotta', label: 'Терракота', base: 'warm', accent: '#d97757' },
  { id: 'lime', label: 'Лайм', base: 'oled', accent: '#a3e635' }
]

/** Палитра для своего акцента. */
export const ACCENT_SWATCHES = [
  '#d9a441',
  '#f5a524',
  '#f97316',
  '#d97757',
  '#e0525e',
  '#ef4444',
  '#f472b6',
  '#d946ef',
  '#a78bfa',
  '#6366f1',
  '#4f9cf0',
  '#55c7ec',
  '#2dd4bf',
  '#34c38f',
  '#a3e635',
  '#d4d4d4'
]

/**
 * Анимации: full — все (появление, блеск вещей, эфир на фоне, искры); calm — только короткие переходы,
 * без фоновых и повторяющихся эффектов; off — без анимаций.
 */
export type MotionLevel = 'full' | 'calm' | 'off'

export const MOTION_LEVELS: { id: MotionLevel; label: string; hint: string }[] = [
  { id: 'full', label: 'Полные', hint: 'Появление карточек, счётчики, блеск редких вещей, эфир на фоне, искры при отметке в чек-листе.' },
  { id: 'calm', label: 'Спокойные', hint: 'Только короткие переходы и счётчики — без блеска, эфира на фоне и искр.' },
  { id: 'off', label: 'Выключены', hint: 'Всё появляется сразу, ничего не движется.' }
]

export interface UiPrefs {
  /** id готовой темы или 'custom', если цвета собраны вручную. */
  themeId: string
  base: ThemeBaseId
  accent: string
  /** Масштаб интерфейса, 1 = 100%. */
  zoom: number
  motion: MotionLevel
}

export const DEFAULT_UI: UiPrefs = { themeId: 'gold', base: 'abyss', accent: '#d9a441', zoom: 1, motion: 'full' }

export const ZOOM_STEPS = [0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2]
export const ZOOM_MIN = ZOOM_STEPS[0]
export const ZOOM_MAX = ZOOM_STEPS[ZOOM_STEPS.length - 1]

/** Следующий шаг масштаба вверх или вниз от текущего значения. */
export function stepZoom(current: number, direction: 1 | -1): number {
  if (direction > 0) return ZOOM_STEPS.find((s) => s > current + 0.001) ?? ZOOM_MAX
  return [...ZOOM_STEPS].reverse().find((s) => s < current - 0.001) ?? ZOOM_MIN
}

export function clampZoom(z: number): number {
  if (!Number.isFinite(z)) return 1
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100))
}

export const themeBase = (id: string): ThemeBase => THEME_BASES.find((b) => b.id === id) ?? THEME_BASES[0]

/** Настройки оформления из файла (старого или испорченного) → корректные значения. */
export function normalizeUi(raw: unknown): UiPrefs {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<Record<keyof UiPrefs, unknown>>
  const base = THEME_BASES.some((b) => b.id === r.base) ? (r.base as ThemeBaseId) : DEFAULT_UI.base
  const accent = typeof r.accent === 'string' && /^#[0-9a-f]{6}$/i.test(r.accent) ? r.accent.toLowerCase() : DEFAULT_UI.accent
  return {
    themeId: typeof r.themeId === 'string' && r.themeId ? r.themeId : DEFAULT_UI.themeId,
    base,
    accent,
    zoom: clampZoom(typeof r.zoom === 'number' ? r.zoom : 1),
    motion: MOTION_LEVELS.some((m) => m.id === r.motion) ? (r.motion as MotionLevel) : DEFAULT_UI.motion
  }
}

/** Тёмный или светлый текст поверх акцента — по яркости цвета. */
export function onAccentColor(hex: string): string {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return '#17130a'
  const [r, g, b] = m.slice(1).map((c) => {
    const v = parseInt(c, 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.22 ? '#141414' : '#ffffff'
}
