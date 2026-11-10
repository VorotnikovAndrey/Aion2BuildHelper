// Форматирование для интерфейса: числа и даты — по языку интерфейса (shared/i18n).

import { intlLocale, t, tn } from '@shared/i18n'

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

export const fmt = (n: number) => n.toLocaleString(intlLocale())

/** 132358 → «132,4K» — как в игре и оверлее. */
export function compact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toLocaleString(intlLocale(), { maximumFractionDigits: 2 }) + 'M'
  if (Math.abs(n) >= 10_000) return (n / 1000).toLocaleString(intlLocale(), { maximumFractionDigits: 1 }) + 'K'
  return fmt(n)
}

export const pct = (p: number, digits = 1) => (p * 100).toLocaleString(intlLocale(), { maximumFractionDigits: digits }) + '%'

export function dateTime(ms: number): string {
  return new Date(ms).toLocaleString(intlLocale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function dateOnly(ms: number): string {
  return new Date(ms).toLocaleDateString(intlLocale(), { day: 'numeric', month: 'long' })
}

/** «5 мин назад», «вчера в 20:15». */
export function ago(ms: number, now = Date.now()): string {
  const s = Math.round((now - ms) / 1000)
  if (s < 60) return t('только что')
  const m = Math.round(s / 60)
  if (m < 60) return tn(m, '{n} минуту назад|{n} минуты назад|{n} минут назад')
  const h = Math.round(m / 60)
  if (h < 24) return tn(h, '{n} час назад|{n} часа назад|{n} часов назад')
  const d = Math.round(h / 24)
  if (d === 1) return t('вчера')
  if (d < 30) return tn(d, '{n} день назад|{n} дня назад|{n} дней назад')
  return dateOnly(ms)
}
