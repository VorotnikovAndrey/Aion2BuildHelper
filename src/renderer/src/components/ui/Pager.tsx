// Переключатель страниц длинного списка: «показано X–Y из N», номера страниц и размер страницы.

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PAGE_SIZES, pageWindow } from '@shared/paging'
import { cn, fmt } from '@/lib/format'
import { Segmented } from './misc'

export function Pager({
  page,
  pages,
  from,
  to,
  total,
  size,
  onPage,
  onSize,
  nouns = ['записи', 'записей']
}: {
  page: number
  pages: number
  from: number
  to: number
  total: number
  size: number
  onPage: (p: number) => void
  onSize: (s: number) => void
  /** Чего показано, после «из»: «из 21 записи», «из 57 записей». */
  nouns?: [string, string]
}) {
  if (!total) return null
  const btn = 'tnum flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs transition-colors'
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2">
      <span className="tnum text-xs text-ink-3">
        Показано {fmt(from)}–{fmt(to)} из {fmt(total)} {total % 10 === 1 && total % 100 !== 11 ? nouns[0] : nouns[1]}
      </span>
      {pages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Страницы">
          <button
            className={cn(btn, 'text-ink-2 hover:bg-surface-2 disabled:opacity-30')}
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            aria-label="Назад"
          >
            <ChevronLeft size={15} />
          </button>
          {pageWindow(page, pages).map((n, i) =>
            n === '…' ? (
              <span key={`gap-${i}`} className="px-1 text-xs text-ink-3">
                …
              </span>
            ) : (
              <button
                key={n}
                onClick={() => onPage(n)}
                aria-current={n === page ? 'page' : undefined}
                className={cn(btn, n === page ? 'bg-accent font-semibold text-on-accent' : 'text-ink-2 hover:bg-surface-2 hover:text-ink')}
              >
                {n}
              </button>
            )
          )}
          <button
            className={cn(btn, 'text-ink-2 hover:bg-surface-2 disabled:opacity-30')}
            disabled={page >= pages}
            onClick={() => onPage(page + 1)}
            aria-label="Вперёд"
          >
            <ChevronRight size={15} />
          </button>
        </nav>
      )}
      <span className="flex items-center gap-2 text-xs text-ink-3">
        на странице
        <Segmented value={String(size)} onChange={(v) => onSize(Number(v))} items={PAGE_SIZES.map((s) => ({ id: String(s), label: String(s) }))} />
      </span>
    </div>
  )
}
