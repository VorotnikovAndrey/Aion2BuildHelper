// Мелкие общие элементы: шапка страницы, пустое состояние, плитка с цифрой, вкладки, модальное окно.

import { createPortal } from 'react-dom'
import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HelpCircle, X } from 'lucide-react'
import { cn } from '@/lib/format'
import { Tooltip } from './InfoTip'
import { t } from '@shared/i18n'

export function PageHeader({ title, subtitle, actions, icon }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; icon?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
          {icon && <span className="text-accent">{icon}</span>}
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 max-w-3xl text-[13px] leading-relaxed text-ink-3">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface/50 px-6 py-14 text-center">
      {icon && <div className="mb-3 text-ink-3">{icon}</div>}
      <h3 className="text-base font-semibold">{title}</h3>
      {children && <div className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-3">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function StatTile({
  label,
  value,
  sub,
  hint,
  accent,
  valueClassName,
  onClick
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  /** Пояснение: показывается при наведении на всю плитку. */
  hint?: ReactNode
  accent?: boolean
  /** Цвет значения (например, по вердикту). */
  valueClassName?: string
  onClick?: () => void
}) {
  const Tag = onClick ? 'button' : 'div'
  const tile = (
    <Tag
      onClick={onClick}
      className={cn(
        'flex w-full min-w-0 flex-col rounded-xl border border-line bg-surface px-4 py-3 text-left',
        onClick && 'transition-colors hover:border-line-strong hover:bg-surface-2'
      )}
    >
      <span className="flex items-center gap-1 text-[11px] tracking-wide text-ink-3 uppercase">
        {label}
        {hint && <HelpCircle size={12} className="text-ink-3" />}
      </span>
      <span className={cn('tnum mt-1 truncate text-xl font-semibold', accent && 'text-accent', valueClassName)}>{value}</span>
      {sub && <span className="mt-0.5 truncate text-xs text-ink-3">{sub}</span>}
    </Tag>
  )
  return hint ? (
    <Tooltip content={hint} block>
      {tile}
    </Tooltip>
  ) : (
    tile
  )
}

export function Tabs<T extends string>({
  value,
  onChange,
  items
}: {
  value: T
  onChange: (v: T) => void
  items: { id: T; label: ReactNode; badge?: ReactNode; tip?: ReactNode }[]
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-line">
      {items.map((it) => (
        <Tooltip key={it.id} content={it.tip}>
          <button
            onClick={() => onChange(it.id)}
            className={cn(
              'relative -mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-[13px] transition-colors',
              value === it.id ? 'border-accent text-ink' : 'border-transparent text-ink-3 hover:text-ink-2'
            )}
          >
            {it.label}
            {it.badge}
          </button>
        </Tooltip>
      ))}
    </div>
  )
}

export function Segmented<T extends string>({
  value,
  onChange,
  items
}: {
  value: T
  onChange: (v: T) => void
  items: { id: T; label: ReactNode; tip?: ReactNode }[]
}) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
      {items.map((it) => (
        <SegmentButton key={it.id} tip={it.tip} active={value === it.id} onClick={() => onChange(it.id)}>
          {it.label}
        </SegmentButton>
      ))}
    </div>
  )
}

function SegmentButton({ tip, active, onClick, children }: { tip?: ReactNode; active: boolean; onClick: () => void; children: ReactNode }) {
  const btn = (
    <button
      onClick={onClick}
      className={cn('rounded-md px-3 py-1 text-xs transition-colors', active ? 'bg-surface-3 text-ink' : 'text-ink-3 hover:text-ink-2')}
    >
      {children}
    </button>
  )
  return tip ? <Tooltip content={tip}>{btn}</Tooltip> : btn
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  // Через портал в body: иначе «fixed» привязывается к анимированному контейнеру страницы, а не к окну.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className={cn(
              'flex max-h-full w-full flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-2xl',
              wide ? 'max-w-4xl' : 'max-w-lg'
            )}
            initial={{ y: 12, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 12, scale: 0.98 }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <h2 className="text-[15px] font-semibold">{title}</h2>
              <button onClick={onClose} className="rounded-md p-1 text-ink-3 hover:bg-surface-2 hover:text-ink" aria-label={t('Закрыть')}>
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/** Подпись-легенда под таблицей: цветные образцы и пояснения. */
export function Legend({ items }: { items: { swatch: ReactNode; text: string }[] }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-3">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {it.swatch}
          {it.text}
        </span>
      ))}
    </div>
  )
}
