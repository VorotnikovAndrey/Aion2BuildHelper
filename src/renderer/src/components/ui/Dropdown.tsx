// Выпадающая панель у кнопки. Рисуется в слое поверх страницы (портал в body): карточки с
// overflow: hidden (шапка «Обзора») её не обрезают. Закрывается кликом мимо и Esc; при прокрутке и смене
// размера окна едет за кнопкой, а если кнопка ушла с экрана — закрывается.

import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/format'

export function DropdownPanel({
  anchor,
  open,
  onClose,
  className,
  children
}: {
  anchor: RefObject<HTMLElement | null>
  open: boolean
  onClose: () => void
  className?: string
  children: ReactNode
}) {
  const [pos, setPos] = useState<{ top: number; right: number; maxHeight: number } | null>(null)
  const panel = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!open) return setPos(null)
    /** Позиция под кнопкой, по правому краю. false — кнопка ушла с экрана. */
    const place = (): boolean => {
      const el = anchor.current
      if (!el) return false
      const r = el.getBoundingClientRect()
      if (r.bottom < 0 || r.top > window.innerHeight) return false
      // В браузерном режиме масштаб — CSS zoom на <html>: координаты делим на него
      const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1
      setPos({
        top: (r.bottom + 4) / zoom,
        right: (window.innerWidth - r.right) / zoom,
        maxHeight: Math.max(160, (window.innerHeight - r.bottom - 16) / zoom)
      })
      return true
    }
    if (!place()) return onClose()
    const follow = (e: Event) => {
      // Прокрутка самой панели (длинный список стадий) её не двигает
      if (e.target instanceof Node && panel.current?.contains(e.target)) return
      if (!place()) onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('resize', follow)
    window.addEventListener('scroll', follow, true)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('resize', follow)
      window.removeEventListener('scroll', follow, true)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, anchor, onClose])

  if (!open || !pos) return null
  return createPortal(
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div
        ref={panel}
        style={{ top: pos.top, right: pos.right, maxHeight: pos.maxHeight }}
        className={cn('fixed z-50 animate-fade-in overflow-y-auto rounded-xl border border-line-strong bg-surface-2 p-1 shadow-xl shadow-black/50', className)}
      >
        {children}
      </div>
    </>,
    document.body
  )
}
