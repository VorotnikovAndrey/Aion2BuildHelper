// Локальное хранилище приложения: %APPDATA%/Aion2 Build Helper/
//   settings.json            — настройки
//   guides/<id>.json         — свои гайды
//   history/<персонаж>.json  — лента изменений персонажа
//   snapshots/<персонаж>.json — последний снимок персонажа (с ним сравнивается следующий)
// Почему JSON-файлы — см. docs/decisions/0002-local-json-storage.md.

import { app } from 'electron'
import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { DEFAULT_SETTINGS, type Settings } from '@shared/api'
import type { HistoryEntry } from '@shared/analysis/history'
import type { Guide } from '@shared/guide/types'
import { systemLocale } from '@shared/i18n'
import { normalizeUi, type UiPrefs } from '@shared/theme'
import type { Character } from '@shared/types'

export const dataDir = () => app.getPath('userData')
const settingsFile = () => join(dataDir(), 'settings.json')
const guidesDir = () => join(dataDir(), 'guides')
const historyDir = () => join(dataDir(), 'history')
const snapshotsDir = () => join(dataDir(), 'snapshots')

/** Имя файла из ключа персонажа «1310:Hero» — без запрещённых в Windows символов. */
const safe = (key: string) => key.replace(/[^\p{L}\p{N}_-]+/gu, '_')

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as T
  } catch {
    return null
  }
}

/** Запись через временный файл: при сбое посреди записи старый файл останется целым. */
async function writeJson(file: string, data: unknown): Promise<void> {
  await mkdir(join(file, '..'), { recursive: true })
  const tmp = `${file}.tmp`
  await writeFile(tmp, JSON.stringify(data, null, 2), 'utf8')
  await rename(tmp, file)
}

// ───────────────────────── Настройки ─────────────────────────

let settingsCache: Settings | null = null

export async function getSettings(): Promise<Settings> {
  if (!settingsCache) {
    const file = await readJson<Partial<Settings>>(settingsFile())
    // Первый запуск — язык системы (если он есть в приложении, иначе английский). У старых настроек без поля — русский.
    const saved = file ?? { ui: { ...DEFAULT_SETTINGS.ui, lang: systemLocale(app.getPreferredSystemLanguages()) } }
    // Оформление чиним по полям: в старом файле его может не быть совсем, в чужом — быть криво.
    settingsCache = { ...DEFAULT_SETTINGS, ...saved, ui: normalizeUi(saved.ui) }
  }
  return settingsCache
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await getSettings()), ...patch }
  settingsCache = next
  await writeJson(settingsFile(), next)
  return next
}

export async function updateUi(patch: Partial<UiPrefs>): Promise<Settings> {
  const current = await getSettings()
  return updateSettings({ ui: normalizeUi({ ...current.ui, ...patch }) })
}

// ───────────────────────── Гайды ─────────────────────────

export async function listGuides(): Promise<Guide[]> {
  await mkdir(guidesDir(), { recursive: true })
  const files = (await readdir(guidesDir())).filter((f) => f.endsWith('.json'))
  const guides = await Promise.all(files.map((f) => readJson<Guide>(join(guidesDir(), f))))
  return guides.filter((g): g is Guide => !!g && typeof g.id === 'string').sort((a, b) => a.name.localeCompare(b.name, 'ru'))
}

export async function saveGuide(guide: Guide): Promise<Guide> {
  const saved = { ...guide, builtin: undefined, updatedAt: new Date().toISOString() }
  await writeJson(join(guidesDir(), `${safe(guide.id)}.json`), saved)
  return saved
}

export async function removeGuide(id: string): Promise<void> {
  await rm(join(guidesDir(), `${safe(id)}.json`), { force: true })
}

// ───────────────────────── История ─────────────────────────

/** Сколько записей истории хранить на персонажа (примерно год активной игры). */
const HISTORY_LIMIT = 3000

export async function listHistory(key: string): Promise<HistoryEntry[]> {
  return (await readJson<HistoryEntry[]>(join(historyDir(), `${safe(key)}.json`))) ?? []
}

export async function appendHistory(key: string, entry: HistoryEntry): Promise<void> {
  const list = await listHistory(key)
  list.push(entry)
  await writeJson(join(historyDir(), `${safe(key)}.json`), list.slice(-HISTORY_LIMIT))
}

export async function readSnapshot(key: string): Promise<Character | null> {
  return readJson<Character>(join(snapshotsDir(), `${safe(key)}.json`))
}

export async function writeSnapshot(char: Character): Promise<void> {
  await writeJson(join(snapshotsDir(), `${safe(char.key)}.json`), char)
}
