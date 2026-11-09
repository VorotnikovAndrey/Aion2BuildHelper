// Реализация window.api для браузерного режима разработки (npm run dev:web).
// Данные персонажа отдаёт dev-сервер Vite (vite.web.config.mts) прямо из файла оверлея,
// настройки и гайды живут в localStorage. В собранном приложении этот код не используется.

import { DEFAULT_SETTINGS, type AppApi, type Settings, type SourceState } from '@shared/api'
import { normalizeGuide } from '@shared/guide'
import type { Guide } from '@shared/guide/types'
import { parseQuestlogCharacters } from '@shared/questlog/parse'
import { normalizeUi } from '@shared/theme'

const LS_SETTINGS = 'a2bh.settings'
const LS_GUIDES = 'a2bh.guides'

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
function store(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v))
  } catch {
    /* приватное окно */
  }
}

async function fetchSource(): Promise<SourceState> {
  try {
    const res = await fetch('/__dev/questlog')
    const path = res.headers.get('x-source-path') ?? 'characters.json'
    if (res.status === 404) return { path, custom: false, exists: false, data: null }
    const data = parseQuestlogCharacters(await res.json())
    return { path, custom: false, exists: true, data, readAt: Date.now(), modifiedAt: Number(res.headers.get('x-modified')) || undefined }
  } catch (e) {
    return { path: 'characters.json', custom: false, exists: false, data: null, error: String(e) }
  }
}

export function createWebApi(): AppApi {
  const listeners = new Set<(s: SourceState) => void>()
  return {
    source: {
      get: fetchSource,
      reload: async () => {
        const s = await fetchSource()
        listeners.forEach((l) => l(s))
        return s
      },
      pick: async () => null,
      reset: fetchSource,
      onChange(cb) {
        listeners.add(cb)
        return () => listeners.delete(cb)
      }
    },
    settings: {
      get: async () => ({ ...DEFAULT_SETTINGS, ...load<Partial<Settings>>(LS_SETTINGS, {}) }),
      update: async (patch) => {
        const next = { ...DEFAULT_SETTINGS, ...load<Partial<Settings>>(LS_SETTINGS, {}), ...patch }
        store(LS_SETTINGS, next)
        return next
      },
      updateUi: async (patch) => {
        const current = { ...DEFAULT_SETTINGS, ...load<Partial<Settings>>(LS_SETTINGS, {}) }
        const next = { ...current, ui: normalizeUi({ ...current.ui, ...patch }) }
        store(LS_SETTINGS, next)
        return next
      }
    },
    guides: {
      list: async () => load<Guide[]>(LS_GUIDES, []),
      save: async (g) => {
        const list = load<Guide[]>(LS_GUIDES, []).filter((x) => x.id !== g.id)
        const saved = { ...g, builtin: undefined, updatedAt: new Date().toISOString() }
        store(LS_GUIDES, [...list, saved])
        return saved
      },
      remove: async (id) =>
        store(
          LS_GUIDES,
          load<Guide[]>(LS_GUIDES, []).filter((x) => x.id !== id)
        ),
      importFile: () =>
        new Promise((resolve, reject) => {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = '.json,application/json'
          input.onchange = async () => {
            const file = input.files?.[0]
            if (!file) return resolve(null)
            try {
              const g = normalizeGuide(JSON.parse(await file.text()), `guide-${Date.now()}`)
              const saved = { ...g, id: `guide-${Date.now()}`, builtin: undefined }
              store(LS_GUIDES, [...load<Guide[]>(LS_GUIDES, []), saved])
              resolve(saved)
            } catch (e) {
              reject(e)
            }
          }
          input.click()
        }),
      exportFile: async (g) => {
        const { builtin: _b, ...rest } = g
        const a = document.createElement('a')
        a.href = URL.createObjectURL(new Blob([JSON.stringify(rest, null, 2)], { type: 'application/json' }))
        a.download = `${g.name}.json`
        a.click()
        return true
      }
    },
    history: {
      list: async (key) => {
        try {
          const res = await fetch(`/__dev/history?key=${encodeURIComponent(key)}`)
          return res.ok ? await res.json() : []
        } catch {
          return []
        }
      }
    },
    gamedata: {
      // В браузере чужой сайт не отдаст страницы (CORS) — проверка только в приложении.
      check: async () => {
        throw new Error('Проверка справочников работает только в приложении')
      },
      onProgress: () => () => undefined
    },
    app: {
      version: async () => __APP_VERSION__,
      openExternal: async (url) => void window.open(url, '_blank', 'noopener'),
      openDataFolder: async () => undefined,
      // В браузере масштабом управляет сам браузер (Ctrl +/−) — событий от приложения нет.
      onZoomChanged: () => () => undefined,
      // Снимок окна в браузере недоступен — интерфейс предлагает сделать скриншот.
      captureImage: async () => false
    }
  }
}
