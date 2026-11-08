import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/format'

/** Значок «?» с пояснением при наведении. */
export function InfoTip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Tooltip content={children} className={className}>
      <HelpCircle size={14} className="text-ink-3 transition-colors hover:text-ink-2" />
    </Tooltip>
  )
}

const GAP = 8
const MARGIN = 8

/**
 * Подсказка при наведении. Рисуется поверх всего окна (портал в body), поэтому её не обрезают
 * края карточек и прокручиваемых списков; сама выбирает, показаться сверху или снизу.
 */
export function Tooltip({
  content,
  children,
  className,
  side = 'top',
  wide,
  block
}: {
  content: ReactNode
  children: ReactNode
  className?: string
  side?: 'top' | 'bottom'
  wide?: boolean
  /** Обёртка на всю ширину (для строк таблиц), а не по содержимому. */
  block?: boolean
}) {
  const anchor = useRef<HTMLSpanElement>(null)
  const tip = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const show = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(true), 120)
  }, [])
  const hide = useCallback(() => {
    clearTimeout(timer.current)
    setOpen(false)
    setPos(null)
  }, [])

  useLayoutEffect(() => {
    if (!open || !anchor.current || !tip.current) return
    const a = anchor.current.getBoundingClientRect()
    const t = tip.current.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    const vh = document.documentElement.clientHeight
    let top = side === 'top' ? a.top - t.height - GAP : a.bottom + GAP
    if (side === 'top' && top < MARGIN) top = a.bottom + GAP
    if (side === 'bottom' && top + t.height > vh - MARGIN) top = a.top - t.height - GAP
    const left = Math.min(Math.max(MARGIN, a.left + a.width / 2 - t.width / 2), vw - t.width - MARGIN)
    setPos({ left, top: Math.max(MARGIN, top) })
  }, [open, side])

  if (content === null || content === undefined || content === false || content === '') return <>{children}</>
  return (
    <span ref={anchor} className={cn(block ? 'flex' : 'inline-flex', className)} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {open &&
        createPortal(
          <div
            ref={tip}
            role="tooltip"
            style={{ left: pos?.left ?? -9999, top: pos?.top ?? -9999 }}
            className={cn(
              'pointer-events-none fixed z-[100] rounded-lg border border-line-strong bg-surface-3 px-3 py-2 text-left text-xs leading-relaxed font-normal tracking-normal text-ink-2 normal-case shadow-xl shadow-black/50',
              wide ? 'w-80' : 'max-w-72',
              pos ? 'animate-fade-in' : 'invisible'
            )}
          >
            {content}
          </div>,
          document.body
        )}
    </span>
  )
}
