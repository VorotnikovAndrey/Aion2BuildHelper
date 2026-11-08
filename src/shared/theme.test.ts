import { describe, expect, it } from 'vitest'
import { clampZoom, DEFAULT_UI, normalizeUi, onAccentColor, stepZoom, THEME_BASES, THEME_PRESETS, ZOOM_MAX, ZOOM_MIN } from './theme'

describe('масштаб', () => {
  it('шагает по ступенькам и не выходит за края', () => {
    expect(stepZoom(1, 1)).toBe(1.1)
    expect(stepZoom(1, -1)).toBe(0.9)
    expect(stepZoom(1.13, 1)).toBe(1.25) // между ступеньками — к ближайшей следующей
    expect(stepZoom(ZOOM_MAX, 1)).toBe(ZOOM_MAX)
    expect(stepZoom(ZOOM_MIN, -1)).toBe(ZOOM_MIN)
  })

  it('ограничивает значение', () => {
    expect(clampZoom(5)).toBe(ZOOM_MAX)
    expect(clampZoom(0.1)).toBe(ZOOM_MIN)
    expect(clampZoom(1.234)).toBe(1.23)
    expect(clampZoom(NaN)).toBe(1)
  })
})

describe('темы', () => {
  it('у каждой готовой темы есть основа', () => {
    for (const p of THEME_PRESETS) expect(THEME_BASES.some((b) => b.id === p.base)).toBe(true)
    expect(new Set(THEME_PRESETS.map((p) => p.id)).size).toBe(THEME_PRESETS.length)
  })

  it('тема по умолчанию — золото на «Бездне», как было до появления тем', () => {
    expect(DEFAULT_UI).toMatchObject({ themeId: 'gold', base: 'abyss', accent: '#d9a441', zoom: 1 })
  })

  it('испорченные настройки чинятся', () => {
    expect(normalizeUi(undefined)).toEqual(DEFAULT_UI)
    expect(normalizeUi({ base: 'nope', accent: 'red', zoom: 9, themeId: 'custom' })).toEqual({ ...DEFAULT_UI, themeId: 'custom', zoom: ZOOM_MAX })
    expect(normalizeUi({ base: 'oled', accent: '#A3E635', zoom: 1.25 })).toMatchObject({ base: 'oled', accent: '#a3e635', zoom: 1.25 })
  })

  it('текст на акценте читается', () => {
    expect(onAccentColor('#d9a441')).toBe('#141414') // светлое золото — тёмный текст
    expect(onAccentColor('#6366f1')).toBe('#ffffff') // тёмный индиго — белый текст
  })
})
