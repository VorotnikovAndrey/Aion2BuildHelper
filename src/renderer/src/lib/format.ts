// Форматирование для интерфейса. Приложение русскоязычное — локаль ru-RU.

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

export const fmt = (n: number) => n.toLocaleString('ru-RU')

/** 132358 → «132,4K» — как в игре и оверлее. */
export function compact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toLocaleString('ru-RU', { maximumFractionDigits: 2 }) + 'M'
  if (Math.abs(n) >= 10_000) return (n / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + 'K'
  return fmt(n)
}

export const pct = (p: number, digits = 1) => (p * 100).toLocaleString('ru-RU', { maximumFractionDigits: digits }) + '%'

export function dateTime(ms: number): string {
  return new Date(ms).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function dateOnly(ms: number): string {
  return new Date(ms).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

/** «5 мин назад», «вчера в 20:15». */
export function ago(ms: number, now = Date.now()): string {
  const s = Math.round((now - ms) / 1000)
  if (s < 60) return 'только что'
  const m = Math.round(s / 60)
  if (m < 60) return `${m} ${plural(m, 'минуту', 'минуты', 'минут')} назад`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} ${plural(h, 'час', 'часа', 'часов')} назад`
  const d = Math.round(h / 24)
  if (d === 1) return 'вчера'
  if (d < 30) return `${d} ${plural(d, 'день', 'дня', 'дней')} назад`
  return dateOnly(ms)
}

export function plural(n: number, one: string, few: string, many: string): string {
  const a = Math.abs(n) % 100
  const b = a % 10
  if (a > 10 && a < 20) return many
  if (b > 1 && b < 5) return few
  if (b === 1) return one
  return many
}
