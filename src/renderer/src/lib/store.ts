// Состояние интерфейса: данные оверлея, настройки, гайды и выбранный персонаж.
// Разбор персонажа по гайду (analyzeBuild) считается в хуке useReport — из этих данных.

import { create } from 'zustand'
import type { AppApi, CharacterPrefs, Settings, SourceState } from '@shared/api'
import { DEFAULT_SETTINGS } from '@shared/api'
import { BUILTIN_GUIDES } from '@shared/guide'
import type { Guide } from '@shared/guide/types'
import { normalizeUi, type UiPrefs } from '@shared/theme'
import type { Character } from '@shared/types'
import { applyCssZoom, applyMotion, applyTheme } from './theme'
import { createWebApi } from './webApi'

export const api: AppApi = window.api ?? createWebApi()
export const isWebMode = !window.api

interface AppState {
  ready: boolean
  source: SourceState | null
  settings: Settings
  /** Свои гайды (встроенные — в BUILTIN_GUIDES). */
  customGuides: Guide[]
  load(): Promise<void>
  reload(): Promise<void>
  setSource(s: SourceState): void
  updateSettings(patch: Partial<Settings>): Promise<void>
  updateCharacterPrefs(key: string, patch: Partial<CharacterPrefs>): Promise<void>
  /** Тема и масштаб: применяются сразу, сохраняются следом. */
  updateUi(patch: Partial<UiPrefs>): Promise<void>
  /** Масштаб поменяли с клавиатуры — только запомнить (окно уже отмасштабировано). */
  onZoomChanged(zoom: number): void
  saveGuide(g: Guide): Promise<Guide>
  removeGuide(id: string): Promise<void>
  importGuide(): Promise<Guide | null>
}

export const useApp = create<AppState>((set, get) => ({
  ready: false,
  source: null,
  settings: DEFAULT_SETTINGS,
  customGuides: [],
  async load() {
    const [source, loaded, customGuides] = await Promise.all([api.source.get(), api.settings.get(), api.guides.list()])
    const settings = { ...loaded, ui: normalizeUi(loaded.ui) }
    applyUi(settings.ui)
    set({ source, settings, customGuides, ready: true })
    api.source.onChange((s) => set({ source: s }))
  },
  async reload() {
    set({ source: await api.source.reload() })
  },
  setSource(s) {
    set({ source: s })
  },
  async updateSettings(patch) {
    set({ settings: { ...get().settings, ...patch } })
    set({ settings: await api.settings.update(patch) })
  },
  async updateUi(patch) {
    const ui = normalizeUi({ ...get().settings.ui, ...patch })
    applyUi(ui)
    set({ settings: { ...get().settings, ui } })
    set({ settings: await api.settings.updateUi(patch) })
  },
  onZoomChanged(zoom) {
    const s = get().settings
    set({ settings: { ...s, ui: { ...s.ui, zoom } } })
  },
  async updateCharacterPrefs(key, patch) {
    const all = get().settings.characters
    await get().updateSettings({ characters: { ...all, [key]: { ...all[key], ...patch } } })
  },
  async saveGuide(g) {
    const saved = await api.guides.save(g)
    set({ customGuides: [...get().customGuides.filter((x) => x.id !== saved.id), saved].sort((a, b) => a.name.localeCompare(b.name, 'ru')) })
    return saved
  },
  async removeGuide(id) {
    await api.guides.remove(id)
    set({ customGuides: get().customGuides.filter((x) => x.id !== id) })
  },
  async importGuide() {
    const g = await api.guides.importFile()
    if (g) set({ customGuides: [...get().customGuides, g] })
    return g
  }
}))

function applyUi(ui: UiPrefs) {
  applyTheme(ui)
  applyMotion(ui.motion)
  if (isWebMode) applyCssZoom(ui.zoom)
}

/** Все гайды: сначала свои, потом встроенные. */
export function useGuides(): Guide[] {
  const custom = useApp((s) => s.customGuides)
  return [...custom, ...BUILTIN_GUIDES]
}

/** Персонажи с подробными данными, без скрытых; сначала самые сильные. */
export function useCharacters(): Character[] {
  const source = useApp((s) => s.source)
  const hidden = useApp((s) => s.settings.hiddenCharacters)
  return (source?.data?.characters ?? []).filter((c) => !hidden.includes(c.key))
}

/** Выбранный персонаж: из настроек, иначе самый сильный. */
export function useCharacter(): Character | null {
  const chars = useCharacters()
  const active = useApp((s) => s.settings.activeCharacter)
  return chars.find((c) => c.key === active) ?? chars[0] ?? null
}

export function useCharacterPrefs(key: string | undefined): CharacterPrefs {
  const prefs = useApp((s) => (key ? s.settings.characters[key] : undefined))
  return prefs ?? {}
}

/** Гайд персонажа: выбранный в настройках, иначе первый подходящий по классу. */
export function useActiveGuide(char: Character | null): Guide | null {
  const guides = useGuides()
  const prefs = useCharacterPrefs(char?.key)
  if (!char) return null
  if (prefs.guideId === 'none') return null
  return guides.find((g) => g.id === prefs.guideId) ?? guides.find((g) => g.cls === char.cls) ?? null
}
