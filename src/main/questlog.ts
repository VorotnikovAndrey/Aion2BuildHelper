// Источник данных — файл оверлея Questlog. Читаем его, следим за изменениями и пишем историю.
// Оверлей сам обновляет characters.json, пока игра запущена (обычно при смене зоны),
// поэтому приложению достаточно следить за файлом — никакой связи с игрой нет.

import { existsSync, watch, type FSWatcher } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import type { SourceState } from '@shared/api'
import { diffCharacters, summarize } from '@shared/analysis/history'
import { parseQuestlogCharacters } from '@shared/questlog/parse'
import type { Character } from '@shared/types'
import { appendHistory, getSettings, readSnapshot, writeSnapshot } from './storage'

export function defaultQuestlogPath(): string {
  const appData = process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming')
  return join(appData, 'Questlog', 'aion-2', 'characters.json')
}

let state: SourceState = { path: defaultQuestlogPath(), custom: false, exists: false, data: null }
const listeners = new Set<(s: SourceState) => void>()
let watcher: FSWatcher | null = null
let poll: NodeJS.Timeout | null = null
let debounce: NodeJS.Timeout | null = null

export const getSourceState = () => state
export const onSourceChange = (cb: (s: SourceState) => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export async function currentPath(): Promise<{ path: string; custom: boolean }> {
  const s = await getSettings()
  return s.questlogPath ? { path: s.questlogPath, custom: true } : { path: defaultQuestlogPath(), custom: false }
}

/** Прочитать файл заново. Ошибки разбора не роняют приложение — остаются последние хорошие данные. */
export async function reloadSource(): Promise<SourceState> {
  const { path, custom } = await currentPath()
  const next: SourceState = { ...state, path, custom, exists: existsSync(path), error: undefined }
  if (!next.exists) {
    state = { ...next, data: null, error: undefined }
    emit()
    return state
  }
  try {
    const [text, info] = await Promise.all([readFile(path, 'utf8'), stat(path)])
    const data = parseQuestlogCharacters(JSON.parse(text))
    state = { ...next, data, modifiedAt: info.mtimeMs, readAt: Date.now() }
    await recordHistory(data.characters).catch((e) => console.error('[history]', e))
  } catch (e) {
    // Оверлей мог писать файл прямо сейчас — следующая попытка через секунду обычно успешна.
    state = { ...next, error: e instanceof Error ? e.message : String(e) }
  }
  emit()
  return state
}

function emit() {
  for (const l of listeners) l(state)
}

/** Сравнить с прошлым снимком каждого персонажа и записать, что изменилось. */
async function recordHistory(chars: Character[]) {
  for (const char of chars) {
    const prev = await readSnapshot(char.key)
    if (prev && prev.updatedAt === char.updatedAt && JSON.stringify(prev) === JSON.stringify(char)) continue
    const changes = prev ? diffCharacters(prev, char) : []
    if (prev && !changes.length) {
      await writeSnapshot(char)
      continue
    }
    await appendHistory(char.key, { savedAt: Date.now(), summary: summarize(char), changes })
    await writeSnapshot(char)
  }
}

/** Следить за файлом: fs.watch на папку (оверлей пересоздаёт файл) + редкий опрос на всякий случай. */
export async function startWatching(): Promise<void> {
  stopWatching()
  const { path } = await currentPath()
  const dir = dirname(path)
  const schedule = () => {
    if (debounce) clearTimeout(debounce)
    debounce = setTimeout(() => void reloadSource(), 700)
  }
  if (existsSync(dir)) {
    try {
      watcher = watch(dir, (_event, file) => {
        if (!file || file.toString() === 'characters.json' || path.endsWith(file.toString())) schedule()
      })
    } catch (e) {
      console.warn('[questlog] fs.watch недоступен, остаётся опрос', e)
    }
  }
  let lastMtime = 0
  poll = setInterval(async () => {
    try {
      const m = (await stat(path)).mtimeMs
      if (lastMtime && m !== lastMtime && m !== state.modifiedAt) schedule()
      lastMtime = m
    } catch {
      if (state.exists) schedule()
    }
  }, 15_000)
  await reloadSource()
}

export function stopWatching(): void {
  watcher?.close()
  watcher = null
  if (poll) clearInterval(poll)
  poll = null
}
