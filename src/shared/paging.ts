// Постраничный показ длинных списков (лента изменений): срез страницы и номера страниц для переключателя.

export const PAGE_SIZES = [10, 25, 50, 100] as const
export const DEFAULT_PAGE_SIZE = 10

export interface Page<T> {
  items: T[]
  /** Текущая страница, 1…pages (выход за пределы поправлен). */
  page: number
  pages: number
  total: number
  /** Номера первой и последней записи на странице, с 1; при пустом списке — 0. */
  from: number
  to: number
}

/** Размер страницы из настроек: только из списка PAGE_SIZES, иначе по умолчанию. */
export function pageSizeOrDefault(v: unknown): number {
  return (PAGE_SIZES as readonly number[]).includes(v as number) ? (v as number) : DEFAULT_PAGE_SIZE
}

export function paginate<T>(all: T[], page: number, size: number): Page<T> {
  const total = all.length
  const pages = Math.max(1, Math.ceil(total / size))
  const p = Math.min(Math.max(1, Math.floor(page) || 1), pages)
  const start = (p - 1) * size
  const items = all.slice(start, start + size)
  return { items, page: p, pages, total, from: total ? start + 1 : 0, to: start + items.length }
}

/** Номера страниц для переключателя: первая, последняя и соседи текущей; пропуски — «…». */
export function pageWindow(page: number, pages: number, around = 1): (number | '…')[] {
  if (pages <= 1) return [1]
  const keep = new Set<number>([1, pages])
  for (let i = page - around; i <= page + around; i++) if (i >= 1 && i <= pages) keep.add(i)
  const sorted = [...keep].sort((a, b) => a - b)
  const out: (number | '…')[] = []
  sorted.forEach((n, i) => {
    const prev = sorted[i - 1]
    if (prev !== undefined && n - prev === 2) out.push(prev + 1)
    else if (prev !== undefined && n - prev > 2) out.push('…')
    out.push(n)
  })
  return out
}
