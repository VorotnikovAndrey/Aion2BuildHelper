// Контракт между интерфейсом и main-процессом (window.api).
// В браузерном режиме разработки (npm run dev:web) тот же контракт реализует lib/webApi.ts.

import type { HistoryEntry } from './analysis/history'
import type { Guide } from './guide/types'
import type { NameMode, NameOverrides } from './names'
import { DEFAULT_UI, type UiPrefs } from './theme'
import type { QuestlogData } from './types'

export interface SourceState {
  /** Путь к characters.json оверлея. */
  path: string
  /** Путь выбран вручную (иначе — стандартный путь Questlog). */
  custom: boolean
  exists: boolean
  /** Когда файл последний раз менялся (мс). */
  modifiedAt?: number
  /** Когда приложение последний раз прочитало файл (мс). */
  readAt?: number
  data: QuestlogData | null
  error?: string
}

export interface CharacterPrefs {
  /** Какой гайд сейчас ведёт персонажа. */
  guideId?: string
  /** Специализации, отмеченные вручную: ID умения → номера вариантов. */
  manualSpecs?: Record<string, number[]>
  /** Отметки чек-листа гайда: ID пункта → сделано. */
  checklist?: Record<string, boolean>
  /** Свои задачи. */
  tasks?: { id: string; text: string; done?: boolean }[]
  /** Свои заметки. */
  notes?: string
}

export interface Settings {
  /** Свой путь к characters.json; пусто — стандартный путь Questlog. */
  questlogPath?: string
  activeCharacter?: string
  nameMode: NameMode
  names: NameOverrides
  characters: Record<string, CharacterPrefs>
  /** Скрытые персонажи (твинки, которых не нужно показывать). */
  hiddenCharacters: string[]
  /** Оформление: тема и масштаб. */
  ui: UiPrefs
  /** Сколько записей ленты изменений показывать на странице (10, 25, 50, 100). */
  historyPageSize?: number
}

export const DEFAULT_SETTINGS: Settings = {
  nameMode: 'both',
  names: {},
  characters: {},
  hiddenCharacters: [],
  ui: DEFAULT_UI
}

export interface AppApi {
  source: {
    get(): Promise<SourceState>
    reload(): Promise<SourceState>
    /** Выбрать characters.json вручную. null — пользователь передумал. */
    pick(): Promise<SourceState | null>
    /** Вернуться к стандартному пути. */
    reset(): Promise<SourceState>
    onChange(cb: (state: SourceState) => void): () => void
  }
  settings: {
    get(): Promise<Settings>
    update(patch: Partial<Settings>): Promise<Settings>
    /** Изменить оформление; масштаб применяется к окну сразу. */
    updateUi(patch: Partial<UiPrefs>): Promise<Settings>
  }
  guides: {
    /** Свои (сохранённые) гайды. Встроенные живут в коде (@shared/guide). */
    list(): Promise<Guide[]>
    save(guide: Guide): Promise<Guide>
    remove(id: string): Promise<void>
    /** Открыть JSON-файл гайда. null — отмена. Бросает ошибку с понятным текстом, если файл не гайд. */
    importFile(): Promise<Guide | null>
    exportFile(guide: Guide): Promise<boolean>
  }
  history: {
    list(characterKey: string): Promise<HistoryEntry[]>
  }
  app: {
    version(): Promise<string>
    openExternal(url: string): Promise<void>
    /** Открыть папку с данными приложения (настройки, гайды, история). */
    openDataFolder(): Promise<void>
    /** Масштаб поменяли с клавиатуры или колесом (Ctrl+колесо, Ctrl +/−/0). */
    onZoomChanged(cb: (zoom: number) => void): () => void
  }
}
