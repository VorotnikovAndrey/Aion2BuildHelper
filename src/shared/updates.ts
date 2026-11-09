// Обновления приложения: состояние для интерфейса и чистые помощники.
// Сама проверка и скачивание — в main (src/main/updater.ts, electron-updater).

export type UpdatePhase =
  /** Запущено не из установщика (npm run dev, ярлык разработчика) — обновлять нечего. */
  | 'unsupported'
  /** Ещё не проверяли с запуска. */
  | 'idle'
  | 'checking'
  /** Установлена последняя версия. */
  | 'latest'
  /** Есть новая версия, но автоскачивание выключено — ждём кнопку. */
  | 'available'
  | 'downloading'
  /** Скачано: установится при перезапуске (или при следующем закрытии). */
  | 'ready'
  | 'error'

export type UpdateErrorKind = 'offline' | 'auth' | 'noRelease' | 'other'

export interface UpdateState {
  phase: UpdatePhase
  /** Установленная версия. */
  current: string
  /** Новая версия (available / downloading / ready). */
  version?: string
  /** Что нового в новой версии — пункты списка обычным текстом. */
  notes?: string[]
  /** Доля скачанного, 0..1. */
  progress?: number
  /** Размер обновления в байтах (для «12 из 180 МБ»). */
  total?: number
  /** Когда последний раз успешно проверяли (ISO). */
  checkedAt?: string
  error?: { kind: UpdateErrorKind; message: string }
}

/** Как часто проверять обновления, пока приложение открыто. */
export const UPDATE_CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000
/** Первая проверка — не сразу при запуске, чтобы не мешать загрузке интерфейса. */
export const UPDATE_FIRST_CHECK_DELAY_MS = 15_000

/** Пора ли проверить снова: давно не проверяли (или ни разу). */
export function shouldCheck(checkedAt: string | undefined, now: number, intervalMs = UPDATE_CHECK_INTERVAL_MS): boolean {
  if (!checkedAt) return true
  const last = Date.parse(checkedAt)
  return !Number.isFinite(last) || now - last >= intervalMs
}

/** Сообщения сети и GitHub в понятную группу: «нет интернета», «доступ не дали», «версий ещё не выпускали» или прочее. */
export function classifyUpdateError(message: string): UpdateErrorKind {
  if (
    /ERR_INTERNET_DISCONNECTED|ERR_NAME_NOT_RESOLVED|ERR_NETWORK_CHANGED|ERR_CONNECTION|ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|ERR_TIMED_OUT/i.test(
      message
    )
  )
    return 'offline'
  // GitHub отказал в доступе (401/403) — например, ограничение запросов; проверяем раньше 404: в тексте есть и «Unable to find».
  if (/Bad credentials|HttpError: 40[13]\b|status(Code)?[ :=]+40[13]\b/i.test(message)) return 'auth'
  if (/No published versions|Unable to find latest version|latest\.yml|HttpError: 404|status(Code)?[ :=]+404|\b404\b/i.test(message)) return 'noRelease'
  return 'other'
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" }

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z0-9#]+);/gi, (m, name: string) => ENTITIES[name.toLowerCase()] ?? m)
}

/**
 * Описание выпуска → пункты обычным текстом. GitHub отдаёт описание выпуска HTML-ом
 * (Markdown уже превращён в разметку), другой сервер может отдать Markdown или список версий.
 * Показываем только текст: разметку из сети в интерфейс не вставляем.
 */
export function releaseNotesText(notes: string | { version: string; note: string | null }[] | null | undefined): string[] {
  if (!notes) return []
  if (Array.isArray(notes)) return notes.flatMap((n) => releaseNotesText(n.note))
  const text = notes
    .replace(/\r/g, '')
    // Конец пункта, абзаца, заголовка или строки — граница пункта.
    .replace(/<\/(li|p|h[1-6]|div)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
  return (
    decodeEntities(text)
      .split('\n')
      // Маркеры списка и заголовков Markdown, жирный шрифт.
      .map((line) =>
        line
          .replace(/^\s*(?:[-*•]|#{1,6}|\d+\.)\s+/, '')
          .replace(/\*\*(.+?)\*\*/g, '$1')
          .replace(/\s+/g, ' ')
          .trim()
      )
      .filter(Boolean)
  )
}
