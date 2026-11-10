// Переключатель страниц длинного списка: «показано X–Y из N», номера страниц и размер страницы.

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PAGE_SIZES, pageWindow } from '@shared/paging'
import { cn, fmt } from '@/lib/format'
import { Segmented } from './misc'
import { t, tn } from '@shared/i18n'

export function Pager({
  page,
  pages,
  from,
  to,
  total,
  size,
  onPage,
  onSize
}: {
  page: number
  pages: number
  from: number
  to: number
  total: number
  size: number
  onPage: (p: number) => void
  onSize: (s: number) => void
}) {
  if (!total) return null
  const btn = 'tnum flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs transition-colors'
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2">
      <span className="tnum text-xs text-ink-3">
        {tn(total, 'Показано {from}–{to} из {n} записи|Показано {from}–{to} из {n} записей|Показано {from}–{to} из {n} записей', {
          from: fmt(from),
          to: fmt(to),
          n: fmt(total)
        })}
      </span>
      {pages > 1 && (
        <nav className="flex items-center gap-1" aria-label={t('Страницы')}>
          <button
            className={cn(btn, 'text-ink-2 hover:bg-surface-2 disabled:opacity-30')}
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            aria-label={t('Назад')}
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
            aria-label={t('Вперёд')}
          >
            <ChevronRight size={15} />
          </button>
        </nav>
      )}
      <span className="flex items-center gap-2 text-xs text-ink-3">
        {t('на странице')}
        <Segmented value={String(size)} onChange={(v) => onSize(Number(v))} items={PAGE_SIZES.map((s) => ({ id: String(s), label: String(s) }))} />
      </span>
    </div>
  )
}
